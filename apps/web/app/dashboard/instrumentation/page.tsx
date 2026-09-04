"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Copy,
    ExternalLink,
    KeyRound,
    RefreshCw,
    Terminal,
    TriangleAlert,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useProjectStore } from "../../../stores/project.store";
import { useTraceStore } from "../../../stores/trace.store";

type Language =
    | "Node.js"
    | "Python"
    | "Java"
    | "Go";

type CopyId =
    | "install"
    | "config"
    | "env"
    | "app"
    | "python-install"
    | "python-config"
    | "java-install"
    | "java-config"
    | "go-install"
    | "go-config";

const languages: Language[] = [
    "Node.js",
    "Python",
    "Java",
    "Go",
];

const languageDescriptions: Record<
    Language,
    string
> = {
    "Node.js":
        "Automatic instrumentation for Node.js applications.",
    Python:
        "Automatic instrumentation for Python applications.",
    Java:
        "Java agent-based automatic instrumentation.",
    Go:
        "OpenTelemetry SDK setup for Go applications.",
};

const nodeInstall = `pnpm add @opentelemetry/sdk-node \\
@opentelemetry/exporter-trace-otlp-proto \\
@opentelemetry/instrumentation-http \\
@opentelemetry/instrumentation-express`;

const pythonInstall = `pip install \\
opentelemetry-distro \\
opentelemetry-exporter-otlp`;

const javaInstall = `# Download the latest OpenTelemetry Java agent
# and place it in your application directory.

java -javaagent:opentelemetry-javaagent.jar \\
     -jar your-application.jar`;

const goInstall = `go get go.opentelemetry.io/otel \\
go get go.opentelemetry.io/otel/sdk \\
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`;

type NodeModuleSystem = "CommonJS" | "ESM";

function getNodeConfig(
    endpoint: string,
    moduleSystem: NodeModuleSystem,
) {
    if (moduleSystem === "ESM") {
        return `import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const exporter = new OTLPTraceExporter({
  url: "${endpoint}",
  headers: {
    "x-uptrace-api-key": process.env.UPTRACE_API_KEY,
  },
});

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();`;
    }

    return `const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");

const exporter = new OTLPTraceExporter({
  url: "${endpoint}",
  headers: {
    "x-uptrace-api-key": process.env.UPTRACE_API_KEY,
  },
});

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();`;
}

function getAppEntryConfig(moduleSystem: NodeModuleSystem) {
    return moduleSystem === "ESM"
        ? `import "./instrumentation.js";`
        : `require("./instrumentation");`;
}

function getPythonConfig(
    endpoint: string,
) {
    return `# Run your application with OpenTelemetry
# auto-instrumentation enabled.

opentelemetry-instrument \\
    --service_name=my-application \\
    python app.py

# Configure these environment variables:
# OTEL_EXPORTER_OTLP_ENDPOINT=${endpoint.replace(
        "/v1/traces",
        "",
    )}
# OTEL_EXPORTER_OTLP_HEADERS=x-uptrace-api-key=YOUR_UPTRACE_API_KEY`;
}

function getJavaConfig(
    endpoint: string,
) {
    return `java \\
  -javaagent:opentelemetry-javaagent.jar \\
  -Dotel.service.name=my-application \\
  -Dotel.exporter.otlp.endpoint=${endpoint.replace(
        "/v1/traces",
        "",
    )} \\
  -Dotel.exporter.otlp.headers=x-uptrace-api-key=YOUR_UPTRACE_API_KEY \\
  -jar your-application.jar`;
}

function getGoConfig(
    endpoint: string,
) {
    return `// Configure the OTLP HTTP exporter using
// the Uptrace endpoint and API key.

exporter, err := otlptracehttp.New(
    context.Background(),
    otlptracehttp.WithEndpoint(
        "${endpoint.replace(
        /^https?:\/\//,
        "",
    )}",
    ),
    otlptracehttp.WithHeaders(map[string]string{
        "x-uptrace-api-key":
            "YOUR_UPTRACE_API_KEY",
    }),
)

if err != nil {
    log.Fatal(err)
}`;

}

export default function InstrumentationPage() {
    const selectedProject = useProjectStore(
        (state) => state.selectedProject,
    );

    const traces = useTraceStore(
        (state) => state.traces,
    );

    const fetchTraces = useTraceStore(
        (state) => state.fetchTraces,
    );

    const traceLoading = useTraceStore(
        (state) => state.loading,
    );

    const traceError = useTraceStore(
        (state) => state.error,
    );

    const [language, setLanguage] =
        useState<Language>("Node.js");

    const [nodeModuleSystem, setNodeModuleSystem] =
        useState<NodeModuleSystem>("CommonJS");

    const [
        openLanguageMenu,
        setOpenLanguageMenu,
    ] = useState(false);

    const [copied, setCopied] =
        useState<CopyId | null>(null);

    const [verificationState, setVerificationState] =
        useState<
            "idle" | "checking" | "success" | "waiting" | "error"
        >("idle");

    const [
        verificationMessage,
        setVerificationMessage,
    ] = useState(
        "Start your application and send a test request.",
    );

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

    const telemetryEndpoint = useMemo(
        () =>
            `${apiBaseUrl.replace(
                /\/$/,
                "",
            )}/v1/traces`,
        [apiBaseUrl],
    );

    const configuration = useMemo(() => {
        switch (language) {
            case "Python":
                return {
                    install: pythonInstall,
                    config: getPythonConfig(
                        telemetryEndpoint,
                    ),
                };

            case "Java":
                return {
                    install: javaInstall,
                    config: getJavaConfig(
                        telemetryEndpoint,
                    ),
                };

            case "Go":
                return {
                    install: goInstall,
                    config: getGoConfig(
                        telemetryEndpoint,
                    ),
                };

            case "Node.js":
            default:
                return {
                    install: nodeInstall,
                    config: getNodeConfig(
                        telemetryEndpoint,
                        nodeModuleSystem,
                    ),
                };
        }
    }, [
        language,
        nodeModuleSystem,
        telemetryEndpoint,
    ]);

    const environmentVariables = useMemo(
        () =>
            `UPTRACE_API_KEY=YOUR_UPTRACE_API_KEY`,
        [],
    );

    const appEntryConfig = useMemo(
        () =>
            language === "Node.js"
                ? getAppEntryConfig(nodeModuleSystem)
                : "",
        [language, nodeModuleSystem],
    );

    const latestTrace = useMemo(() => {
        if (!traces.length) {
            return null;
        }

        return [...traces].sort(
            (a, b) =>
                new Date(
                    b.startTime,
                ).getTime() -
                new Date(
                    a.startTime,
                ).getTime(),
        )[0];
    }, [traces]);

    async function copyCode(
        code: string,
        id: CopyId,
    ) {
        try {
            await navigator.clipboard.writeText(
                code,
            );

            setCopied(id);

            window.setTimeout(() => {
                setCopied((current) =>
                    current === id
                        ? null
                        : current,
                );
            }, 1500);
        } catch {
            setCopied(null);
        }
    }

    async function handleVerify() {
        if (!selectedProject?.id) {
            return;
        }

        setVerificationState("checking");
        setVerificationMessage(
            "Checking for recently received telemetry...",
        );

        try {
            await fetchTraces(
                selectedProject.id,
            );

            const currentTraces =
                useTraceStore.getState().traces;

            if (currentTraces.length > 0) {
                setVerificationState(
                    "success",
                );

                setVerificationMessage(
                    "Telemetry is arriving successfully. Your project has received traces.",
                );

                return;
            }

            setVerificationState(
                "waiting",
            );

            setVerificationMessage(
                "No traces received yet. Start your application, send a request, and check again.",
            );
        } catch {
            setVerificationState("error");

            setVerificationMessage(
                traceError ??
                "Unable to check telemetry right now. Please try again.",
            );
        }
    }

    useEffect(() => {
        setVerificationState("idle");

        setVerificationMessage(
            "Start your application and send a test request.",
        );
    }, [
        selectedProject?.id,
    ]);

    return (
        <div>
            <main>
                <div>
                    {/* Back */}
                    <Link
                        href="/dashboard"
                        className="mb-7 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to dashboard
                    </Link>

                    {/* Header */}
                    <div className="max-w-3xl">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950">
                            <Terminal className="h-4 w-4 text-zinc-500" />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                            Instrument your application
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-zinc-600">
                            Configure OpenTelemetry in your
                            application and start sending
                            traces and telemetry data to your
                            Uptrace project.
                        </p>
                    </div>

                    {/* Selected project */}
                    <section className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                    Current project
                                </p>

                                {selectedProject ? (
                                    <>
                                        <h2 className="mt-1 text-sm font-medium text-zinc-200">
                                            {
                                                selectedProject.name
                                            }
                                        </h2>

                                        <p className="mt-1 font-mono text-[10px] text-zinc-700">
                                            {
                                                selectedProject.id
                                            }
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm text-zinc-500">
                                        No project selected
                                    </p>
                                )}
                            </div>

                            {!selectedProject && (
                                <p className="text-xs text-amber-500">
                                    Select a project from the
                                    dashboard topbar first.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Progress */}
                    <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Step number="01" title="Install" active />
                            <div className="hidden h-px flex-1 bg-zinc-900 sm:block" />
                            <Step number="02" title="Configure" active />
                            <div className="hidden h-px flex-1 bg-zinc-900 sm:block" />
                            <Step number="03" title="Load in app" active />
                            <div className="hidden h-px flex-1 bg-zinc-900 sm:block" />
                            <Step number="04" title="Environment" active />
                            <div className="hidden h-px flex-1 bg-zinc-900 sm:block" />
                            <Step
                                number="05"
                                title="Verify"
                                active={verificationState === "success"}
                            />
                        </div>
                    </div>

                    {/* Language */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-4 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Choose your language
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Select the runtime used by
                                    your application.
                                </p>
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenLanguageMenu(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    className="flex h-9 min-w-40 items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-black px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-700"
                                >
                                    <span>
                                        {language}
                                    </span>

                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>

                                {openLanguageMenu && (
                                    <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-2xl">
                                        {languages.map(
                                            (item) => (
                                                <button
                                                    key={
                                                        item
                                                    }
                                                    type="button"
                                                    onClick={() => {
                                                        setLanguage(
                                                            item,
                                                        );

                                                        setOpenLanguageMenu(
                                                            false,
                                                        );

                                                        setVerificationState(
                                                            "idle",
                                                        );
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                                                >
                                                    <span>
                                                        {
                                                            item
                                                        }
                                                    </span>

                                                    {language ===
                                                        item && (
                                                            <Check className="h-3.5 w-3.5" />
                                                        )}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            <p className="text-xs text-zinc-500">
                                {
                                    languageDescriptions[
                                    language
                                    ]
                                }
                            </p>
                        </div>
                    </section>

                    {/* Install */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    1. Install OpenTelemetry
                                </p>

                                <p className="mt-1 text-[11px] text-zinc-700">
                                    Add the required OpenTelemetry
                                    packages or agent to your
                                    application.
                                </p>
                            </div>

                            <CopyButton
                                copied={
                                    copied === "install"
                                }
                                onClick={() =>
                                    void copyCode(
                                        configuration.install,
                                        "install",
                                    )
                                }
                            />
                        </div>

                        <CodeBlock
                            code={
                                configuration.install
                            }
                        />
                    </section>
                    {/* Configuration */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-4 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    2. Configure OpenTelemetry
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-700">
                                    Create <code className="font-mono text-zinc-600">instrumentation.js</code> and initialize the SDK before your application starts.
                                </p>
                            </div>

                            {language === "Node.js" && (
                                <div className="flex shrink-0 rounded-lg border border-zinc-800 bg-black p-1">
                                    {(["CommonJS", "ESM"] as NodeModuleSystem[]).map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setNodeModuleSystem(item)}
                                            className={`rounded-md px-3 py-1.5 text-[10px] transition-colors ${nodeModuleSystem === item
                                                    ? "bg-zinc-800 text-zinc-200"
                                                    : "text-zinc-600 hover:text-zinc-300"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                {language === "Node.js"
                                    ? "instrumentation.js"
                                    : "Configuration"}
                            </p>
                            <CopyButton
                                copied={copied === "config"}
                                onClick={() =>
                                    void copyCode(
                                        configuration.config,
                                        "config",
                                    )
                                }
                            />
                        </div>

                        <CodeBlock code={configuration.config} />
                    </section>


                    {/* Load in application */}
                    {language === "Node.js" && (
                        <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                <div>
                                    <p className="text-xs font-medium text-zinc-300">
                                        3. Load OpenTelemetry in your app
                                    </p>
                                    <p className="mt-1 text-[11px] text-zinc-700">
                                        Import the instrumentation before your application initializes routes or starts the server.
                                    </p>
                                </div>
                                <CopyButton
                                    copied={copied === "app"}
                                    onClick={() =>
                                        void copyCode(
                                            appEntryConfig,
                                            "app",
                                        )
                                    }
                                />
                            </div>
                            <CodeBlock code={appEntryConfig} />
                            <div className="border-t border-zinc-900 px-5 py-4">
                                <p className="text-[11px] leading-5 text-zinc-700">
                                    Put this at the very top of your <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-zinc-500">app.js</code> or <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-zinc-500">index.js</code>, before creating the Express app.
                                </p>
                            </div>
                        </section>
                    )}
                    {/* Environment variables */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    4. Configure environment variables
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-700">
                                    Store the project API key in your server environment instead of hardcoding it in source code.
                                </p>
                            </div>

                            <CopyButton
                                copied={copied === "env"}
                                onClick={() =>
                                    void copyCode(
                                        environmentVariables,
                                        "env",
                                    )
                                }
                            />
                        </div>

                        <CodeBlock code={environmentVariables} />

                        <div className="grid gap-4 border-t border-zinc-900 p-5 sm:grid-cols-2">
                            <Credential
                                label="OTLP trace endpoint"
                                value={telemetryEndpoint}
                            />
                            <Credential
                                label="Project API key"
                                value="YOUR_UPTRACE_API_KEY"
                                secret
                            />
                        </div>

                        <div className="border-t border-zinc-900 px-5 py-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[11px] leading-5 text-zinc-700">
                                    Replace{" "}
                                    <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-zinc-500">
                                        YOUR_UPTRACE_API_KEY
                                    </code>{" "}
                                    with a key generated from the API Keys page.
                                </p>

                                <Link
                                    href="/dashboard/api-keys"
                                    className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-zinc-800 px-3 text-[10px] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                                >
                                    Open API Keys
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Important security note */}
                    <section className="mt-6 rounded-xl border border-amber-500/10 bg-amber-500/0.02 p-5">
                        <div className="flex items-start gap-3">
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/70" />

                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    Keep your API key private
                                </p>

                                <p className="mt-1 text-[11px] leading-5 text-zinc-700">
                                    Do not commit your Uptrace API
                                    key to source control or expose
                                    it in browser-side code. Store it
                                    in your server environment or
                                    secret manager.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Verify */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${verificationState ===
                                    "success"
                                    ? "border-emerald-500/20 bg-emerald-500/5"
                                    : "border-zinc-900 bg-black"
                                    }`}
                            >
                                {verificationState ===
                                    "success" ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <ClipboardCheck className="h-5 w-5 text-zinc-600" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    5. Verify your setup
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    Start your application and
                                    send a test request. Then
                                    check whether Uptrace has
                                    received a trace for this
                                    project.
                                </p>

                                <VerificationMessage
                                    state={
                                        verificationState
                                    }
                                    message={
                                        verificationMessage
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleVerify()
                                }
                                disabled={
                                    !selectedProject?.id ||
                                    traceLoading
                                }
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-black px-4 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <RefreshCw
                                    className={`h-3.5 w-3.5 ${traceLoading
                                        ? "animate-spin"
                                        : ""
                                        }`}
                                />

                                {traceLoading
                                    ? "Checking..."
                                    : "Check telemetry"}
                            </button>
                        </div>

                        {latestTrace &&
                            verificationState ===
                            "success" && (
                                <div className="mt-5 border-t border-zinc-900 pt-4">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <VerificationStat
                                            label="Service"
                                            value={
                                                latestTrace.serviceName ||
                                                "Unknown"
                                            }
                                        />

                                        <VerificationStat
                                            label="Operation"
                                            value={
                                                latestTrace.operationName ||
                                                "Unknown"
                                            }
                                        />

                                        <VerificationStat
                                            label="Latest trace"
                                            value={formatRelativeTime(
                                                latestTrace.startTime,
                                            )}
                                        />
                                    </div>

                                    <Link
                                        href="/dashboard/traces"
                                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200"
                                    >
                                        View traces
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            )}
                    </section>

                    {/* Documentation */}
                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-300">
                                Need more configuration options?
                            </p>

                            <p className="mt-1 text-[11px] text-zinc-700">
                                Explore OpenTelemetry
                                instrumentation and exporter
                                configuration for your runtime.
                            </p>
                        </div>

                        <a
                            href="https://opentelemetry.io/docs/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
                        >
                            Read OpenTelemetry docs
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Step({
    number,
    title,
    active = false,
}: {
    number: string;
    title: string;
    active?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold ${active
                    ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                    : "border-zinc-900 bg-black text-zinc-700"
                    }`}
            >
                {number}
            </div>

            <span
                className={`text-xs ${active
                    ? "text-zinc-300"
                    : "text-zinc-700"
                    }`}
            >
                {title}
            </span>
        </div>
    );
}

function CopyButton({
    copied,
    onClick,
}: {
    copied: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-900 px-2.5 text-[10px] text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
        >
            {copied ? (
                <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    Copied
                </>
            ) : (
                <>
                    <Copy className="h-3 w-3" />
                    Copy
                </>
            )}
        </button>
    );
}

function CodeBlock({
    code,
}: {
    code: string;
}) {
    return (
        <div className="overflow-x-auto border-t border-zinc-900 bg-black">
            <pre className="min-w-650px p-5 font-mono text-[11px] leading-6 text-zinc-500">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function Credential({
    label,
    value,
    secret = false,
}: {
    label: string;
    value: string;
    secret?: boolean;
}) {
    const [visible, setVisible] =
        useState(false);

    const [copied, setCopied] =
        useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(
                value,
            );

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                {label}
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-black px-3">
                <code className="min-w-0 flex-1 truncate py-2.5 font-mono text-[11px] text-zinc-500">
                    {secret && !visible
                        ? "••••••••••••••••••••"
                        : value}
                </code>

                {secret ? (
                    <button
                        type="button"
                        onClick={() =>
                            setVisible(
                                (current) =>
                                    !current,
                            )
                        }
                        className="shrink-0 text-[10px] text-zinc-700 hover:text-zinc-300"
                    >
                        {visible
                            ? "Hide"
                            : "Show"}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() =>
                            void handleCopy()
                        }
                        className="shrink-0 text-[10px] text-zinc-700 hover:text-zinc-300"
                    >
                        {copied
                            ? "Copied"
                            : "Copy"}
                    </button>
                )}
            </div>
        </div>
    );
}

function VerificationMessage({
    state,
    message,
}: {
    state:
    | "idle"
    | "checking"
    | "success"
    | "waiting"
    | "error";
    message: string;
}) {
    if (state === "idle") {
        return (
            <p className="mt-3 text-[11px] text-zinc-700">
                {message}
            </p>
        );
    }

    if (state === "checking") {
        return (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {message}
            </div>
        );
    }

    if (state === "success") {
        return (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-500/80">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {message}
            </div>
        );
    }

    if (state === "waiting") {
        return (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-500/80">
                <TriangleAlert className="h-3.5 w-3.5" />
                {message}
            </div>
        );
    }

    return (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-red-400/80">
            <TriangleAlert className="h-3.5 w-3.5" />
            {message}
        </div>
    );
}

function VerificationStat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                {label}
            </p>

            <p className="mt-1 truncate text-xs text-zinc-400">
                {value}
            </p>
        </div>
    );
}

function formatRelativeTime(
    value: string,
) {
    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "Unknown";
    }

    const diff =
        Date.now() - date.getTime();

    if (diff < 60_000) {
        return "Just now";
    }

    if (diff < 3_600_000) {
        const minutes = Math.floor(
            diff / 60_000,
        );

        return `${minutes} min ago`;
    }

    if (diff < 86_400_000) {
        const hours = Math.floor(
            diff / 3_600_000,
        );

        return `${hours} hr ago`;
    }

    if (diff < 604_800_000) {
        const days = Math.floor(
            diff / 86_400_000,
        );

        return `${days} day${days === 1 ? "" : "s"
            } ago`;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        },
    );
}
