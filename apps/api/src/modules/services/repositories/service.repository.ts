import {
    and,
    asc,
    desc,
    eq,
    gte,
    isNotNull,
    sql,
} from "drizzle-orm";

import { spans } from "@uptrace/db";
import { db } from "../../../db.js";

export type ServiceSummary = {
    name: string;
    requestCount: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    errorCount: number;
    errorRate: number;
    uptime: number;
    trend: "up" | "down" | "flat";
    trendValue: number;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
};

export type ServiceOperation = {
    name: string;
    requestCount: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    errorCount: number;
    errorRate: number;
};

export type ServiceTimeSeriesPoint = {
    timestamp: Date;
    requestCount: number;
    requestRate: number;
    averageLatencyMs: number;
    errorCount: number;
    errorRate: number;
};

export type ServiceTrace = {
    traceId: string;
    operationName: string;
    durationMs: number;
    status: "OK" | "ERROR" | "UNSET";
    startTime: Date;
};

export type ServiceDependency = {
    name: string;
    type: "service" | "database" | "http" | "messaging" | "unknown";
    requestCount: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    errorCount: number;
    errorRate: number;
    lastSeenAt: Date | null;
};

export type ServiceInstance = {
    id: string;
    hostName: string | null;
    hostId: string | null;
    environment: string | null;
    requestCount: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    errorCount: number;
    errorRate: number;
    lastSeenAt: Date | null;
};

export type ServiceDetail = {
    name: string;
    requestCount: number;
    requestRate: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    errorCount: number;
    errorRate: number;
    uptime: number;
    trend: "up" | "down" | "flat";
    trendValue: number;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
    operations: ServiceOperation[];
    timeSeries: ServiceTimeSeriesPoint[];
    recentTraces: ServiceTrace[];
    dependencies: ServiceDependency[];
    instances: ServiceInstance[];
};

export class ServiceRepository {
    async listByProject(
        projectId: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceSummary[]> {
        const now = new Date();

        // Default period: last 24 hours
        const currentStart =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const currentEnd =
            options?.endTime ?? now;

        // Same-duration period immediately
        // before the current period
        const periodDuration =
            currentEnd.getTime() -
            currentStart.getTime();

        const previousStart =
            new Date(
                currentStart.getTime() -
                periodDuration,
            );

        const previousEnd = currentStart;

        // Convert Date values used inside
        // raw SQL fragments to ISO strings.
        const currentEndIso =
            currentEnd.toISOString();

        const previousEndIso =
            previousEnd.toISOString();

        const conditions = [
            eq(spans.projectId, projectId),
            isNotNull(spans.serviceName),
            gte(
                spans.startTime,
                currentStart,
            ),
            sql`
                ${spans.startTime} <=
                ${currentEndIso}
            `,
        ];

        const result = await db
            .select({
                name: spans.serviceName,

                requestCount:
                    sql<number>`
                        count(*)::int
                    `.as("request_count"),

                averageLatencyMs:
                    sql<number>`
                        coalesce(
                            avg(
                                ${spans.durationMs}
                            ),
                            0
                        )
                    `.as(
                        "average_latency_ms",
                    ),

                p95LatencyMs:
                    sql<number>`
                        coalesce(
                            percentile_cont(0.95)
                            within group (
                                order by
                                ${spans.durationMs}
                            ),
                            0
                        )
                    `.as(
                        "p95_latency_ms",
                    ),

                errorCount:
                    sql<number>`
                        count(*) filter (
                            where
                            ${spans.status} = 'ERROR'
                        )::int
                    `.as("error_count"),

                uptime:
                    sql<number>`
                        coalesce(
                            (
                                count(*) filter (
                                    where
                                    ${spans.status} != 'ERROR'
                                )::numeric
                                /
                                nullif(count(*), 0)
                            ) * 100,
                            0
                        )
                    `.as("uptime"),

                errorRate:
                    sql<number>`
                        coalesce(
                            (
                                count(*) filter (
                                    where
                                    ${spans.status} = 'ERROR'
                                )::numeric
                                /
                                nullif(count(*), 0)
                            ) * 100,
                            0
                        )
                    `.as("error_rate"),

                firstSeenAt:
                    sql<Date | null>`
                        min(
                            ${spans.startTime}
                        )
                    `.as("first_seen_at"),

                lastSeenAt:
                    sql<Date | null>`
                        max(
                            ${spans.startTime}
                        )
                    `.as("last_seen_at"),
            })
            .from(spans)
            .where(
                and(...conditions),
            )
            .groupBy(
                spans.serviceName,
            )
            .orderBy(
                desc(
                    sql`count(*)`,
                ),
                asc(
                    spans.serviceName,
                ),
            );

        const previousResult =
            await db
                .select({
                    name: spans.serviceName,

                    requestCount:
                        sql<number>`
                            count(*)::int
                        `.as(
                            "request_count",
                        ),
                })
                .from(spans)
                .where(
                    and(
                        eq(
                            spans.projectId,
                            projectId,
                        ),
                        isNotNull(
                            spans.serviceName,
                        ),
                        gte(
                            spans.startTime,
                            previousStart,
                        ),
                        sql`
                            ${spans.startTime} <
                            ${previousEndIso}
                        `,
                    ),
                )
                .groupBy(
                    spans.serviceName,
                );

        const previousRequestCounts =
            new Map(
                previousResult.map(
                    (service) => [
                        service.name,
                        Number(
                            service.requestCount ??
                            0,
                        ),
                    ],
                ),
            );

        return result.map(
            (service) => {
                const requestCount =
                    Number(
                        service.requestCount ??
                        0,
                    );

                const previousRequestCount =
                    previousRequestCounts.get(
                        service.name,
                    ) ?? 0;

                let trendValue = 0;

                if (
                    previousRequestCount ===
                    0
                ) {
                    trendValue =
                        requestCount > 0
                            ? 100
                            : 0;
                } else {
                    trendValue =
                        (
                            (
                                requestCount -
                                previousRequestCount
                            ) /
                            previousRequestCount
                        ) *
                        100;
                }

                const trend =
                    trendValue > 0.01
                        ? "up"
                        : trendValue < -0.01
                            ? "down"
                            : "flat";

                return {
                    name: service.name,
                    requestCount,

                    averageLatencyMs:
                        Number(
                            service.averageLatencyMs ??
                            0,
                        ),

                    p95LatencyMs:
                        Number(
                            service.p95LatencyMs ??
                            0,
                        ),

                    errorCount:
                        Number(
                            service.errorCount ??
                            0,
                        ),

                    errorRate:
                        Number(
                            service.errorRate ??
                            0,
                        ),

                    uptime:
                        Number(
                            service.uptime ??
                            0,
                        ),

                    trend,
                    trendValue,

                    firstSeenAt:
                        service.firstSeenAt ??
                        null,

                    lastSeenAt:
                        service.lastSeenAt ??
                        null,
                };
            },
        );
    }

    /**
     * Get a single service summary.
     */
    async getServiceSummary(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceSummary | null> {
        const services =
            await this.listByProject(
                projectId,
                options,
            );

        return (
            services.find(
                (service) =>
                    service.name ===
                    serviceName,
            ) ?? null
        );
    }

    /**
     * Get operations/endpoints handled by a service.
     *
     * Each span name is treated as an operation.
     */
    async listOperations(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceOperation[]> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const endTimeIso =
            endTime.toISOString();

        const result = await db
            .select({
                name: spans.name,

                requestCount:
                    sql<number>`
                        count(*)::int
                    `.as("request_count"),

                averageLatencyMs:
                    sql<number>`
                        coalesce(
                            avg(
                                ${spans.durationMs}
                            ),
                            0
                        )
                    `.as(
                        "average_latency_ms",
                    ),

                p95LatencyMs:
                    sql<number>`
                        coalesce(
                            percentile_cont(0.95)
                            within group (
                                order by
                                ${spans.durationMs}
                            ),
                            0
                        )
                    `.as(
                        "p95_latency_ms",
                    ),

                errorCount:
                    sql<number>`
                        count(*) filter (
                            where
                            ${spans.status} = 'ERROR'
                        )::int
                    `.as("error_count"),

                errorRate:
                    sql<number>`
                        coalesce(
                            (
                                count(*) filter (
                                    where
                                    ${spans.status} = 'ERROR'
                                )::numeric
                                /
                                nullif(count(*), 0)
                            ) * 100,
                            0
                        )
                    `.as("error_rate"),
            })
            .from(spans)
            .where(
                and(
                    eq(
                        spans.projectId,
                        projectId,
                    ),

                    eq(
                        spans.serviceName,
                        serviceName,
                    ),

                    gte(
                        spans.startTime,
                        startTime,
                    ),

                    sql`
                        ${spans.startTime} <=
                        ${endTimeIso}
                    `,
                ),
            )
            .groupBy(
                spans.name,
            )
            .orderBy(
                desc(
                    sql`count(*)`,
                ),
                asc(
                    spans.name,
                ),
            );

        return result.map(
            (operation) => ({
                name:
                    operation.name ??
                    "unknown",

                requestCount:
                    Number(
                        operation.requestCount ??
                        0,
                    ),

                averageLatencyMs:
                    Number(
                        operation.averageLatencyMs ??
                        0,
                    ),

                p95LatencyMs:
                    Number(
                        operation.p95LatencyMs ??
                        0,
                    ),

                errorCount:
                    Number(
                        operation.errorCount ??
                        0,
                    ),

                errorRate:
                    Number(
                        operation.errorRate ??
                        0,
                    ),
            }),
        );
    }

    /**
 * Generate time-series data for the service.
 *
 * Bucket size is selected based on the
 * requested period.
 */
    async getTimeSeries(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceTimeSeriesPoint[]> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const durationMs =
            endTime.getTime() -
            startTime.getTime();

        let bucketSeconds: number;

        if (
            durationMs <=
            60 * 60 * 1000
        ) {
            bucketSeconds = 5 * 60;
        } else if (
            durationMs <=
            6 * 60 * 60 * 1000
        ) {
            bucketSeconds = 15 * 60;
        } else if (
            durationMs <=
            24 * 60 * 60 * 1000
        ) {
            bucketSeconds = 60 * 60;
        } else {
            bucketSeconds = 6 * 60 * 60;
        }

        /*
         * Keep the bucket size as a validated SQL literal.
         * This avoids binding the bucket size and Date origin
         * as PostgreSQL function parameters.
         */
        const bucketExpression =
            sql<Date>`
            to_timestamp(
                floor(
                    extract(
                        epoch from
                        ${spans.startTime}
                    ) /
                    ${sql.raw(
                String(bucketSeconds),
            )}
                ) *
                ${sql.raw(
                String(bucketSeconds),
            )}
            )
        `;

        const result = await db
            .select({
                timestamp:
                    bucketExpression.as(
                        "timestamp",
                    ),

                requestCount:
                    sql<number>`
                    count(*)::int
                `.as("request_count"),

                averageLatencyMs:
                    sql<number>`
                    coalesce(
                        avg(
                            ${spans.durationMs}
                        ),
                        0
                    )
                `.as(
                        "average_latency_ms",
                    ),

                errorCount:
                    sql<number>`
                    count(*) filter (
                        where
                            ${spans.status} = 'ERROR'
                    )::int
                `.as("error_count"),
            })
            .from(spans)
            .where(
                and(
                    eq(
                        spans.projectId,
                        projectId,
                    ),

                    eq(
                        spans.serviceName,
                        serviceName,
                    ),

                    gte(
                        spans.startTime,
                        startTime,
                    ),

                    sql`
                    ${spans.startTime} <=
                    ${endTime.toISOString()}
                `,
                ),
            )
            .groupBy(
                bucketExpression,
            )
            .orderBy(
                asc(
                    bucketExpression,
                ),
            );

        const bucketDurationSeconds =
            bucketSeconds;

        // Fill missing buckets with zero values so charts remain continuous
        // even when the service had no spans during part of the period.
        const bucketMap = new Map(
            result.map((point) => [
                new Date(point.timestamp).getTime(),
                point,
            ]),
        );

        const bucketSizeMs =
            bucketSeconds * 1000;

        const firstBucketMs =
            Math.floor(
                startTime.getTime() /
                    bucketSizeMs,
            ) * bucketSizeMs;

        const lastBucketMs =
            Math.floor(
                endTime.getTime() /
                    bucketSizeMs,
            ) * bucketSizeMs;

        const points: ServiceTimeSeriesPoint[] = [];

        for (
            let timestampMs = firstBucketMs;
            timestampMs <= lastBucketMs;
            timestampMs += bucketSizeMs
        ) {
            const point = bucketMap.get(timestampMs);

            const requestCount = Number(
                point?.requestCount ?? 0,
            );

            const errorCount = Number(
                point?.errorCount ?? 0,
            );

            const averageLatencyMs = Number(
                point?.averageLatencyMs ?? 0,
            );

            points.push({
                timestamp: new Date(timestampMs),
                requestCount,
                requestRate:
                    requestCount /
                    bucketDurationSeconds,
                averageLatencyMs,
                errorCount,
                errorRate:
                    requestCount === 0
                        ? 0
                        : (errorCount /
                              requestCount) *
                          100,
            });
        }

        return points;
    }

    /**
     * Get external/internal dependencies called by a service.
     *
     * Dependency identity is derived from standard OpenTelemetry span
     * attributes. We intentionally keep this query attribute-driven so no
     * additional database table is required for the service detail page.
     */
    async listDependencies(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceDependency[]> {
        const now = new Date();
        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                    24 * 60 * 60 * 1000,
            );
        const endTime =
            options?.endTime ?? now;
        const endTimeIso = endTime.toISOString();

        const dependencyName = sql<string | null>`
            coalesce(
                nullif(${spans.attributes}->>'peer.service', ''),
                nullif(${spans.attributes}->>'rpc.service', ''),
                nullif(${spans.attributes}->>'messaging.destination.name', ''),
                nullif(${spans.attributes}->>'server.address', ''),
                nullif(${spans.attributes}->>'url.domain', ''),
                nullif(${spans.attributes}->>'db.namespace', ''),
                nullif(${spans.attributes}->>'db.system', '')
            )
        `;

        const dependencyType = sql<string>`
            case
                when nullif(${spans.attributes}->>'db.system', '') is not null
                    or nullif(${spans.attributes}->>'db.namespace', '') is not null
                    then 'database'
                when nullif(${spans.attributes}->>'messaging.system', '') is not null
                    or nullif(${spans.attributes}->>'messaging.destination.name', '') is not null
                    then 'messaging'
                when nullif(${spans.attributes}->>'rpc.service', '') is not null
                    or nullif(${spans.attributes}->>'peer.service', '') is not null
                    then 'service'
                when nullif(${spans.attributes}->>'server.address', '') is not null
                    or nullif(${spans.attributes}->>'url.domain', '') is not null
                    then 'http'
                else 'unknown'
            end
        `;

        const result = await db
            .select({
                name: dependencyName.as("dependency_name"),
                type: dependencyType.as("dependency_type"),
                requestCount: sql<number>`
                    count(*)::int
                `.as("request_count"),
                averageLatencyMs: sql<number>`
                    coalesce(avg(${spans.durationMs}), 0)
                `.as("average_latency_ms"),
                p95LatencyMs: sql<number>`
                    coalesce(
                        percentile_cont(0.95)
                        within group (
                            order by ${spans.durationMs}
                        ),
                        0
                    )
                `.as("p95_latency_ms"),
                errorCount: sql<number>`
                    count(*) filter (
                        where ${spans.status} = 'ERROR'
                    )::int
                `.as("error_count"),
                errorRate: sql<number>`
                    coalesce(
                        (
                            count(*) filter (
                                where ${spans.status} = 'ERROR'
                            )::numeric /
                            nullif(count(*), 0)
                        ) * 100,
                        0
                    )
                `.as("error_rate"),
                lastSeenAt: sql<Date | null>`
                    max(${spans.startTime})
                `.as("last_seen_at"),
            })
            .from(spans)
            .where(
                and(
                    eq(spans.projectId, projectId),
                    eq(spans.serviceName, serviceName),
                    gte(spans.startTime, startTime),
                    sql`${spans.startTime} <= ${endTimeIso}`,
                    sql`${dependencyName} is not null`,
                    sql`${dependencyName} <> ${serviceName}`,
                    sql`
                        (
                            ${spans.kind} in (
                                '3',
                                'CLIENT',
                                '4',
                                'PRODUCER',
                                '5',
                                'CONSUMER'
                            )
                            or nullif(${spans.attributes}->>'peer.service', '') is not null
                            or nullif(${spans.attributes}->>'rpc.service', '') is not null
                            or nullif(${spans.attributes}->>'db.system', '') is not null
                            or nullif(${spans.attributes}->>'messaging.destination.name', '') is not null
                        )
                    `,
                ),
            )
            .groupBy(dependencyName, dependencyType)
            .orderBy(
                desc(sql`count(*)`),
                asc(dependencyName),
            );

        return result.map((dependency) => ({
            name: dependency.name ?? "unknown",
            type:
                dependency.type === "database" ||
                dependency.type === "http" ||
                dependency.type === "messaging" ||
                dependency.type === "service"
                    ? dependency.type
                    : "unknown",
            requestCount: Number(
                dependency.requestCount ?? 0,
            ),
            averageLatencyMs: Number(
                dependency.averageLatencyMs ?? 0,
            ),
            p95LatencyMs: Number(
                dependency.p95LatencyMs ?? 0,
            ),
            errorCount: Number(
                dependency.errorCount ?? 0,
            ),
            errorRate: Number(
                dependency.errorRate ?? 0,
            ),
            lastSeenAt:
                dependency.lastSeenAt ?? null,
        }));
    }

    /**
     * Get runtime instances from OpenTelemetry resource attributes.
     * service.instance.id is preferred, followed by host.name and host.id.
     */
    async listInstances(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceInstance[]> {
        const now = new Date();
        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                    24 * 60 * 60 * 1000,
            );
        const endTime =
            options?.endTime ?? now;
        const endTimeIso = endTime.toISOString();

        const instanceId = sql<string | null>`
            coalesce(
                nullif(${spans.resourceAttributes}->>'service.instance.id', ''),
                nullif(${spans.resourceAttributes}->>'host.name', ''),
                nullif(${spans.resourceAttributes}->>'host.id', '')
            )
        `;

        const hostName = sql<string | null>`
            nullif(${spans.resourceAttributes}->>'host.name', '')
        `;

        const hostId = sql<string | null>`
            nullif(${spans.resourceAttributes}->>'host.id', '')
        `;

        const environment = sql<string | null>`
            coalesce(
                nullif(${spans.resourceAttributes}->>'deployment.environment.name', ''),
                nullif(${spans.resourceAttributes}->>'deployment.environment', '')
            )
        `;

        const result = await db
            .select({
                id: instanceId.as("instance_id"),
                hostName: hostName.as("host_name"),
                hostId: hostId.as("host_id"),
                environment: environment.as("environment"),
                requestCount: sql<number>`
                    count(*)::int
                `.as("request_count"),
                averageLatencyMs: sql<number>`
                    coalesce(avg(${spans.durationMs}), 0)
                `.as("average_latency_ms"),
                p95LatencyMs: sql<number>`
                    coalesce(
                        percentile_cont(0.95)
                        within group (
                            order by ${spans.durationMs}
                        ),
                        0
                    )
                `.as("p95_latency_ms"),
                errorCount: sql<number>`
                    count(*) filter (
                        where ${spans.status} = 'ERROR'
                    )::int
                `.as("error_count"),
                errorRate: sql<number>`
                    coalesce(
                        (
                            count(*) filter (
                                where ${spans.status} = 'ERROR'
                            )::numeric /
                            nullif(count(*), 0)
                        ) * 100,
                        0
                    )
                `.as("error_rate"),
                lastSeenAt: sql<Date | null>`
                    max(${spans.startTime})
                `.as("last_seen_at"),
            })
            .from(spans)
            .where(
                and(
                    eq(spans.projectId, projectId),
                    eq(spans.serviceName, serviceName),
                    gte(spans.startTime, startTime),
                    sql`${spans.startTime} <= ${endTimeIso}`,
                    sql`${instanceId} is not null`,
                ),
            )
            .groupBy(
                instanceId,
                hostName,
                hostId,
                environment,
            )
            .orderBy(
                desc(sql`count(*)`),
                asc(instanceId),
            );

        return result.map((instance) => ({
            id: instance.id ?? "unknown",
            hostName: instance.hostName ?? null,
            hostId: instance.hostId ?? null,
            environment: instance.environment ?? null,
            requestCount: Number(
                instance.requestCount ?? 0,
            ),
            averageLatencyMs: Number(
                instance.averageLatencyMs ?? 0,
            ),
            p95LatencyMs: Number(
                instance.p95LatencyMs ?? 0,
            ),
            errorCount: Number(
                instance.errorCount ?? 0,
            ),
            errorRate: Number(
                instance.errorRate ?? 0,
            ),
            lastSeenAt:
                instance.lastSeenAt ?? null,
        }));
    }

    /**
     * Get recent traces associated with a service.
     *
     * Since traces are represented through spans,
     * we select one row per trace.
     */
    async listRecentTraces(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            limit?: number;
        },
    ): Promise<ServiceTrace[]> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const limit = Math.min(
            Math.max(options?.limit ?? 20, 1),
            100,
        );

        const endTimeIso =
            endTime.toISOString();

        /*
         * A trace can contain multiple spans.
         *
         * DISTINCT ON ensures that we return only
         * one span for each trace. We keep the
         * latest span for that trace.
         */
        const result = await db
            .selectDistinctOn([spans.traceId], {
                traceId: spans.traceId,

                operationName: spans.name,

                durationMs: spans.durationMs,

                status: spans.status,

                startTime: spans.startTime,
            })
            .from(spans)
            .where(
                and(
                    eq(
                        spans.projectId,
                        projectId,
                    ),

                    eq(
                        spans.serviceName,
                        serviceName,
                    ),

                    gte(
                        spans.startTime,
                        startTime,
                    ),

                    sql`
                    ${spans.startTime} <=
                    ${endTimeIso}
                `,
                ),
            )
            .orderBy(
                asc(spans.traceId),
                desc(spans.startTime),
            );

        /*
         * DISTINCT ON requires the traceId to be
         * the first ORDER BY expression.
         *
         * Sort again in application code so the
         * final result is ordered by newest trace.
         */
        return result
            .sort(
                (a, b) =>
                    b.startTime.getTime() -
                    a.startTime.getTime(),
            )
            .slice(0, limit)
            .map((trace) => ({
                traceId: trace.traceId,

                operationName:
                    trace.operationName ??
                    "unknown",

                durationMs: Number(
                    trace.durationMs ?? 0,
                ),

                status:
                    trace.status === "OK"
                        ? "OK"
                        : trace.status === "ERROR"
                            ? "ERROR"
                            : "UNSET",

                startTime: trace.startTime,
            }));
    }

    /**
     * Complete service detail payload.
     */
    async getServiceDetail(
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceDetail | null> {
        const summary =
            await this.getServiceSummary(
                projectId,
                serviceName,
                options,
            );

        if (!summary) {
            return null;
        }

        const [
            operations,
            timeSeries,
            recentTraces,
            dependencies,
            instances,
        ] = await Promise.all([
            this.listOperations(
                projectId,
                serviceName,
                options,
            ),

            this.getTimeSeries(
                projectId,
                serviceName,
                options,
            ),

            this.listRecentTraces(
                projectId,
                serviceName,
                {
                    ...options,
                    limit: 20,
                },
            ),

            this.listDependencies(
                projectId,
                serviceName,
                options,
            ),

            this.listInstances(
                projectId,
                serviceName,
                options,
            ),
        ]);

        const durationMs =
            (
                options?.endTime ??
                new Date()
            ).getTime() -
            (
                options?.startTime ??
                new Date(
                    Date.now() -
                    24 *
                    60 *
                    60 *
                    1000,
                )
            ).getTime();

        const durationSeconds =
            Math.max(
                durationMs / 1000,
                1,
            );

        return {
            name: summary.name,

            requestCount:
                summary.requestCount,

            requestRate:
                summary.requestCount /
                durationSeconds,

            averageLatencyMs:
                summary.averageLatencyMs,

            p95LatencyMs:
                summary.p95LatencyMs,

            errorCount:
                summary.errorCount,

            errorRate:
                summary.errorRate,

            uptime:
                summary.uptime,

            trend:
                summary.trend,

            trendValue:
                summary.trendValue,

            firstSeenAt:
                summary.firstSeenAt,

            lastSeenAt:
                summary.lastSeenAt,

            operations,

            timeSeries,

            recentTraces,

            dependencies,

            instances,
        };
    }
}