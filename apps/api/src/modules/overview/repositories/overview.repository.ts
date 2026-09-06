import {
    and,
    desc,
    eq,
    gte,
    lte,
    sql,
} from "drizzle-orm";

import { spans, traces } from "@uptrace/db";
import { db } from "../../../db.js";

export type OverviewTimeRange = {
    startTime?: Date;
    endTime?: Date;
};

export type OverviewSummary = {
    requestRate: number;
    p95Latency: number;
    errorRate: number;
    activeServices: number;
};

export type OverviewServiceHealth = {
    name: string;
    requestCount: number;
    averageLatencyMs: number;
    errorCount: number;
    errorRate: number;
    status: "Healthy" | "Degraded";
};

export type OverviewErrorSummary = {
    endpoint: string;
    count: number;
    percentage: number;
};

export type OverviewData = {
    summary: OverviewSummary;
    services: OverviewServiceHealth[];
    errorSummary: OverviewErrorSummary[];
};

export class OverviewRepository {
    private resolveTimeRange(
        options: OverviewTimeRange = {},
    ) {
        const endTime =
            options.endTime ?? new Date();

        const startTime =
            options.startTime ??
            new Date(
                endTime.getTime() -
                    24 * 60 * 60 * 1000,
            );

        return {
            startTime,
            endTime,
        };
    }

    async getSummary(
        projectId: string,
        options: OverviewTimeRange = {},
    ): Promise<OverviewSummary> {
        const {
            startTime,
            endTime,
        } = this.resolveTimeRange(options);

        const durationSeconds = Math.max(
            (endTime.getTime() -
                startTime.getTime()) /
                1000,
            1,
        );

        const [result] = await db
            .select({
                totalRequests: sql<number>`
                    count(*)
                `.as("total_requests"),

                errorRequests: sql<number>`
                    count(*) filter (
                        where ${traces.status} = 'ERROR'
                    )
                `.as("error_requests"),

                p95Latency: sql<number | null>`
                    percentile_cont(0.95)
                    within group (
                        order by ${traces.durationMs}
                    )
                `.as("p95_latency"),

                activeServices: sql<number>`
                    count(
                        distinct ${traces.serviceName}
                    )
                `.as("active_services"),
            })
            .from(traces)
            .where(
                and(
                    eq(
                        traces.projectId,
                        projectId,
                    ),
                    gte(
                        traces.startTime,
                        startTime,
                    ),
                    lte(
                        traces.startTime,
                        endTime,
                    ),
                ),
            );

        const totalRequests = Number(
            result?.totalRequests ?? 0,
        );

        const errorRequests = Number(
            result?.errorRequests ?? 0,
        );

        const p95Latency = Number(
            result?.p95Latency ?? 0,
        );

        const activeServices = Number(
            result?.activeServices ?? 0,
        );

        const requestRate =
            totalRequests /
            durationSeconds;

        const errorRate =
            totalRequests > 0
                ? (errorRequests /
                      totalRequests) *
                  100
                : 0;

        return {
            requestRate,
            p95Latency,
            errorRate,
            activeServices,
        };
    }

    async listServiceHealth(
        projectId: string,
        options: OverviewTimeRange = {},
    ): Promise<OverviewServiceHealth[]> {
        const {
            startTime,
            endTime,
        } = this.resolveTimeRange(options);

        const rows = await db
            .select({
                name: traces.serviceName,

                requestCount: sql<number>`
                    count(*)
                `.as("request_count"),

                averageLatencyMs:
                    sql<number | null>`
                        avg(
                            ${traces.durationMs}
                        )
                    `.as(
                        "average_latency_ms",
                    ),

                errorCount: sql<number>`
                    count(*) filter (
                        where ${traces.status} = 'ERROR'
                    )
                `.as("error_count"),
            })
            .from(traces)
            .where(
                and(
                    eq(
                        traces.projectId,
                        projectId,
                    ),
                    gte(
                        traces.startTime,
                        startTime,
                    ),
                    lte(
                        traces.startTime,
                        endTime,
                    ),
                ),
            )
            .groupBy(
                traces.serviceName,
            )
            .orderBy(
                desc(
                    sql`count(*)`,
                ),
            );

        return rows.map((row) => {
            const requestCount =
                Number(
                    row.requestCount ?? 0,
                );

            const errorCount =
                Number(
                    row.errorCount ?? 0,
                );

            const averageLatencyMs =
                Number(
                    row.averageLatencyMs ??
                        0,
                );

            const errorRate =
                requestCount > 0
                    ? (errorCount /
                          requestCount) *
                      100
                    : 0;

            return {
                name: row.name,
                requestCount,
                averageLatencyMs,
                errorCount,
                errorRate,
                status:
                    errorRate >= 5
                        ? "Degraded"
                        : "Healthy",
            };
        });
    }

    async getErrorSummary(
        projectId: string,
        options: OverviewTimeRange = {},
    ): Promise<OverviewErrorSummary[]> {
        const {
            startTime,
            endTime,
        } = this.resolveTimeRange(options);

        const rows = await db
            .select({
                endpoint: sql<string>`
                    coalesce(
                        max(
                            case
                                when ${spans.parentSpanId} is null
                                then ${spans.name}
                                else null
                            end
                        ),
                        max(${spans.name}),
                        'Unknown'
                    )
                `.as("endpoint"),

                count: sql<number>`
                    count(distinct ${traces.traceId})
                `.as("error_count"),
            })
            .from(traces)
            .leftJoin(
                spans,
                and(
                    eq(
                        spans.projectId,
                        traces.projectId,
                    ),
                    eq(
                        spans.traceId,
                        traces.traceId,
                    ),
                ),
            )
            .where(
                and(
                    eq(
                        traces.projectId,
                        projectId,
                    ),
                    eq(
                        traces.status,
                        "ERROR",
                    ),
                    gte(
                        traces.startTime,
                        startTime,
                    ),
                    lte(
                        traces.startTime,
                        endTime,
                    ),
                ),
            )
            .groupBy(
                traces.traceId,
            );

        const grouped =
            new Map<
                string,
                number
            >();

        for (const row of rows) {
            const endpoint =
                row.endpoint?.trim() ||
                "Unknown";

            const count =
                Number(row.count ?? 0);

            grouped.set(
                endpoint,
                (grouped.get(endpoint) ??
                    0) + count,
            );
        }

        const totalErrors =
            Array.from(
                grouped.values(),
            ).reduce(
                (total, count) =>
                    total + count,
                0,
            );

        return Array.from(
            grouped.entries(),
        )
            .map(
                ([
                    endpoint,
                    count,
                ]) => ({
                    endpoint,
                    count,
                    percentage:
                        totalErrors > 0
                            ? (count /
                                  totalErrors) *
                              100
                            : 0,
                }),
            )
            .sort(
                (a, b) =>
                    b.count - a.count,
            )
            .slice(0, 5);
    }

    async getOverview(
        projectId: string,
        options: OverviewTimeRange = {},
    ): Promise<OverviewData> {
        const [
            summary,
            services,
            errorSummary,
        ] = await Promise.all([
            this.getSummary(
                projectId,
                options,
            ),
            this.listServiceHealth(
                projectId,
                options,
            ),
            this.getErrorSummary(
                projectId,
                options,
            ),
        ]);

        return {
            summary,
            services,
            errorSummary,
        };
    }
}