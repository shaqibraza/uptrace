import "dotenv/config";

import { env } from "../../config/index.js";

import { NodeSDK } from "@opentelemetry/sdk-node";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";

import { resourceFromAttributes } from "@opentelemetry/resources";

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

const serviceName =
    env.OTEL_SERVICE_NAME?.trim() ||
    "uptrace-api";

const serviceVersion =
    env.OTEL_SERVICE_VERSION?.trim() ||
    "0.1.0";

const environment =
    env.OTEL_ENVIRONMENT?.trim() ||
    "development";

const resource = resourceFromAttributes({
    "service.name": serviceName,
    "service.version": serviceVersion,
    "deployment.environment.name": environment,
});

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
    resource,
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations(),
    ],
});

sdk.start();

console.log("OTEL SDK STARTED");
console.log("OTEL SERVICE NAME:", serviceName);
console.log(
    "OTEL EXPORTER:",
    `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
);

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