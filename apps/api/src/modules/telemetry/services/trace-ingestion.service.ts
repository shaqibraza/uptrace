import { AppError } from "../../../core/errors/app-error.js";
import { SpanRepository } from "../repositories/span.repository.js";
import { TraceRepository } from "../repositories/trace.repository.js";
import type { OtlpTraceRequest } from "../ingestion/otlp-trace.parser.js";


export class TraceIngestionService {
    constructor(
        private readonly traceRepository: TraceRepository,
        private readonly spanRepository: SpanRepository,
    ) { }

    async ingest(
        projectId: string,
        payload: OtlpTraceRequest
    ) {
        let traceCount = 0;
        let spanCount = 0;

        for (const resourceSpan of payload.resourceSpans ?? []) {
            const resourceAttributes =
                this.attributesToObject(
                    resourceSpan.resource?.attributes,
                );

            const serviceName =
                this.getStringAttribute(
                    resourceAttributes,
                    "service.name",
                ) ?? "unknown-service";

            const environment =
                this.getStringAttribute(
                    resourceAttributes,
                    "deployment.environment.name",
                ) ??
                this.getStringAttribute(
                    resourceAttributes,
                    "deployment.environment",
                );

            for (
                const scopeSpan of resourceSpan.scopeSpans ?? []
            ) {
                for (
                    const span of scopeSpan.spans ?? []
                ) {
                    const traceId =
                        this.bytesToHex(span.traceId);

                    const spanId =
                        this.bytesToHex(span.spanId);

                    if (!traceId || !spanId) {
                        continue;
                    }

                    const startTime =
                        this.hrTimeToDate(
                            span.startTime,
                        );

                    const endTime = span.endTime
                        ? this.hrTimeToDate(
                            span.endTime,
                        )
                        : null;

                    const durationMs =
                        endTime
                            ? Math.max(
                                0,
                                endTime.getTime() -
                                startTime.getTime(),
                            )
                            : null;

                    const spanServiceName =
                        this.getStringAttribute(
                            this.attributesToObject(
                                span.attributes,
                            ),
                            "service.name",
                        ) ?? serviceName;

                    const status =
                        this.mapSpanStatus(
                            span.status?.code,
                        );

                    const trace =
                        await this.traceRepository.upsert({
                            projectId,
                            traceId,
                            serviceName: spanServiceName,
                            environment: environment ?? null,
                            startTime,
                            endTime,
                            durationMs,
                            status,
                        });

                    await this.spanRepository.upsert({
                        projectId,
                        traceId,
                        spanId,
                        parentSpanId:
                            this.bytesToHex(
                                span.parentSpanId,
                            ) || null,
                        traceRecordId: trace.id,
                        serviceName:
                            spanServiceName,
                        name:
                            span.name ??
                            "unknown-span",
                        kind: String(
                            span.kind ?? 0,
                        ),
                        startTime,
                        endTime,
                        durationMs,
                        status,
                        statusMessage:
                            span.status?.message ||
                            null,
                        attributes:
                            this.attributesToObject(
                                span.attributes,
                            ),
                        resourceAttributes,
                        events:
                            span.events?.map(
                                (event) => ({
                                    name: event.name,
                                    time:
                                        event.time
                                            ? this.hrTimeToDate(
                                                event.time,
                                            ).toISOString()
                                            : null,
                                    attributes:
                                        this.attributesToObject(
                                            event.attributes,
                                        ),
                                }),
                            ) ?? [],
                    });

                    traceCount++;
                    spanCount++;
                }
            }
        }

        return {
            traceCount,
            spanCount,
        };
    }

    private bytesToHex(
        value:
            | Uint8Array
            | number[]
            | undefined,
    ) {
        if (!value || value.length === 0) {
            return "";
        }

        return Buffer.from(value).toString("hex");
    }

    private hrTimeToDate(
        value:
            | [number, number]
            | undefined,
    ) {
        if (!value) {
            throw new AppError(
                "Invalid OTLP timestamp",
                400,
                "INVALID_OTLP_TIMESTAMP",
            );
        }

        const [seconds, nanos] = value;

        return new Date(
            Number(seconds) * 1000 +
            Math.floor(nanos / 1_000_000),
        );
    }

    private attributesToObject(
        attributes:
            | Array<{
                key: string;
                value?: unknown;
            }>
            | undefined,
    ) {
        if (!attributes) {
            return {};
        }

        const result: Record<string, unknown> = {};

        for (const attribute of attributes) {
            result[attribute.key] =
                this.attributeValueToPrimitive(
                    attribute.value,
                );
        }

        return result;
    }

    private attributeValueToPrimitive(
        value: unknown,
    ): unknown {
        if (!value || typeof value !== "object") {
            return value ?? null;
        }

        const item = value as Record<
            string,
            unknown
        >;

        if ("stringValue" in item) {
            return item.stringValue;
        }

        if ("boolValue" in item) {
            return item.boolValue;
        }

        if ("intValue" in item) {
            return item.intValue;
        }

        if ("doubleValue" in item) {
            return item.doubleValue;
        }

        if ("bytesValue" in item) {
            return item.bytesValue;
        }

        if ("arrayValue" in item) {
            return item.arrayValue;
        }

        if ("kvlistValue" in item) {
            return item.kvlistValue;
        }

        return item;
    }

    private getStringAttribute(
        attributes: Record<string, unknown>,
        key: string,
    ) {
        const value = attributes[key];

        return typeof value === "string"
            ? value
            : undefined;
    }

    private mapSpanStatus(
        statusCode: unknown,
    ) {
        if (statusCode === 2) {
            return "ERROR";
        }

        if (statusCode === 1) {
            return "OK";
        }

        return "UNSET";
    }
}