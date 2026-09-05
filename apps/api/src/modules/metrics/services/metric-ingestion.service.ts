import {
    MetricRepository,
} from "../repositories/metric.repository.js";
import type {
    OtlpMetricDataPoint,
    OtlpMetricsRequest,
} from "../../telemetry/ingestion/otlp-metric.parser.js";

export type MetricIngestionResult = {
    metricCount: number;
    dataPointCount: number;
};

export class MetricIngestionService {
    constructor(
        private readonly metricRepository: MetricRepository,
    ) { }

    async ingest(
        projectId: string,
        payload: OtlpMetricsRequest,
    ): Promise<MetricIngestionResult> {
        const rows: Array<{
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
        }> = [];

        let metricCount = 0;

        for (const resourceMetrics of payload.resourceMetrics) {
            const resourceAttributes =
                resourceMetrics.resourceAttributes;

            const serviceName =
                this.getStringAttribute(
                    resourceAttributes,
                    "service.name",
                );

            const environment =
                this.getStringAttribute(
                    resourceAttributes,
                    "deployment.environment.name",
                ) ??
                this.getStringAttribute(
                    resourceAttributes,
                    "deployment.environment",
                );

            for (const metric of resourceMetrics.metrics) {
                metricCount += 1;

                for (const dataPoint of metric.dataPoints) {
                    const value = this.getDataPointValue(
                        dataPoint,
                    );

                    if (value === undefined) {
                        continue;
                    }

                    const timestamp =
                        this.getDataPointTimestamp(
                            dataPoint,
                        );

                    if (timestamp === undefined) {
                        continue;
                    }

                    rows.push({
                        projectId,
                        name: metric.name,
                        type: metric.type,
                        ...(metric.description !== undefined
                            ? {
                                description:
                                    metric.description,
                            }
                            : {}),
                        ...(metric.unit !== undefined
                            ? {
                                unit: metric.unit,
                            }
                            : {}),
                        ...(serviceName !== undefined
                            ? {
                                serviceName,
                            }
                            : {}),
                        ...(environment !== undefined
                            ? {
                                environment,
                            }
                            : {}),
                        value,
                        ...(dataPoint.attributes !== undefined
                            ? {
                                attributes:
                                    dataPoint.attributes,
                            }
                            : {}),
                        resourceAttributes,
                        timestamp,
                    });
                }
            }
        }

        await this.insertInChunks(rows);

        return {
            metricCount,
            dataPointCount: rows.length,
        };
    }

    private async insertInChunks(
        rows: Array<{
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
        const chunkSize = 1000;

        for (
            let offset = 0;
            offset < rows.length;
            offset += chunkSize
        ) {
            const chunk = rows.slice(
                offset,
                offset + chunkSize,
            );

            await this.metricRepository.insertDataPoints(
                chunk,
            );
        }
    }

    private getDataPointValue(
        dataPoint: OtlpMetricDataPoint,
    ): number | undefined {
        if (
            dataPoint.value !== undefined &&
            Number.isFinite(dataPoint.value)
        ) {
            return dataPoint.value;
        }

        if (
            dataPoint.sum !== undefined &&
            Number.isFinite(dataPoint.sum)
        ) {
            return dataPoint.sum;
        }

        if (dataPoint.count !== undefined) {
            const count = Number(dataPoint.count);

            if (Number.isFinite(count)) {
                return count;
            }
        }

        return undefined;
    }

    private getDataPointTimestamp(
        dataPoint: OtlpMetricDataPoint,
    ): Date | undefined {
        if (dataPoint.timestamp === undefined) {
            return undefined;
        }

        const [seconds, nanos] = dataPoint.timestamp;

        const milliseconds =
            seconds * 1000 +
            Math.floor(nanos / 1_000_000);

        const timestamp = new Date(milliseconds);

        if (Number.isNaN(timestamp.getTime())) {
            return undefined;
        }

        return timestamp;
    }

    private getStringAttribute(
        attributes: Record<string, unknown>,
        key: string,
    ): string | undefined {
        const value = attributes[key];

        return typeof value === "string" &&
            value.trim().length > 0
            ? value
            : undefined;
    }
}