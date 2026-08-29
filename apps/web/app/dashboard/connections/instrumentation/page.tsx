"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    ExternalLink,
    KeyRound,
    Terminal,
} from "lucide-react";

import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";

const languages = [
    "Node.js",
    "Python",
    "Java",
    "Go",
];

const nodeInstall = `pnpm add @opentelemetry/sdk-node \\
@opentelemetry/auto-instrumentations-node \\
@opentelemetry/exporter-trace-otlp-http`;

const nodeConfig = `import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from
    "@opentelemetry/auto-instrumentations-node";
import {
    OTLPTraceExporter,
} from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: "YOUR_UPTRACE_OTLP_ENDPOINT",
        headers: {
            "x-uptrace-api-key": "YOUR_PROJECT_API_KEY",
        },
    }),
    instrumentations: [
        getNodeAutoInstrumentations(),
    ],
});

sdk.start();`;

export default function InstrumentationPage() {
    const [language, setLanguage] = useState("Node.js");
    const [openLanguageMenu, setOpenLanguageMenu] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    async function copyCode(code: string, id: string) {
        await navigator.clipboard.writeText(code);

        setCopied(id);

        setTimeout(() => {
            setCopied(null);
        }, 1500);
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

                    {/* Back */}
                    <Link
                        href="/dashboard/connections"
                        className="mb-7 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to connections
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
                            Configure OpenTelemetry in your application and
                            start sending traces, spans, and telemetry data
                            to your Uptrace project.
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <Step
                                number="01"
                                title="Install"
                                active
                            />

                            <div className="hidden h-px flex-1 bg-zinc-900 sm:block" />

                            <Step
                                number="02"
                                title="Configure"
                            />

                            <div className="hidden h-px flex-1 bg-zinc-900 sm:block" />

                            <Step
                                number="03"
                                title="Verify"
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
                                    Select the runtime used by your application.
                                </p>
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenLanguageMenu(
                                            (current) => !current,
                                        )
                                    }
                                    className="
                                        flex h-9 min-w-36
                                        items-center justify-between
                                        gap-4 rounded-lg
                                        border border-zinc-800
                                        bg-black px-3
                                        text-xs text-zinc-400
                                        transition-colors
                                        hover:border-zinc-700
                                    "
                                >
                                    {language}

                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>

                                {openLanguageMenu && (
                                    <div className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-2xl">
                                        {languages.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                    setLanguage(item);
                                                    setOpenLanguageMenu(
                                                        false,
                                                    );
                                                }}
                                                className="
                                                    flex w-full
                                                    items-center
                                                    justify-between
                                                    rounded-md
                                                    px-3 py-2
                                                    text-left
                                                    text-xs text-zinc-500
                                                    hover:bg-zinc-900
                                                    hover:text-zinc-200
                                                "
                                            >
                                                {item}

                                                {language === item && (
                                                    <Check className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Installation */}
                        <div className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-zinc-300">
                                        1. Install OpenTelemetry
                                    </p>

                                    <p className="mt-1 text-[11px] text-zinc-700">
                                        Add the required packages to your
                                        application.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        copyCode(nodeInstall, "install")
                                    }
                                    className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-900 px-2.5 text-[10px] text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                                >
                                    {copied === "install" ? (
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
                            </div>

                            <CodeBlock code={nodeInstall} />
                        </div>
                    </section>

                    {/* Project credentials */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                    <KeyRound className="h-4 w-4 text-zinc-600" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Project credentials
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Use these values in your OpenTelemetry
                                        configuration.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 p-5 sm:grid-cols-2">
                            <Credential
                                label="OTLP endpoint"
                                value="http://localhost:4318/v1/traces"
                            />

                            <Credential
                                label="Project API key"
                                value="uptrace_pk_xxxxxxxxxxxxxxxxx"
                                secret
                            />
                        </div>
                    </section>

                    {/* Configuration */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <p className="text-xs font-medium text-zinc-300">
                                    2. Configure OpenTelemetry
                                </p>

                                <p className="mt-1 text-[11px] text-zinc-700">
                                    Initialize the SDK before your application
                                    starts handling requests.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    copyCode(nodeConfig, "config")
                                }
                                className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-900 px-2.5 text-[10px] text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                            >
                                {copied === "config" ? (
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
                        </div>

                        <CodeBlock code={nodeConfig} />
                    </section>

                    {/* Environment variables */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <p className="text-xs font-medium text-zinc-300">
                                Recommended environment variables
                            </p>

                            <p className="mt-1 text-[11px] text-zinc-700">
                                Keep project credentials outside your source
                                code.
                            </p>
                        </div>

                        <div className="overflow-x-auto p-5">
                            <pre className="min-w-[600px] rounded-lg border border-zinc-900 bg-black p-4 font-mono text-xs leading-6 text-zinc-500">
                                <code>
{`OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_HEADERS=x-uptrace-api-key=YOUR_PROJECT_API_KEY
OTEL_SERVICE_NAME=my-application
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production`}
                                </code>
                            </pre>
                        </div>
                    </section>

                    {/* Verify */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    3. Verify your setup
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    Start your application and send a test
                                    request. Uptrace will automatically detect
                                    incoming telemetry.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-black px-4 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                            >
                                Check telemetry
                            </button>
                        </div>
                    </section>

                    {/* Docs */}
                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-300">
                                Need more configuration options?
                            </p>

                            <p className="mt-1 text-[11px] text-zinc-700">
                                Explore OpenTelemetry instrumentation and
                                exporter configuration.
                            </p>
                        </div>

                        <Link
                            href="#"
                            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
                        >
                            Read documentation
                            <ExternalLink className="h-3 w-3" />
                        </Link>
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
                className={`
                    flex h-7 w-7 items-center justify-center
                    rounded-full border
                    text-[10px] font-semibold
                    ${
                        active
                            ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                            : "border-zinc-900 bg-black text-zinc-700"
                    }
                `}
            >
                {number}
            </div>

            <span
                className={`text-xs ${
                    active ? "text-zinc-300" : "text-zinc-700"
                }`}
            >
                {title}
            </span>
        </div>
    );
}

function CodeBlock({ code }: { code: string }) {
    return (
        <div className="overflow-x-auto border-t border-zinc-900 bg-black">
            <pre className="min-w-[650px] p-5 font-mono text-[11px] leading-6 text-zinc-500">
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
    const [visible, setVisible] = useState(false);

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

                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    className="shrink-0 text-[10px] text-zinc-700 hover:text-zinc-300"
                >
                    {secret
                        ? visible
                            ? "Hide"
                            : "Show"
                        : "Copy"}
                </button>
            </div>
        </div>
    );
}