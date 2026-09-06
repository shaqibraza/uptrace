import { AppError } from "../../../core/errors/app-error.js";
import { decodeOtlpLogsProtobuf } from "./otlp-logs-protobuf.decoder.js";

export type OtlpLogRecord = {
    timestamp?: [number, number];
    observedTimestamp?: [number, number];
    severityNumber?: number;
    severityText?: string;
    body?: unknown;
    attributes?: Record<string, unknown>;
    traceId?: string;
    spanId?: string;
    raw?: Record<string, unknown>;
};

export type OtlpResourceLogs = {
    resourceAttributes: Record<string, unknown>;
    scopeLogs: Array<{
        scopeName?: string;
        scopeVersion?: string;
        logRecords: OtlpLogRecord[];
    }>;
};

export type OtlpLogsRequest = {
    resourceLogs: OtlpResourceLogs[];
};

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null
    );
}

function parseUnixNano(
    value: unknown,
    field: string,
): [number, number] | undefined {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
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

    if (nanos < 0n) {
        throw new AppError(
            `Invalid OTLP ${field}`,
            400,
            "INVALID_OTLP_TIMESTAMP",
        );
    }

    const seconds = nanos / 1_000_000_000n;
    const remainder = nanos % 1_000_000_000n;

    return [
        Number(seconds),
        Number(remainder),
    ];
}

function bytesToHex(
    value: unknown,
): string | undefined {
    if (typeof value === "string") {
        return value;
    }

    if (
        value instanceof Uint8Array ||
        Buffer.isBuffer(value)
    ) {
        return Buffer.from(value).toString("hex");
    }

    return undefined;
}

function bytesToBase64(
    value: unknown,
): string | undefined {
    if (typeof value === "string") {
        return value;
    }

    if (
        value instanceof Uint8Array ||
        Buffer.isBuffer(value)
    ) {
        return Buffer.from(value).toString(
            "base64",
        );
    }

    return undefined;
}

function anyValueToPrimitive(
    value: unknown,
): unknown {
    if (!isRecord(value)) {
        return undefined;
    }

    if (
        "stringValue" in value &&
        typeof value.stringValue === "string"
    ) {
        return value.stringValue;
    }

    if (
        "boolValue" in value &&
        typeof value.boolValue === "boolean"
    ) {
        return value.boolValue;
    }

    if ("intValue" in value) {
        const raw = value.intValue;

        if (
            typeof raw === "number" ||
            typeof raw === "bigint" ||
            typeof raw === "string"
        ) {
            if (typeof raw === "number") {
                return Number.isFinite(raw)
                    ? raw
                    : undefined;
            }

            const parsed = Number(raw);

            return Number.isSafeInteger(parsed)
                ? parsed
                : String(raw);
        }
    }

    if (
        "doubleValue" in value &&
        typeof value.doubleValue === "number"
    ) {
        return Number.isFinite(
            value.doubleValue,
        )
            ? value.doubleValue
            : undefined;
    }

    if ("bytesValue" in value) {
        return bytesToBase64(
            value.bytesValue,
        );
    }

    if ("arrayValue" in value) {
        if (!isRecord(value.arrayValue)) {
            return undefined;
        }

        const values =
            value.arrayValue.values;

        if (!Array.isArray(values)) {
            return [];
        }

        return values.map(
            anyValueToPrimitive,
        );
    }

    if ("kvlistValue" in value) {
        if (!isRecord(value.kvlistValue)) {
            return undefined;
        }

        return attributesToObject(
            value.kvlistValue.values,
        );
    }

    return undefined;
}

function attributesToObject(
    value: unknown,
): Record<string, unknown> {
    if (!Array.isArray(value)) {
        return {};
    }

    const result: Record<
        string,
        unknown
    > = {};

    for (const item of value) {
        if (
            !isRecord(item) ||
            typeof item.key !== "string"
        ) {
            continue;
        }

        const parsedValue =
            anyValueToPrimitive(item.value);

        if (parsedValue !== undefined) {
            result[item.key] = parsedValue;
        }
    }

    return result;
}

function parseLogRecord(
    value: unknown,
): OtlpLogRecord | null {
    if (!isRecord(value)) {
        return null;
    }

    const timestamp = parseUnixNano(
        value.timeUnixNano,
        "log timestamp",
    );

    const observedTimestamp =
        parseUnixNano(
            value.observedTimeUnixNano,
            "observed log timestamp",
        );

    let severityNumber:
        | number
        | undefined;

    if (
        typeof value.severityNumber ===
        "number"
    ) {
        severityNumber =
            Number.isFinite(
                value.severityNumber,
            )
                ? value.severityNumber
                : undefined;
    } else if (
        typeof value.severityNumber ===
        "string" ||
        typeof value.severityNumber ===
        "bigint"
    ) {
        const parsed = Number(
            value.severityNumber,
        );

        if (Number.isFinite(parsed)) {
            severityNumber = parsed;
        }
    }

    const severityText =
        typeof value.severityText ===
            "string"
            ? value.severityText
            : undefined;

    const attributes = attributesToObject(
        value.attributes,
    );

    const traceId = bytesToHex(
        value.traceId,
    );

    const spanId = bytesToHex(
        value.spanId,
    );

    const body =
        value.body !== undefined
            ? anyValueToPrimitive(
                value.body,
            )
            : undefined;

    return {
        ...(timestamp !== undefined
            ? { timestamp }
            : {}),
        ...(observedTimestamp !== undefined
            ? { observedTimestamp }
            : {}),
        ...(severityNumber !== undefined
            ? { severityNumber }
            : {}),
        ...(severityText !== undefined
            ? { severityText }
            : {}),
        ...(body !== undefined
            ? { body }
            : {}),
        ...(Object.keys(attributes).length >
            0
            ? { attributes }
            : {}),
        ...(traceId !== undefined
            ? { traceId }
            : {}),
        ...(spanId !== undefined
            ? { spanId }
            : {}),
        raw: value,
    };
}

function parseScopeLogs(
    value: unknown,
): OtlpResourceLogs["scopeLogs"][number] | null {
    if (!isRecord(value)) {
        return null;
    }

    const scope = isRecord(value.scope)
        ? value.scope
        : undefined;

    const scopeName =
        scope &&
            typeof scope.name === "string"
            ? scope.name
            : undefined;

    const scopeVersion =
        scope &&
            typeof scope.version === "string"
            ? scope.version
            : undefined;

    const logRecords: OtlpLogRecord[] =
        Array.isArray(value.logRecords)
            ? value.logRecords
                .map(parseLogRecord)
                .filter(
                    (
                        item,
                    ): item is OtlpLogRecord =>
                        item !== null,
                )
            : [];

    return {
        ...(scopeName !== undefined
            ? { scopeName }
            : {}),
        ...(scopeVersion !== undefined
            ? { scopeVersion }
            : {}),
        logRecords,
    };
}

function parseResourceLogs(
    value: unknown,
): OtlpResourceLogs | null {
    if (!isRecord(value)) {
        return null;
    }

    const resourceAttributes =
        isRecord(value.resource)
            ? attributesToObject(
                value.resource
                    .attributes,
            )
            : {};

    const scopeLogs =
        Array.isArray(
            value.scopeLogs,
        )
            ? value.scopeLogs
                .map(parseScopeLogs)
                .filter(
                    (
                        item,
                    ): item is OtlpResourceLogs["scopeLogs"][number] =>
                        item !== null,
                )
            : [];

    return {
        resourceAttributes,
        scopeLogs,
    };
}

function parseJsonPayload(
    payload: Buffer,
): unknown {
    try {
        const json =
            payload.toString("utf8");

        return JSON.parse(json);
    } catch {
        throw new AppError(
            "Invalid JSON OTLP logs payload",
            400,
            "INVALID_OTLP_PAYLOAD",
        );
    }
}

export function parseOtlpLogsRequest(
    payload: unknown,
    contentType?: string,
): OtlpLogsRequest {
    if (Buffer.isBuffer(payload)) {
        const normalizedContentType =
            contentType
                ?.split(";")[0]
                ?.trim()
                .toLowerCase();

        if (
            normalizedContentType ===
            "application/json" ||
            normalizedContentType ===
            "application/json-patch+json"
        ) {
            payload = parseJsonPayload(
                payload,
            );
        } else if (
            normalizedContentType ===
            "application/x-protobuf" ||
            normalizedContentType ===
            "application/protobuf"
        ) {
            payload =
                decodeOtlpLogsProtobuf(
                    payload,
                );
        } else {
            throw new AppError(
                "Unsupported OTLP logs content type",
                415,
                "UNSUPPORTED_OTLP_CONTENT_TYPE",
            );
        }
    }

    if (!isRecord(payload)) {
        throw new AppError(
            "Invalid OTLP logs payload",
            400,
            "INVALID_OTLP_PAYLOAD",
        );
    }

    const resourceLogs =
        Array.isArray(
            payload.resourceLogs,
        )
            ? payload.resourceLogs
                .map(parseResourceLogs)
                .filter(
                    (
                        item,
                    ): item is OtlpResourceLogs =>
                        item !== null,
                )
            : [];

    return {
        resourceLogs,
    };
}