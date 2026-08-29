"use client";

import { useState } from "react";
import {
    AlertTriangle,
    Check,
    ChevronDown,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    Plus,
    ShieldCheck,
    Terminal,
    Trash2,
    X,
} from "lucide-react";

import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

const apiKeys = [
    {
        id: 1,
        name: "Production",
        key: "up_prod_••••••••••••••••7f8c",
        created: "Aug 18, 2026",
        lastUsed: "2 minutes ago",
        environment: "production",
    },
    {
        id: 2,
        name: "Development",
        key: "up_dev_••••••••••••••••4a2d",
        created: "Aug 12, 2026",
        lastUsed: "18 minutes ago",
        environment: "development",
    },
];

export default function ApiKeysPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [showKey, setShowKey] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    const copyKey = () => {
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1800);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-7">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <KeyRound className="h-3.5 w-3.5" />
                            Settings
                            <span>/</span>
                            API Keys
                        </div>

                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    API Keys
                                </h1>

                                <p className="mt-1 max-w-xl text-sm text-zinc-600">
                                    Manage the keys your applications use to
                                    send telemetry to Uptrace.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCreate(true)}
                                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-xs font-medium text-black transition-colors hover:bg-white"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Create API key
                            </button>
                        </div>
                    </div>

                    {/* Security notice */}
                    <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                        <div>
                            <p className="text-xs font-medium text-amber-500">
                                Keep your API keys secure
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                API keys provide access to send telemetry to
                                your project. Never expose them in client-side
                                code or commit them to source control.
                            </p>
                        </div>
                    </div>

                    {/* Keys */}
                    <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Your API keys
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {apiKeys.length} active keys
                                </p>
                            </div>

                            <ShieldCheck className="h-4 w-4 text-zinc-700" />
                        </div>

                        <div className="divide-y divide-zinc-900/70">
                            {apiKeys.map((apiKey) => (
                                <div
                                    key={apiKey.id}
                                    className="px-5 py-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                        {/* Icon */}
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                            <KeyRound className="h-4 w-4 text-zinc-600" />
                                        </div>

                                        {/* Name */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-xs font-medium text-zinc-300">
                                                    {apiKey.name}
                                                </p>

                                                <span className="rounded-md border border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0.5 text-[9px] text-emerald-600">
                                                    Active
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[10px] text-zinc-800">
                                                Created {apiKey.created}
                                            </p>
                                        </div>

                                        {/* Key */}
                                        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-zinc-900 bg-black px-3 py-2 lg:w-[280px]">
                                            <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-zinc-600">
                                                {showKey === apiKey.id
                                                    ? "up_prod_7f8c91a2e4d8c72b91"
                                                    : apiKey.key}
                                            </code>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowKey(
                                                        showKey === apiKey.id
                                                            ? null
                                                            : apiKey.id,
                                                    )
                                                }
                                                className="shrink-0 text-zinc-800 hover:text-zinc-400"
                                                aria-label="Toggle API key visibility"
                                            >
                                                {showKey === apiKey.id ? (
                                                    <EyeOff className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Eye className="h-3.5 w-3.5" />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={copyKey}
                                                className="shrink-0 text-zinc-800 hover:text-zinc-400"
                                                aria-label="Copy API key"
                                            >
                                                {copied ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Last used */}
                                        <div className="lg:w-[120px]">
                                            <p className="text-[9px] uppercase tracking-wider text-zinc-800">
                                                Last used
                                            </p>

                                            <p className="mt-1 text-[10px] text-zinc-600">
                                                {apiKey.lastUsed}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            type="button"
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-800 transition-colors hover:bg-red-500/5 hover:text-red-400"
                                            aria-label={`Revoke ${apiKey.name} API key`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* OTel setup */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                    <Terminal className="h-4 w-4 text-zinc-600" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Instrument your application
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-zinc-700">
                                        Use your API key with OpenTelemetry to
                                        send traces, metrics and logs to
                                        Uptrace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300"
                                >
                                    Node.js
                                    <ChevronDown className="h-3 w-3 text-zinc-600" />
                                </button>

                                <button
                                    type="button"
                                    className="h-9 rounded-lg border border-zinc-900 px-3 text-xs text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                >
                                    Python
                                </button>

                                <button
                                    type="button"
                                    className="h-9 rounded-lg border border-zinc-900 px-3 text-xs text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                >
                                    Go
                                </button>

                                <button
                                    type="button"
                                    className="h-9 rounded-lg border border-zinc-900 px-3 text-xs text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                >
                                    Java
                                </button>
                            </div>

                            <div className="relative overflow-hidden rounded-lg border border-zinc-900 bg-black">
                                <button
                                    type="button"
                                    onClick={copyKey}
                                    className="absolute right-3 top-3 flex h-7 items-center gap-1.5 rounded-md border border-zinc-900 bg-zinc-950 px-2 text-[10px] text-zinc-600 hover:text-zinc-300"
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

                                <pre className="overflow-x-auto p-5 pr-20 font-mono text-[11px] leading-6 text-zinc-600">
                                    <code>
                                        <span className="text-zinc-500">
                                            npm install
                                        </span>{" "}
                                        @opentelemetry/sdk-node{"\n"}
                                        {"\n"}
                                        <span className="text-zinc-500">
                                            OTEL_EXPORTER_OTLP_ENDPOINT
                                        </span>
                                        =
                                        <span className="text-zinc-400">
                                            "https://api.uptrace.dev"
                                        </span>
                                        {"\n"}
                                        <span className="text-zinc-500">
                                            UPTRACE_DSN
                                        </span>
                                        =
                                        <span className="text-zinc-400">
                                            "https://..."
                                        </span>
                                    </code>
                                </pre>
                            </div>

                            <p className="mt-3 text-[10px] text-zinc-800">
                                Configuration shown here is a preview. The
                                actual DSN and instrumentation instructions
                                will be generated from your project settings.
                            </p>
                        </div>
                    </section>

                    {/* Empty/help section */}
                    <div className="mt-6 flex flex-col justify-between gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-xs font-medium text-zinc-400">
                                Need help setting up OpenTelemetry?
                            </p>

                            <p className="mt-1 text-[10px] text-zinc-700">
                                Follow the instrumentation guide for your
                                application.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="text-left text-[11px] text-zinc-500 hover:text-zinc-300"
                        >
                            Read documentation →
                        </button>
                    </div>
                </div>
            </main>

            {/* Create modal */}
            {showCreate && (
                <CreateKeyModal
                    onClose={() => setShowCreate(false)}
                />
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Create API Key Modal                                                       */
/* -------------------------------------------------------------------------- */

function CreateKeyModal({
    onClose,
}: {
    onClose: () => void;
}) {
    const [name, setName] = useState("");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-md rounded-xl border border-zinc-900 bg-zinc-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-200">
                            Create API key
                        </h2>

                        <p className="mt-1 text-[10px] text-zinc-700">
                            Create a key for an application or environment.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-900 hover:text-zinc-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div>
                        <label
                            htmlFor="key-name"
                            className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-700"
                        >
                            Key name
                        </label>

                        <input
                            id="key-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="e.g. Production"
                            className="
                                h-10 w-full rounded-lg
                                border border-zinc-900
                                bg-black px-3
                                text-xs text-zinc-300
                                outline-none
                                placeholder:text-zinc-800
                                focus:border-zinc-700
                            "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-700">
                            Environment
                        </label>

                        <button
                            type="button"
                            className="flex h-10 w-full items-center justify-between rounded-lg border border-zinc-900 bg-black px-3 text-xs text-zinc-500"
                        >
                            Production
                            <ChevronDown className="h-3.5 w-3.5 text-zinc-700" />
                        </button>
                    </div>

                    <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3">
                        <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />

                            <p className="text-[10px] leading-5 text-zinc-600">
                                You will only be able to view the full API
                                key once. Store it securely after creation.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 flex-1 rounded-lg border border-zinc-900 bg-black text-xs text-zinc-500 hover:border-zinc-800 hover:text-zinc-300"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={!name.trim()}
                            className="h-9 flex-1 rounded-lg bg-zinc-100 text-xs font-medium text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Create key
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}