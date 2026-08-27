import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";

import { env } from "../../config/index.js";

function parseOtlpHeaders(
    rawHeaders?: string,
): Record<string, string> | undefined {
    if (!rawHeaders) {
        return undefined;
    }

    const headers: Record<string, string> = {};

    for (const header of rawHeaders.split(",")) {
        const separatorIndex = header.indexOf("=");

        if (separatorIndex <= 0) {
            continue;
        }

        const key = header
            .slice(0, separatorIndex)
            .trim();

        const value = header
            .slice(separatorIndex + 1)
            .trim();

        if (!key) {
            continue;
        }

        headers[key] = value;
    }

    return Object.keys(headers).length > 0
        ? headers
        : undefined;
}

const otlpHeaders = parseOtlpHeaders(
    env.OTEL_EXPORTER_OTLP_HEADERS,
);

const traceExporter = new OTLPTraceExporter(
    otlpHeaders
        ? {
            url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
            headers: otlpHeaders,
        }
        : {
            url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
        },
);

const sdk = new NodeSDK({
    serviceName: env.OTEL_SERVICE_NAME,

    traceExporter,

    instrumentations: [
        getNodeAutoInstrumentations(),
    ],
});

sdk.start();

const shutdown = async () => {
    try {
        await sdk.shutdown();
    } catch (error) {
        console.error(
            "OpenTelemetry shutdown failed",
            error,
        );
    }
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);