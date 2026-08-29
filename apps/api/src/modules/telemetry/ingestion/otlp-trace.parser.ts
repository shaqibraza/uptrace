import { AppError } from "../../../core/errors/app-error.js";
import { decodeOtlpProtobuf } from "./otlp-protobuf.decoder.js";

export type OtlpAttributeValue = {
    stringValue?: string;
    boolValue?: boolean;
    intValue?: number | string;
    doubleValue?: number;
    bytesValue?: Uint8Array;
    arrayValue?: unknown;
    kvlistValue?: unknown;
};

export type OtlpAttribute = {
    key: string;
    value?: OtlpAttributeValue;
};

export type OtlpEvent = {
    name: string;
    time?: [number, number];
    attributes?: OtlpAttribute[];
};

export type OtlpSpan = {
    traceId?: Uint8Array;
    spanId?: Uint8Array;
    parentSpanId?: Uint8Array;
    name?: string;
    kind?: number;
    startTime?: [number, number];
    endTime?: [number, number];
    attributes?: OtlpAttribute[];
    status?: {
        code?: number;
        message?: string;
    };
    events?: OtlpEvent[];
};

export type OtlpScopeSpans = {
    spans?: OtlpSpan[];
};

export type OtlpResource = {
    attributes?: OtlpAttribute[];
};

export type OtlpResourceSpans = {
    resource?: OtlpResource;
    scopeSpans?: OtlpScopeSpans[];
};

export type OtlpTraceRequest = {
    resourceSpans?: OtlpResourceSpans[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseHexId(
    value: unknown,
    field: string,
): Uint8Array | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    // OTLP protobuf decoded bytes
    if (value instanceof Uint8Array) {
        return value;
    }

    // JSON OTLP hex string
    if (typeof value === "string") {
        if (
            !/^[0-9a-fA-F]+$/.test(value) ||
            value.length % 2 !== 0
        ) {
            throw new AppError(
                `Invalid OTLP ${field}`,
                400,
                "INVALID_OTLP_PAYLOAD",
            );
        }

        return Uint8Array.from(Buffer.from(value, "hex"));
    }

    throw new AppError(
        `Invalid OTLP ${field}`,
        400,
        "INVALID_OTLP_PAYLOAD",
    );
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

function parseAnyValue(
    value: unknown,
): OtlpAttributeValue | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const result: OtlpAttributeValue = {};

    if ("stringValue" in value && typeof value.stringValue === "string") {
        result.stringValue = value.stringValue;
    }

    if ("boolValue" in value && typeof value.boolValue === "boolean") {
        result.boolValue = value.boolValue;
    }

    if (
        "intValue" in value &&
        (typeof value.intValue === "number" ||
            typeof value.intValue === "string")
    ) {
        result.intValue = value.intValue;
    }

    if (
        "doubleValue" in value &&
        typeof value.doubleValue === "number"
    ) {
        result.doubleValue = value.doubleValue;
    }

    if ("bytesValue" in value) {
        if (typeof value.bytesValue === "string") {
            result.bytesValue = Uint8Array.from(
                Buffer.from(value.bytesValue, "base64"),
            );
        } else if (value.bytesValue instanceof Uint8Array) {
            result.bytesValue = value.bytesValue;
        }
    }

    if ("arrayValue" in value) {
        result.arrayValue = value.arrayValue;
    }

    if ("kvlistValue" in value) {
        result.kvlistValue = value.kvlistValue;
    }

    return Object.keys(result).length > 0 ? result : undefined;
}

function parseAttributes(
    value: unknown,
): OtlpAttribute[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const attributes: OtlpAttribute[] = [];

    for (const item of value) {
        if (!isRecord(item) || typeof item.key !== "string") {
            continue;
        }

        const parsedValue = parseAnyValue(item.value);

        if (parsedValue !== undefined) {
            attributes.push({
                key: item.key,
                value: parsedValue,
            });
        } else {
            attributes.push({
                key: item.key,
            });
        }
    }

    return attributes;
}

function parseEvent(value: unknown): OtlpEvent | null {
    if (!isRecord(value) || typeof value.name !== "string") {
        return null;
    }

    const time = parseUnixNano(
        value.timeUnixNano,
        "event timestamp",
    );

    const attributes = parseAttributes(value.attributes);

    return {
        name: value.name,
        ...(time !== undefined ? { time } : {}),
        ...(attributes !== undefined ? { attributes } : {}),
    };
}

function parseSpan(value: unknown): OtlpSpan | null {
    if (!isRecord(value)) {
        return null;
    }

    const traceId = parseHexId(
        value.traceId,
        "traceId",
    );

    const spanId = parseHexId(
        value.spanId,
        "spanId",
    );

    const parentSpanId = parseHexId(
        value.parentSpanId,
        "parentSpanId",
    );

    const name =
        typeof value.name === "string"
            ? value.name
            : undefined;

    const kind =
        typeof value.kind === "number"
            ? value.kind
            : undefined;

    const startTime = parseUnixNano(
        value.startTimeUnixNano,
        "startTimeUnixNano",
    );

    const endTime = parseUnixNano(
        value.endTimeUnixNano,
        "endTimeUnixNano",
    );

    const attributes = parseAttributes(
        value.attributes,
    );

    let status: OtlpSpan["status"];

    if (isRecord(value.status)) {
        const statusCode =
            typeof value.status.code === "number"
                ? value.status.code
                : undefined;

        const statusMessage =
            typeof value.status.message === "string"
                ? value.status.message
                : undefined;

        status = {
            ...(statusCode !== undefined
                ? { code: statusCode }
                : {}),
            ...(statusMessage !== undefined
                ? { message: statusMessage }
                : {}),
        };
    }

    const events = Array.isArray(value.events)
        ? value.events
            .map(parseEvent)
            .filter(
                (event): event is OtlpEvent =>
                    event !== null,
            )
        : [];

    return {
        ...(traceId !== undefined ? { traceId } : {}),
        ...(spanId !== undefined ? { spanId } : {}),
        ...(parentSpanId !== undefined
            ? { parentSpanId }
            : {}),
        ...(name !== undefined ? { name } : {}),
        ...(kind !== undefined ? { kind } : {}),
        ...(startTime !== undefined
            ? { startTime }
            : {}),
        ...(endTime !== undefined
            ? { endTime }
            : {}),
        ...(attributes !== undefined
            ? { attributes }
            : {}),
        ...(status !== undefined ? { status } : {}),
        events,
    };
}

function parseScopeSpans(
    value: unknown,
): OtlpScopeSpans | null {
    if (!isRecord(value)) {
        return null;
    }

    const spans = Array.isArray(value.spans)
        ? value.spans
            .map(parseSpan)
            .filter(
                (span): span is OtlpSpan =>
                    span !== null,
            )
        : [];

    return {
        spans,
    };
}

function parseResourceSpans(
    value: unknown,
): OtlpResourceSpans | null {
    if (!isRecord(value)) {
        return null;
    }

    let resource: OtlpResource | undefined;

    if (isRecord(value.resource)) {
        const attributes = parseAttributes(
            value.resource.attributes,
        );

        resource = {
            ...(attributes !== undefined
                ? { attributes }
                : {}),
        };
    }

    const scopeSpans = Array.isArray(value.scopeSpans)
        ? value.scopeSpans
            .map(parseScopeSpans)
            .filter(
                (
                    item,
                ): item is OtlpScopeSpans =>
                    item !== null,
            )
        : [];

    return {
        ...(resource !== undefined
            ? { resource }
            : {}),
        scopeSpans,
    };
}

export function parseOtlpTraceRequest(
    payload: unknown,
): OtlpTraceRequest {
    if (Buffer.isBuffer(payload)) {
        payload = decodeOtlpProtobuf(payload);
    }

    if (!isRecord(payload)) {
        throw new AppError(
            "Invalid OTLP trace payload",
            400,
            "INVALID_OTLP_PAYLOAD",
        );
    }

    const resourceSpans = Array.isArray(
        payload.resourceSpans,
    )
        ? payload.resourceSpans
            .map(parseResourceSpans)
            .filter(
                (
                    item,
                ): item is OtlpResourceSpans =>
                    item !== null,
            )
        : [];

    return {
        resourceSpans,
    };
}