import { AppError } from "../../../core/errors/app-error.js";
import { decodeOtlpMetricsProtobuf } from "./otlp-metrics-protobuf.decoder.js";

export type OtlpMetricType =
    | "Gauge"
    | "Counter"
    | "Histogram"
    | "ExponentialHistogram"
    | "Summary"
    | "unknown";

export type OtlpMetricDataPoint = {
    timestamp?: [number, number];
    startTime?: [number, number];
    value?: number;
    count?: number | string;
    sum?: number;
    min?: number;
    max?: number;
    attributes?: Record<string, unknown>;
    raw?: Record<string, unknown>;
};

export type OtlpMetric = {
    name: string;
    description?: string;
    unit?: string;
    type: OtlpMetricType;
    aggregationTemporality?: number;
    isMonotonic?: boolean;
    dataPoints: OtlpMetricDataPoint[];
};

export type OtlpResourceMetrics = {
    resourceAttributes: Record<string, unknown>;
    metrics: OtlpMetric[];
};

export type OtlpMetricsRequest = {
    resourceMetrics: OtlpResourceMetrics[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseUnixNano(
    value: unknown,
    field: string,
): [number, number] | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    let nanos: bigint;

    try {
        if (
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "bigint"
        ) {
            throw new Error();
        }

        nanos = BigInt(value);
    } catch {
        throw new AppError(
            `Invalid OTLP ${field}`,
            400,
            "INVALID_OTLP_TIMESTAMP",
        );
    }

    const seconds = nanos / 1_000_000_000n;
    const remainder = nanos % 1_000_000_000n;

    return [Number(seconds), Number(remainder)];
}

function bytesToBase64(value: unknown): string | undefined {
    if (typeof value === "string") {
        return value;
    }

    if (value instanceof Uint8Array) {
        return Buffer.from(value).toString("base64");
    }

    return undefined;
}

function anyValueToPrimitive(value: unknown): unknown {
    if (!isRecord(value)) {
        return undefined;
    }

    if ("stringValue" in value && typeof value.stringValue === "string") {
        return value.stringValue;
    }

    if ("boolValue" in value && typeof value.boolValue === "boolean") {
        return value.boolValue;
    }

    if (
        "intValue" in value &&
        (typeof value.intValue === "string" ||
            typeof value.intValue === "number" ||
            typeof value.intValue === "bigint")
    ) {
        const raw = value.intValue;

        if (typeof raw === "number") {
            return raw;
        }

        const parsed = Number(raw);

        return Number.isSafeInteger(parsed) ? parsed : String(raw);
    }

    if ("doubleValue" in value && typeof value.doubleValue === "number") {
        return value.doubleValue;
    }

    if ("bytesValue" in value) {
        return bytesToBase64(value.bytesValue);
    }

    if ("arrayValue" in value) {
        if (!isRecord(value.arrayValue)) {
            return undefined;
        }

        const values = value.arrayValue.values;

        if (!Array.isArray(values)) {
            return [];
        }

        return values.map(anyValueToPrimitive);
    }

    if ("kvlistValue" in value) {
        if (!isRecord(value.kvlistValue)) {
            return undefined;
        }

        return attributesToObject(value.kvlistValue.values);
    }

    return undefined;
}

function attributesToObject(value: unknown): Record<string, unknown> {
    if (!Array.isArray(value)) {
        return {};
    }

    const result: Record<string, unknown> = {};

    for (const item of value) {
        if (!isRecord(item) || typeof item.key !== "string") {
            continue;
        }

        const parsedValue = anyValueToPrimitive(item.value);

        if (parsedValue !== undefined) {
            result[item.key] = parsedValue;
        }
    }

    return result;
}

function normalizeCount(value: unknown): number | string | undefined {
    if (
        typeof value !== "number" &&
        typeof value !== "string" &&
        typeof value !== "bigint"
    ) {
        return undefined;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === "bigint") {
        const numericValue = Number(value);

        return Number.isSafeInteger(numericValue)
            ? numericValue
            : value.toString();
    }

    const numericValue = Number(value);

    return Number.isSafeInteger(numericValue)
        ? numericValue
        : value;
}

function parseNumberDataPoint(
    value: unknown,
): OtlpMetricDataPoint | null {
    if (!isRecord(value)) {
        return null;
    }

    const timestamp = parseUnixNano(
        value.timeUnixNano,
        "metric timestamp",
    );

    const startTime = parseUnixNano(
        value.startTimeUnixNano,
        "metric start timestamp",
    );

    let metricValue: number | undefined;

    if (typeof value.asDouble === "number") {
        metricValue = value.asDouble;
    } else if (
        typeof value.asInt === "number" ||
        typeof value.asInt === "string" ||
        typeof value.asInt === "bigint"
    ) {
        const parsed = Number(value.asInt);

        if (!Number.isFinite(parsed)) {
            throw new AppError(
                "Invalid OTLP metric value",
                400,
                "INVALID_OTLP_PAYLOAD",
            );
        }

        metricValue = parsed;
    }

    const attributes = attributesToObject(value.attributes);

    return {
        ...(timestamp !== undefined ? { timestamp } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(metricValue !== undefined ? { value: metricValue } : {}),
        ...(Object.keys(attributes).length > 0
            ? { attributes }
            : {}),
        raw: value,
    };
}

function parseHistogramDataPoint(
    value: unknown,
): OtlpMetricDataPoint | null {
    if (!isRecord(value)) {
        return null;
    }

    const timestamp = parseUnixNano(
        value.timeUnixNano,
        "metric timestamp",
    );

    const startTime = parseUnixNano(
        value.startTimeUnixNano,
        "metric start timestamp",
    );

    const attributes = attributesToObject(value.attributes);

    const count = normalizeCount(value.count);

    const sum =
        typeof value.sum === "number"
            ? value.sum
            : undefined;

    const min =
        typeof value.min === "number"
            ? value.min
            : undefined;

    const max =
        typeof value.max === "number"
            ? value.max
            : undefined;

    return {
        ...(timestamp !== undefined ? { timestamp } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(count !== undefined ? { count } : {}),
        ...(sum !== undefined ? { sum } : {}),
        ...(min !== undefined ? { min } : {}),
        ...(max !== undefined ? { max } : {}),
        ...(sum !== undefined
            ? { value: sum }
            : count !== undefined
                ? { value: Number(count) }
                : {}),
        ...(Object.keys(attributes).length > 0
            ? { attributes }
            : {}),
        raw: value,
    };
}

function parseSummaryDataPoint(
    value: unknown,
): OtlpMetricDataPoint | null {
    if (!isRecord(value)) {
        return null;
    }

    const timestamp = parseUnixNano(
        value.timeUnixNano,
        "metric timestamp",
    );

    const startTime = parseUnixNano(
        value.startTimeUnixNano,
        "metric start timestamp",
    );

    const attributes = attributesToObject(value.attributes);

    const count = normalizeCount(value.count);

    const sum =
        typeof value.sum === "number"
            ? value.sum
            : undefined;

    return {
        ...(timestamp !== undefined ? { timestamp } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(count !== undefined ? { count } : {}),
        ...(sum !== undefined ? { sum } : {}),
        ...(sum !== undefined
            ? { value: sum }
            : count !== undefined
                ? { value: Number(count) }
                : {}),
        ...(Object.keys(attributes).length > 0
            ? { attributes }
            : {}),
        raw: value,
    };
}

function parseMetricDataPoints(
    type: OtlpMetricType,
    value: unknown,
): OtlpMetricDataPoint[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (
                type === "Histogram" ||
                type === "ExponentialHistogram"
            ) {
                return parseHistogramDataPoint(item);
            }

            if (type === "Summary") {
                return parseSummaryDataPoint(item);
            }

            return parseNumberDataPoint(item);
        })
        .filter(
            (item): item is OtlpMetricDataPoint =>
                item !== null,
        );
}

function parseMetric(
    value: unknown,
): OtlpMetric | null {
    if (!isRecord(value) || typeof value.name !== "string") {
        return null;
    }

    let type: OtlpMetricType = "unknown";
    let dataPoints: OtlpMetricDataPoint[] = [];
    let aggregationTemporality: number | undefined;
    let isMonotonic: boolean | undefined;

    if (isRecord(value.gauge)) {
        type = "Gauge";

        dataPoints = parseMetricDataPoints(
            type,
            value.gauge.dataPoints,
        );
    } else if (isRecord(value.sum)) {
        type = "Counter";

        dataPoints = parseMetricDataPoints(
            type,
            value.sum.dataPoints,
        );

        if (typeof value.sum.aggregationTemporality === "number") {
            aggregationTemporality =
                value.sum.aggregationTemporality;
        }

        if (typeof value.sum.isMonotonic === "boolean") {
            isMonotonic = value.sum.isMonotonic;
        }
    } else if (isRecord(value.histogram)) {
        type = "Histogram";

        dataPoints = parseMetricDataPoints(
            type,
            value.histogram.dataPoints,
        );

        if (
            typeof value.histogram.aggregationTemporality ===
            "number"
        ) {
            aggregationTemporality =
                value.histogram.aggregationTemporality;
        }
    } else if (isRecord(value.exponentialHistogram)) {
        type = "ExponentialHistogram";

        dataPoints = parseMetricDataPoints(
            type,
            value.exponentialHistogram.dataPoints,
        );

        if (
            typeof value.exponentialHistogram
                .aggregationTemporality === "number"
        ) {
            aggregationTemporality =
                value.exponentialHistogram
                    .aggregationTemporality;
        }
    } else if (isRecord(value.summary)) {
        type = "Summary";

        dataPoints = parseMetricDataPoints(
            type,
            value.summary.dataPoints,
        );
    }

    const description =
        typeof value.description === "string"
            ? value.description
            : undefined;

    const unit =
        typeof value.unit === "string"
            ? value.unit
            : undefined;

    return {
        name: value.name,
        ...(description !== undefined
            ? { description }
            : {}),
        ...(unit !== undefined ? { unit } : {}),
        type,
        ...(aggregationTemporality !== undefined
            ? { aggregationTemporality }
            : {}),
        ...(isMonotonic !== undefined
            ? { isMonotonic }
            : {}),
        dataPoints,
    };
}

function parseResourceMetrics(
    value: unknown,
): OtlpResourceMetrics | null {
    if (!isRecord(value)) {
        return null;
    }

    const resourceAttributes =
        isRecord(value.resource)
            ? attributesToObject(
                value.resource.attributes,
            )
            : {};

    const metrics: OtlpMetric[] = [];

    if (Array.isArray(value.scopeMetrics)) {
        for (const scope of value.scopeMetrics) {
            if (
                !isRecord(scope) ||
                !Array.isArray(scope.metrics)
            ) {
                continue;
            }

            for (const metric of scope.metrics) {
                const parsedMetric = parseMetric(metric);

                if (parsedMetric !== null) {
                    metrics.push(parsedMetric);
                }
            }
        }
    }

    return {
        resourceAttributes,
        metrics,
    };
}

function parseJsonPayload(
    payload: Buffer,
): unknown {
    try {
        const json = payload.toString("utf8");

        return JSON.parse(json);
    } catch {
        throw new AppError(
            "Invalid JSON OTLP metrics payload",
            400,
            "INVALID_OTLP_PAYLOAD",
        );
    }
}

export function parseOtlpMetricsRequest(
    payload: unknown,
    contentType?: string,
): OtlpMetricsRequest {
    if (Buffer.isBuffer(payload)) {
        const normalizedContentType =
            contentType?.split(";")[0]?.trim().toLowerCase();

        if (
            normalizedContentType === "application/json" ||
            normalizedContentType === "application/json-patch+json"
        ) {
            payload = parseJsonPayload(payload);
        } else if (
            normalizedContentType === "application/x-protobuf" ||
            normalizedContentType === "application/protobuf"
        ) {
            payload = decodeOtlpMetricsProtobuf(payload);
        } else {
            throw new AppError(
                "Unsupported OTLP metrics content type",
                415,
                "UNSUPPORTED_OTLP_CONTENT_TYPE",
            );
        }
    }

    if (!isRecord(payload)) {
        throw new AppError(
            "Invalid OTLP metrics payload",
            400,
            "INVALID_OTLP_PAYLOAD",
        );
    }

    const resourceMetrics = Array.isArray(
        payload.resourceMetrics,
    )
        ? payload.resourceMetrics
            .map(parseResourceMetrics)
            .filter(
                (
                    item,
                ): item is OtlpResourceMetrics =>
                    item !== null,
            )
        : [];

    return {
        resourceMetrics,
    };
}