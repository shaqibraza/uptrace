import {
    LogRepository,
} from "../repositories/log.repository.js";

import type {
    OtlpLogsRequest,
    OtlpLogRecord,
} from "../../telemetry/ingestion/otlp-log.parser.js";

export type LogIngestionResult = {
    logCount: number;
    resourceCount: number;
};

export class LogIngestionService {
    constructor(
        private readonly logRepository: LogRepository,
    ) { }

    async ingest(
        projectId: string,
        payload: OtlpLogsRequest,
    ): Promise<LogIngestionResult> {
        if (!projectId) {
            throw new Error(
                "Project ID is required",
            );
        }

        const rows: Array<{
            projectId: string;
            timestamp: Date;
            observedTimestamp?: Date;
            severityNumber?: number;
            severityText?: string;
            body?: string;
            traceId?: string;
            spanId?: string;
            serviceName?: string;
            environment?: string;
            attributes?: Record<
                string,
                unknown
            >;
            resourceAttributes?: Record<
                string,
                unknown
            >;
            scopeName?: string;
            scopeVersion?: string;
        }> = [];

        let resourceCount = 0;

        for (const resourceLogs of payload.resourceLogs) {
            resourceCount++;

            const resourceAttributes =
                resourceLogs.resourceAttributes;

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

            for (const scopeLogs of resourceLogs.scopeLogs) {
                for (const logRecord of scopeLogs.logRecords) {
                    const row =
                        this.buildLogRow(
                            projectId,
                            logRecord,
                            resourceAttributes,
                            serviceName,
                            environment,
                            scopeLogs.scopeName,
                            scopeLogs.scopeVersion,
                        );

                    if (row) {
                        rows.push(row);
                    }
                }
            }
        }

        if (rows.length === 0) {
            return {
                logCount: 0,
                resourceCount,
            };
        }

        // Insert in chunks so a large OTLP payload
        // does not create an excessively large SQL query.
        const chunkSize = 1000;

        for (
            let index = 0;
            index < rows.length;
            index += chunkSize
        ) {
            const chunk = rows.slice(
                index,
                index + chunkSize,
            );

            await this.logRepository.insertLogs(
                chunk,
            );
        }

        return {
            logCount: rows.length,
            resourceCount,
        };
    }

    private buildLogRow(
        projectId: string,
        logRecord: OtlpLogRecord,
        resourceAttributes: Record<
            string,
            unknown
        >,
        serviceName?: string,
        environment?: string,
        scopeName?: string,
        scopeVersion?: string,
    ) {
        if (!logRecord.timestamp) {
            return null;
        }

        const timestamp =
            this.timestampToDate(
                logRecord.timestamp,
            );

        if (!timestamp) {
            return null;
        }

        const observedTimestamp =
            logRecord.observedTimestamp
                ? this.timestampToDate(
                    logRecord.observedTimestamp,
                )
                : undefined;

        return {
            projectId,
            timestamp,

            ...(observedTimestamp
                ? {
                    observedTimestamp,
                }
                : {}),

            ...(logRecord.severityNumber !==
                undefined
                ? {
                    severityNumber:
                        logRecord.severityNumber,
                }
                : {}),

            ...(logRecord.severityText
                ? {
                    severityText:
                        logRecord.severityText,
                }
                : {}),

            ...(logRecord.body !==
                undefined
                ? {
                    body: this.serializeBody(
                        logRecord.body,
                    ),
                }
                : {}),

            ...(logRecord.traceId
                ? {
                    traceId:
                        logRecord.traceId,
                }
                : {}),

            ...(logRecord.spanId
                ? {
                    spanId:
                        logRecord.spanId,
                }
                : {}),

            ...(serviceName
                ? {
                    serviceName,
                }
                : {}),

            ...(environment
                ? {
                    environment,
                }
                : {}),

            ...(Object.keys(
                logRecord.attributes ??
                {},
            ).length > 0
                ? {
                    attributes:
                        logRecord.attributes,
                }
                : {}),

            ...(Object.keys(
                resourceAttributes,
            ).length > 0
                ? {
                    resourceAttributes,
                }
                : {}),

            ...(scopeName
                ? {
                    scopeName,
                }
                : {}),

            ...(scopeVersion
                ? {
                    scopeVersion,
                }
                : {}),
        };
    }

    private timestampToDate(
        timestamp: [number, number],
    ): Date | null {
        const [seconds, nanos] =
            timestamp;

        if (
            !Number.isFinite(seconds) ||
            !Number.isFinite(nanos) ||
            seconds < 0 ||
            nanos < 0 ||
            nanos >= 1_000_000_000
        ) {
            return null;
        }

        const milliseconds =
            seconds * 1000 +
            Math.floor(nanos / 1_000_000);

        const date = new Date(
            milliseconds,
        );

        if (
            Number.isNaN(
                date.getTime(),
            )
        ) {
            return null;
        }

        return date;
    }

    private serializeBody(
        body: unknown,
    ): string {
        if (typeof body === "string") {
            return body;
        }

        if (
            body === null ||
            body === undefined
        ) {
            return "";
        }

        if (
            typeof body === "number" ||
            typeof body === "boolean" ||
            typeof body === "bigint"
        ) {
            return String(body);
        }

        try {
            return JSON.stringify(
                body,
            );
        } catch {
            return String(body);
        }
    }

    private getStringAttribute(
        attributes: Record<
            string,
            unknown
        >,
        key: string,
    ): string | undefined {
        const value =
            attributes[key];

        if (typeof value === "string") {
            return value;
        }

        if (
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            return String(value);
        }

        return undefined;
    }
}