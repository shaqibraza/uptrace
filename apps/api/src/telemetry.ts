import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { trace } from "@opentelemetry/api";

const sdk = new NodeSDK({
  serviceName: "uptrace-api",

  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
    headers: {
      "x-uptrace-api-key":
        "ut_987fe9ccb07f504afe38ea877e7601b426df9a68c549c03a5509b2c2208db95d",
    },
  }),
});

sdk.start();

const tracer = trace.getTracer("uptrace-test");

const span = tracer.startSpan("api-startup-test");

span.setAttribute("test", true);
span.setAttribute("source", "uptrace-api");

span.end();

console.log("=== TEST SPAN CREATED ===");

export default sdk;