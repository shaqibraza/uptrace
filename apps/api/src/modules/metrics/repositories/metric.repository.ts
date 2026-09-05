import {
    and,
    asc,
    desc,
    eq,
    gte,
    lte,
    sql,
} from "drizzle-orm";

import { metrics } from "@uptrace/db";
import { db } from "../../../db.js";

export type MetricType =
    | "Counter"
    | "Gauge"
    | "Histogram"
    | "unknown";

export type MetricSummary = {
    name: string;
    type: MetricType;
    description: string | null;
    unit: string | null;
    serviceName: string | null;
    environment: string | null;
    latestValue: number;
    dataPointCount: number;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
};

export type MetricDataPoint = {
    timestamp: Date;
    value: number;
};

export type MetricTimeSeriesPoint = {
    timestamp: Date;
    value: number;
    dataPointCount: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
};

export type MetricSource = {
    name: string;
    metricCount: number;
    dataPointCount: number;
};

export type MetricDetail = {
    name: string;
    type: MetricType;
    description: string | null;
    unit: string | null;
    serviceName: string | null;
    environment: string | null;
    latestValue: number;
    dataPointCount: number;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
    timeSeries: MetricTimeSeriesPoint[];
    dataPoints: MetricDataPoint[];
};

export class MetricRepository {
    /**
     * List all metrics available for a project.
     *
     * A metric is grouped by:
     * - name
     * - type
     * - unit
     * - service
     * - environment
     *
     * This allows the dashboard to treat each unique metric/dimension
     * combination as a separate metric series.
     */
    async listByProject(
        projectId: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            serviceName?: string;
            environment?: string;
            search?: string;
        },
    ): Promise<MetricSummary[]> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const conditions = [
            eq(metrics.projectId, projectId),
            gte(metrics.timestamp, startTime),
            lte(metrics.timestamp, endTime),
        ];

        if (options?.serviceName) {
            conditions.push(
                eq(
                    metrics.serviceName,
                    options.serviceName,
                ),
            );
        }

        if (options?.environment) {
            conditions.push(
                eq(
                    metrics.environment,
                    options.environment,
                ),
            );
        }

        if (options?.search) {
            conditions.push(
                sql`
                    ${metrics.name}
                    ILIKE
                    ${"%" + options.search + "%"}
                `,
            );
        }

        /*
         * DISTINCT metric metadata can exist across multiple datapoints.
         *
         * We aggregate all datapoints belonging to the same metric
         * identity and calculate the latest value separately.
         */
        const result = await db
            .select({
                name: metrics.name,

                type: metrics.type,

                description:
                    sql<string | null>`
                        max(${metrics.description})
                    `.as("description"),

                unit:
                    sql<string | null>`
                        max(${metrics.unit})
                    `.as("unit"),

                serviceName:
                    metrics.serviceName,

                environment:
                    metrics.environment,

                latestValue:
                    sql<number>`
                        (
                            array_agg(
                                ${metrics.value}
                                ORDER BY
                                ${metrics.timestamp} DESC
                            )
                        )[1]
                    `.as("latest_value"),

                dataPointCount:
                    sql<number>`
                        count(*)::int
                    `.as("data_point_count"),

                firstSeenAt:
                    sql<Date | null>`
                        min(${metrics.timestamp})
                    `.as("first_seen_at"),

                lastSeenAt:
                    sql<Date | null>`
                        max(${metrics.timestamp})
                    `.as("last_seen_at"),
            })
            .from(metrics)
            .where(and(...conditions))
            .groupBy(
                metrics.name,
                metrics.type,
                metrics.serviceName,
                metrics.environment,
            )
            .orderBy(
                desc(
                    sql`max(${metrics.timestamp})`,
                ),
                asc(metrics.name),
            );

        return result.map((metric) => ({
            name: metric.name,
            type: this.normalizeMetricType(
                metric.type,
            ),
            description:
                metric.description ?? null,
            unit:
                metric.unit ?? null,
            serviceName:
                metric.serviceName ?? null,
            environment:
                metric.environment ?? null,
            latestValue: Number(
                metric.latestValue ?? 0,
            ),
            dataPointCount: Number(
                metric.dataPointCount ?? 0,
            ),
            firstSeenAt:
                metric.firstSeenAt
                    ? new Date(metric.firstSeenAt)
                    : null,
            lastSeenAt:
                metric.lastSeenAt
                    ? new Date(metric.lastSeenAt)
                    : null,
        }));
    }

    /**
     * Get a single metric by name.
     *
     * When multiple services/environments emit the same metric name,
     * service/environment filters can be used to select the desired series.
     */
    async getMetric(
        projectId: string,
        metricName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            serviceName?: string;
            environment?: string;
        },
    ): Promise<MetricDetail | null> {
        const metricsList =
            await this.listByProject(
                projectId,
                options,
            );

        const matchingMetric =
            metricsList.find(
                (metric) =>
                    metric.name === metricName &&
                    (!options?.serviceName ||
                        metric.serviceName ===
                        options.serviceName) &&
                    (!options?.environment ||
                        metric.environment ===
                        options.environment),
            );

        if (!matchingMetric) {
            return null;
        }

        const [
            timeSeries,
            dataPoints,
        ] = await Promise.all([
            this.getTimeSeries(
                projectId,
                metricName,
                options,
            ),

            this.listDataPoints(
                projectId,
                metricName,
                options,
            ),
        ]);

        return {
            ...matchingMetric,
            timeSeries,
            dataPoints,
        };
    }

    /**
     * Get raw datapoints for a metric.
     *
     * The maximum number of datapoints returned is capped to prevent
     * accidentally loading an extremely large dataset.
     */
    async listDataPoints(
        projectId: string,
        metricName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            serviceName?: string;
            environment?: string;
            limit?: number;
        },
    ): Promise<MetricDataPoint[]> {
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
            Math.max(
                options?.limit ?? 1000,
                1,
            ),
            5000,
        );

        const conditions = [
            eq(metrics.projectId, projectId),
            eq(metrics.name, metricName),
            gte(metrics.timestamp, startTime),
            lte(metrics.timestamp, endTime),
        ];

        if (options?.serviceName) {
            conditions.push(
                eq(
                    metrics.serviceName,
                    options.serviceName,
                ),
            );
        }

        if (options?.environment) {
            conditions.push(
                eq(
                    metrics.environment,
                    options.environment,
                ),
            );
        }

        const result = await db
            .select({
                timestamp: metrics.timestamp,
                value: metrics.value,
            })
            .from(metrics)
            .where(and(...conditions))
            .orderBy(
                desc(metrics.timestamp),
            )
            .limit(limit);

        return result
            .reverse()
            .map((point) => ({
                timestamp: new Date(
                    point.timestamp,
                ),
                value: Number(point.value),
            }));
    }

    /**
     * Generate time-series data for a metric.
     *
     * Bucket size:
     * - <= 1 hour  -> 1 minute
     * - <= 6 hours -> 5 minutes
     * - <= 24 hours -> 15 minutes
     * - <= 7 days -> 1 hour
     * - > 7 days -> 6 hours
     */
    async getTimeSeries(
        projectId: string,
        metricName: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            serviceName?: string;
            environment?: string;
        },
    ): Promise<MetricTimeSeriesPoint[]> {
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
            bucketSeconds = 60;
        } else if (
            durationMs <=
            6 * 60 * 60 * 1000
        ) {
            bucketSeconds = 5 * 60;
        } else if (
            durationMs <=
            24 * 60 * 60 * 1000
        ) {
            bucketSeconds = 15 * 60;
        } else if (
            durationMs <=
            7 * 24 * 60 * 60 * 1000
        ) {
            bucketSeconds = 60 * 60;
        } else {
            bucketSeconds = 6 * 60 * 60;
        }

        const bucketExpression =
            sql<Date>`
                to_timestamp(
                    floor(
                        extract(
                            epoch from
                            ${metrics.timestamp}
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

        const conditions = [
            eq(metrics.projectId, projectId),
            eq(metrics.name, metricName),
            gte(metrics.timestamp, startTime),
            lte(metrics.timestamp, endTime),
        ];

        if (options?.serviceName) {
            conditions.push(
                eq(
                    metrics.serviceName,
                    options.serviceName,
                ),
            );
        }

        if (options?.environment) {
            conditions.push(
                eq(
                    metrics.environment,
                    options.environment,
                ),
            );
        }

        const result = await db
            .select({
                timestamp:
                    bucketExpression.as(
                        "timestamp",
                    ),

                dataPointCount:
                    sql<number>`
                        count(*)::int
                    `.as("data_point_count"),

                averageValue:
                    sql<number>`
                        coalesce(
                            avg(${metrics.value}),
                            0
                        )
                    `.as("average_value"),

                minValue:
                    sql<number>`
                        coalesce(
                            min(${metrics.value}),
                            0
                        )
                    `.as("min_value"),

                maxValue:
                    sql<number>`
                        coalesce(
                            max(${metrics.value}),
                            0
                        )
                    `.as("max_value"),
            })
            .from(metrics)
            .where(and(...conditions))
            .groupBy(bucketExpression)
            .orderBy(
                asc(bucketExpression),
            );

        /*
         * Build a map first so missing buckets can be filled.
         */
        const bucketMap = new Map(
            result.map((point) => [
                new Date(
                    point.timestamp,
                ).getTime(),
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

        const points: MetricTimeSeriesPoint[] =
            [];

        for (
            let timestampMs =
                firstBucketMs;
            timestampMs <= lastBucketMs;
            timestampMs += bucketSizeMs
        ) {
            const point =
                bucketMap.get(
                    timestampMs,
                );

            points.push({
                timestamp:
                    new Date(timestampMs),

                value: Number(
                    point?.averageValue ??
                    0,
                ),

                dataPointCount:
                    Number(
                        point?.dataPointCount ??
                        0,
                    ),

                averageValue:
                    Number(
                        point?.averageValue ??
                        0,
                    ),

                minValue: Number(
                    point?.minValue ?? 0,
                ),

                maxValue: Number(
                    point?.maxValue ?? 0,
                ),
            });
        }

        return points;
    }

    /**
     * Get aggregate project-level metric statistics.
     */
    async getSummary(
        projectId: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            serviceName?: string;
            environment?: string;
        },
    ): Promise<{
        activeMetrics: number;
        dataPoints: number;
        throughput: number;
        collectionDelayMs: number;
    }> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const durationSeconds =
            Math.max(
                (
                    endTime.getTime() -
                    startTime.getTime()
                ) / 1000,
                1,
            );

        const conditions = [
            eq(metrics.projectId, projectId),
            gte(metrics.timestamp, startTime),
            lte(metrics.timestamp, endTime),
        ];

        if (options?.serviceName) {
            conditions.push(
                eq(
                    metrics.serviceName,
                    options.serviceName,
                ),
            );
        }

        if (options?.environment) {
            conditions.push(
                eq(
                    metrics.environment,
                    options.environment,
                ),
            );
        }

        const [result] = await db
            .select({
                activeMetrics:
                    sql<number>`
                        count(
                            distinct
                            ${metrics.name}
                        )::int
                    `.as("active_metrics"),

                dataPoints:
                    sql<number>`
                        count(*)::int
                    `.as("data_points"),

                latestTimestamp:
                    sql<Date | string | null>`
                        max(${metrics.timestamp})
                    `.as("latest_timestamp"),
            })
            .from(metrics)
            .where(and(...conditions));

        const dataPoints = Number(
            result?.dataPoints ?? 0,
        );

        const rawLatestTimestamp =
            result?.latestTimestamp ??
            null;

        /*
         * PostgreSQL/Drizzle can return aggregate timestamp
         * expressions such as MAX(timestamp) as a string at runtime,
         * even though the selected TypeScript type is Date.
         *
         * Normalize the value explicitly before calling getTime().
         */
        const latestTimestamp =
            rawLatestTimestamp
                ? new Date(
                    rawLatestTimestamp,
                )
                : null;

        const collectionDelayMs =
            latestTimestamp &&
                !Number.isNaN(
                    latestTimestamp.getTime(),
                )
                ? Math.max(
                    now.getTime() -
                    latestTimestamp.getTime(),
                    0,
                )
                : 0;

        return {
            activeMetrics: Number(
                result?.activeMetrics ?? 0,
            ),

            dataPoints,

            throughput:
                dataPoints /
                durationSeconds,

            collectionDelayMs,
        };
    }

    /**
     * List metric sources.
     *
     * A source is represented by serviceName.
     * Metrics without a service are grouped under "unknown".
     */
    async listSources(
        projectId: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
            environment?: string;
        },
    ): Promise<MetricSource[]> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const conditions = [
            eq(metrics.projectId, projectId),
            gte(metrics.timestamp, startTime),
            lte(metrics.timestamp, endTime),
        ];

        if (options?.environment) {
            conditions.push(
                eq(
                    metrics.environment,
                    options.environment,
                ),
            );
        }

        const sourceName = sql<string>`
            coalesce(
                nullif(
                    ${metrics.serviceName},
                    ''
                ),
                'unknown'
            )
        `;

        const result = await db
            .select({
                name: sourceName.as(
                    "source_name",
                ),

                metricCount:
                    sql<number>`
                        count(
                            distinct
                            ${metrics.name}
                        )::int
                    `.as("metric_count"),

                dataPointCount:
                    sql<number>`
                        count(*)::int
                    `.as("data_point_count"),
            })
            .from(metrics)
            .where(and(...conditions))
            .groupBy(sourceName)
            .orderBy(
                desc(
                    sql`count(*)`,
                ),
                asc(sourceName),
            );

        return result.map((source) => ({
            name:
                source.name ?? "unknown",

            metricCount: Number(
                source.metricCount ?? 0,
            ),

            dataPointCount: Number(
                source.dataPointCount ?? 0,
            ),
        }));
    }

    private normalizeMetricType(
        type: string | null,
    ): MetricType {
        if (!type) {
            return "unknown";
        }

        const normalized =
            type.toLowerCase();

        switch (normalized) {
            case "counter":
                return "Counter";

            case "gauge":
                return "Gauge";

            case "histogram":
                return "Histogram";

            default:
                return "unknown";
        }
    }

    async insertDataPoints(
        dataPoints: Array<{
            projectId: string;
            name: string;
            type: string;
            description?: string;
            unit?: string;
            serviceName?: string;
            environment?: string;
            value: number;
            attributes?: Record<string, unknown>;
            resourceAttributes?: Record<string, unknown>;
            timestamp: Date;
        }>,
    ): Promise<void> {
        if (dataPoints.length === 0) {
            return;
        }

        await db.insert(metrics).values(
            dataPoints.map((dataPoint) => ({
                projectId:
                    dataPoint.projectId,

                name: dataPoint.name,

                type: dataPoint.type,

                ...(dataPoint.description !==
                    undefined
                    ? {
                        description:
                            dataPoint.description,
                    }
                    : {}),

                ...(dataPoint.unit !==
                    undefined
                    ? {
                        unit:
                            dataPoint.unit,
                    }
                    : {}),

                ...(dataPoint.serviceName !==
                    undefined
                    ? {
                        serviceName:
                            dataPoint.serviceName,
                    }
                    : {}),

                ...(dataPoint.environment !==
                    undefined
                    ? {
                        environment:
                            dataPoint.environment,
                    }
                    : {}),

                value: dataPoint.value,

                ...(dataPoint.attributes !==
                    undefined
                    ? {
                        attributes:
                            dataPoint.attributes,
                    }
                    : {}),

                ...(dataPoint.resourceAttributes !==
                    undefined
                    ? {
                        resourceAttributes:
                            dataPoint.resourceAttributes,
                    }
                    : {}),

                timestamp:
                    dataPoint.timestamp,
            })),
        );
    }
}