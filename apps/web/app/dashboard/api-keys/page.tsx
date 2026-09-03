"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Check,
    ChevronDown,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    Plus,
    RefreshCw,
    ShieldCheck,
    Terminal,
    Trash2,
    X,
} from "lucide-react";


import { useProjectStore } from "../../../stores/project.store";
import { useApiKeyStore } from "../../../stores/api-key.store";
import type { ProjectApiKey } from "../../../lib/api/api-key.api";

function formatDate(value: string) {
    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "Unknown date";
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

function formatLastUsed(
    value: string | null,
) {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "Never";
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

        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return formatDate(value);
}

function getDisplayKey(
    apiKey: ProjectApiKey,
) {
    return `${apiKey.keyPrefix}••••••••••••••••`;
}

export default function ApiKeysPage() {
    const selectedProject = useProjectStore(
        (state) => state.selectedProject,
    );

    const {
        apiKeys,
        createdApiKey,
        isLoading,
        isCreating,
        isRevoking,
        error,
        fetchApiKeys,
        createApiKey,
        revokeApiKey,
        clearCreatedApiKey,
        clearError,
    } = useApiKeyStore();

    const [showCreate, setShowCreate] =
        useState(false);

    const [visibleKeyId, setVisibleKeyId] =
        useState<string | null>(null);

    const [copiedKeyId, setCopiedKeyId] =
        useState<string | null>(null);

    const [showRevoke, setShowRevoke] =
        useState<ProjectApiKey | null>(null);

    const [refreshing, setRefreshing] =
        useState(false);

    const [instrumentationKeyId, setInstrumentationKeyId] =
        useState<string | null>(null);

    const [instrumentationCopied, setInstrumentationCopied] =
        useState(false);

    const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

    const telemetryEndpoint =
        `${apiBaseUrl.replace(/\/$/, "")}/v1/traces`;

    const activeKeys = useMemo(
        () =>
            apiKeys.filter(
                (apiKey) =>
                    !apiKey.revokedAt,
            ),
        [apiKeys],
    );

    const selectedInstrumentationKey = useMemo(
        () =>
            apiKeys.find(
                (apiKey) =>
                    apiKey.id ===
                    instrumentationKeyId,
            ) ?? null,
        [apiKeys, instrumentationKeyId],
    );

    useEffect(() => {
        if (instrumentationKeyId) {
            const keyExists = apiKeys.some(
                (apiKey) =>
                    apiKey.id ===
                    instrumentationKeyId &&
                    !apiKey.revokedAt,
            );

            if (keyExists) {
                return;
            }
        }

        const firstActiveKey =
            apiKeys.find(
                (apiKey) =>
                    !apiKey.revokedAt,
            );

        setInstrumentationKeyId(
            firstActiveKey?.id ?? null,
        );
    }, [
        apiKeys,
        instrumentationKeyId,
    ]);

    useEffect(() => {
        setVisibleKeyId(null);
        setCopiedKeyId(null);
        clearCreatedApiKey();
        clearError();

        if (!selectedProject?.id) {
            return;
        }

        void fetchApiKeys(
            selectedProject.id,
        ).catch(() => { });
    }, [
        selectedProject?.id,
        clearCreatedApiKey,
        clearError,
        fetchApiKeys,
    ]);

    const handleRefresh = async () => {
        if (!selectedProject?.id) {
            return;
        }

        setRefreshing(true);

        try {
            await fetchApiKeys(
                selectedProject.id,
            );
        } catch {
        } finally {
            setRefreshing(false);
        }
    };

    const handleCopyKey = async (
        apiKey: ProjectApiKey,
    ) => {
        if (
            !createdApiKey ||
            apiKey.id !== createdApiKey.id
        ) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                createdApiKey.key,
            );

            setCopiedKeyId(apiKey.id);

            window.setTimeout(() => {
                setCopiedKeyId((current) =>
                    current === apiKey.id
                        ? null
                        : current,
                );
            }, 1800);
        } catch {
            useApiKeyStore.setState({
                error:
                    "Unable to copy the API key. Please copy it manually.",
            });
        }
    };

    const handleToggleKey = (
        apiKey: ProjectApiKey,
    ) => {
        if (
            !createdApiKey ||
            apiKey.id !== createdApiKey.id
        ) {
            return;
        }

        setVisibleKeyId((current) =>
            current === apiKey.id
                ? null
                : apiKey.id,
        );
    };

    const handleCreateKey = async (
        name: string,
    ) => {
        if (!selectedProject?.id) {
            throw new Error(
                "Please select a project first.",
            );
        }

        await createApiKey(
            selectedProject.id,
            name,
        );

        setShowCreate(false);
        setVisibleKeyId(
            useApiKeyStore.getState()
                .createdApiKey?.id ?? null,
        );
    };

    const handleRevokeKey = async () => {
        if (
            !selectedProject?.id ||
            !showRevoke
        ) {
            return;
        }

        try {
            const revoked =
                await revokeApiKey(
                    selectedProject.id,
                    showRevoke.id,
                );

            if (
                visibleKeyId === revoked.id
            ) {
                setVisibleKeyId(null);
            }

            if (
                createdApiKey?.id ===
                revoked.id
            ) {
                clearCreatedApiKey();
            }

            setShowRevoke(null);
        } catch {
        }
    };

    return (
        <div>
            <main>
                <div>
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

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleRefresh()
                                    }
                                    disabled={
                                        !selectedProject?.id ||
                                        isLoading ||
                                        refreshing
                                    }
                                    className="flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 ${refreshing
                                            ? "animate-spin"
                                            : ""
                                            }`}
                                    />
                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreate(true)
                                    }
                                    disabled={
                                        !selectedProject?.id
                                    }
                                    className="flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 text-xs font-medium text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Create API key
                                </button>
                            </div>
                        </div>
                    </div>

                    {!selectedProject?.id && (
                        <div className="mb-6 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                    <KeyRound className="h-4 w-4 text-zinc-700" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-zinc-300">
                                        Select a project
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                        Select a project from the project
                                        switcher to manage its API keys.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-red-400">
                                        Unable to complete request
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                        {error}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={clearError}
                                    className="ml-auto shrink-0 text-zinc-700 hover:text-zinc-400"
                                    aria-label="Dismiss error"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

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

                    <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Your API keys
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {activeKeys.length} active{" "}
                                    {activeKeys.length === 1
                                        ? "key"
                                        : "keys"}
                                </p>
                            </div>

                            <ShieldCheck className="h-4 w-4 text-zinc-700" />
                        </div>

                        {!selectedProject?.id ? (
                            <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
                                <div>
                                    <KeyRound className="mx-auto h-5 w-5 text-zinc-800" />

                                    <p className="mt-3 text-xs text-zinc-600">
                                        No project selected
                                    </p>
                                </div>
                            </div>
                        ) : isLoading ? (
                            <div className="flex min-h-[220px] items-center justify-center gap-2">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-300" />

                                <span className="text-xs text-zinc-600">
                                    Loading API keys...
                                </span>
                            </div>
                        ) : apiKeys.length === 0 ? (
                            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <KeyRound className="h-4 w-4 text-zinc-700" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    No API keys yet
                                </h3>

                                <p className="mt-1 max-w-sm text-xs text-zinc-700">
                                    Create an API key to connect an application
                                    and send telemetry to this project.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreate(true)
                                    }
                                    className="mt-5 flex h-8 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-black hover:bg-white"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Create API key
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-900/70">
                                {apiKeys.map(
                                    (apiKey) => {
                                        const isRevoked =
                                            Boolean(
                                                apiKey.revokedAt,
                                            );

                                        const isNewlyCreated =
                                            apiKey.id ===
                                            createdApiKey?.id;

                                        const canReveal =
                                            isNewlyCreated &&
                                            Boolean(
                                                createdApiKey?.key,
                                            );

                                        const isVisible =
                                            canReveal &&
                                            visibleKeyId ===
                                            apiKey.id;

                                        return (
                                            <div
                                                key={
                                                    apiKey.id
                                                }
                                                className="px-5 py-5"
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                                        <KeyRound className="h-4 w-4 text-zinc-600" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-xs font-medium text-zinc-300">
                                                                {
                                                                    apiKey.name
                                                                }
                                                            </p>

                                                            <span
                                                                className={`rounded-md border px-1.5 py-0.5 text-[9px] ${isRevoked
                                                                    ? "border-red-500/10 bg-red-500/5 text-red-500"
                                                                    : "border-emerald-500/10 bg-emerald-500/5 text-emerald-600"
                                                                    }`}
                                                            >
                                                                {isRevoked
                                                                    ? "Revoked"
                                                                    : "Active"}
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-[10px] text-zinc-800">
                                                            Created{" "}
                                                            {formatDate(
                                                                apiKey.createdAt,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-zinc-900 bg-black px-3 py-2 lg:w-[320px]">
                                                        <code className="min-w-0 flex-1 truncate font-mono text-[10px] text-zinc-600">
                                                            {isVisible
                                                                ? createdApiKey?.key
                                                                : getDisplayKey(
                                                                    apiKey,
                                                                )}
                                                        </code>

                                                        {canReveal && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleToggleKey(
                                                                        apiKey,
                                                                    )
                                                                }
                                                                className="shrink-0 text-zinc-800 hover:text-zinc-400"
                                                                aria-label={
                                                                    isVisible
                                                                        ? "Hide API key"
                                                                        : "Show API key"
                                                                }
                                                            >
                                                                {isVisible ? (
                                                                    <EyeOff className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {isNewlyCreated && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleCopyKey(
                                                                        apiKey,
                                                                    )
                                                                }
                                                                className="shrink-0 text-zinc-800 hover:text-zinc-400"
                                                                aria-label="Copy API key"
                                                            >
                                                                {copiedKeyId ===
                                                                    apiKey.id ? (
                                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="lg:w-[120px]">
                                                        <p className="text-[9px] uppercase tracking-wider text-zinc-800">
                                                            Last used
                                                        </p>

                                                        <p className="mt-1 text-[10px] text-zinc-600">
                                                            {formatLastUsed(
                                                                apiKey.lastUsedAt,
                                                            )}
                                                        </p>
                                                    </div>

                                                    {!isRevoked && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowRevoke(
                                                                    apiKey,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-800 transition-colors hover:bg-red-500/5 hover:text-red-400"
                                                            aria-label={`Revoke ${apiKey.name} API key`}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {isNewlyCreated && (
                                                    <div className="mt-4 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
                                                        <div className="flex gap-2">
                                                            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />

                                                            <div>
                                                                <p className="text-[10px] font-medium text-emerald-500">
                                                                    API key created
                                                                </p>

                                                                <p className="mt-1 text-[10px] leading-5 text-zinc-600">
                                                                    This is the only
                                                                    time the full
                                                                    API key is
                                                                    available.
                                                                    Copy and store
                                                                    it securely
                                                                    before leaving
                                                                    this page.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        )}
                    </section>

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
                                        Configure OpenTelemetry to send traces,
                                        metrics and logs to Uptrace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300"
                                >
                                    Node.js
                                    <ChevronDown className="h-3 w-3 text-zinc-600" />
                                </button>

                                <button
                                    type="button"
                                    disabled
                                    className="h-9 rounded-lg border border-zinc-900 px-3 text-xs text-zinc-700"
                                >
                                    Python
                                </button>

                                <button
                                    type="button"
                                    disabled
                                    className="h-9 rounded-lg border border-zinc-900 px-3 text-xs text-zinc-700"
                                >
                                    Go
                                </button>

                                <button
                                    type="button"
                                    disabled
                                    className="h-9 rounded-lg border border-zinc-900 px-3 text-xs text-zinc-700"
                                >
                                    Java
                                </button>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="instrumentation-api-key"
                                    className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-700"
                                >
                                    API key
                                </label>

                                {activeKeys.length === 0 ? (
                                    <div className="rounded-lg border border-zinc-900 bg-black px-3 py-3">
                                        <p className="text-[10px] text-zinc-600">
                                            Create an active API key first to
                                            configure your application.
                                        </p>
                                    </div>
                                ) : (
                                    <select
                                        id="instrumentation-api-key"
                                        value={
                                            instrumentationKeyId ?? ""
                                        }
                                        onChange={(event) =>
                                            setInstrumentationKeyId(
                                                event.target.value ||
                                                null,
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-zinc-900 bg-black px-3 text-xs text-zinc-300 outline-none focus:border-zinc-700"
                                    >
                                        {activeKeys.map(
                                            (apiKey) => (
                                                <option
                                                    key={
                                                        apiKey.id
                                                    }
                                                    value={
                                                        apiKey.id
                                                    }
                                                >
                                                    {apiKey.name} —{" "}
                                                    {apiKey.keyPrefix}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                )}
                            </div>

                            <div className="relative overflow-hidden rounded-lg border border-zinc-900 bg-black">
                                <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
                                    <div>
                                        <p className="text-[10px] font-medium text-zinc-500">
                                            Node.js
                                        </p>

                                        <p className="mt-0.5 text-[9px] text-zinc-800">
                                            Environment configuration
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={
                                            !selectedInstrumentationKey ||
                                            !createdApiKey ||
                                            createdApiKey.id !==
                                            selectedInstrumentationKey.id
                                        }
                                        onClick={async () => {
                                            if (
                                                !selectedInstrumentationKey ||
                                                !createdApiKey ||
                                                createdApiKey.id !==
                                                selectedInstrumentationKey.id
                                            ) {
                                                return;
                                            }

                                            const configuration =
                                                `OTEL_EXPORTER_OTLP_ENDPOINT=${telemetryEndpoint}\n` +
                                                `UPTRACE_API_KEY=${createdApiKey.key}`;

                                            try {
                                                await navigator.clipboard.writeText(
                                                    configuration,
                                                );

                                                setInstrumentationCopied(
                                                    true,
                                                );

                                                window.setTimeout(
                                                    () => {
                                                        setInstrumentationCopied(
                                                            false,
                                                        );
                                                    },
                                                    1800,
                                                );
                                            } catch {
                                                useApiKeyStore.setState({
                                                    error:
                                                        "Unable to copy the instrumentation configuration.",
                                                });
                                            }
                                        }}
                                        className="flex h-8 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-[10px] text-zinc-600 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        {instrumentationCopied ? (
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

                                <pre className="overflow-x-auto p-5 font-mono text-[11px] leading-6 text-zinc-600">
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
                                            "{telemetryEndpoint}"
                                        </span>
                                        {"\n"}
                                        <span className="text-zinc-500">
                                            UPTRACE_API_KEY
                                        </span>
                                        =
                                        <span className="text-zinc-400">
                                            "
                                            {selectedInstrumentationKey &&
                                                createdApiKey?.id ===
                                                selectedInstrumentationKey.id
                                                ? createdApiKey.key
                                                : selectedInstrumentationKey
                                                    ?.keyPrefix ??
                                                "create a new key"}
                                            "
                                        </span>
                                    </code>
                                </pre>
                            </div>

                            <div className="mt-3 rounded-lg border border-zinc-900 bg-black p-3">
                                <p className="text-[10px] leading-5 text-zinc-600">
                                    Full API keys are only available immediately
                                    after creation. Existing keys can be used for
                                    identification, but their secret value cannot
                                    be recovered.
                                </p>
                            </div>

                            <p className="mt-3 text-[10px] text-zinc-800">
                                Install the OpenTelemetry SDK in your Node.js
                                application and use the generated environment
                                configuration to send telemetry to Uptrace.
                            </p>
                        </div>
                    </section>

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

            {showCreate && (
                <CreateKeyModal
                    onClose={() =>
                        setShowCreate(false)
                    }
                    onCreate={
                        handleCreateKey
                    }
                    loading={isCreating}
                />
            )}

            {showRevoke && (
                <RevokeKeyModal
                    apiKey={showRevoke}
                    loading={
                        isRevoking
                    }
                    onClose={() =>
                        setShowRevoke(null)
                    }
                    onConfirm={
                        handleRevokeKey
                    }
                />
            )}
        </div>
    );
}

function CreateKeyModal({
    onClose,
    onCreate,
    loading,
}: {
    onClose: () => void;
    onCreate: (
        name: string,
    ) => Promise<void>;
    loading: boolean;
}) {
    const [name, setName] =
        useState("");

    const [error, setError] =
        useState<string | null>(null);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            setError(
                "API key name is required.",
            );

            return;
        }

        setError(null);

        try {
            await onCreate(
                trimmedName,
            );
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to create API key.",
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                    if (!loading) {
                        onClose();
                    }
                }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <form
                onSubmit={
                    handleSubmit
                }
                className="relative w-full max-w-md rounded-xl border border-zinc-900 bg-zinc-950 shadow-2xl"
            >
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
                        onClick={() =>
                            !loading &&
                            onClose()
                        }
                        disabled={
                            loading
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-900 hover:text-zinc-300 disabled:opacity-40"
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
                            onChange={(
                                event,
                            ) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            placeholder="e.g. Production"
                            autoFocus
                            disabled={
                                loading
                            }
                            className="
                                h-10 w-full rounded-lg
                                border border-zinc-900
                                bg-black px-3
                                text-xs text-zinc-300
                                outline-none
                                placeholder:text-zinc-800
                                focus:border-zinc-700
                                disabled:opacity-50
                            "
                        />
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-black p-3">
                        <div className="flex gap-2">
                            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />

                            <p className="text-[10px] leading-5 text-zinc-600">
                                The full API key will be shown only once after
                                creation. Store it securely before leaving the
                                page.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/10 bg-red-500/[0.03] p-3">
                            <p className="text-[10px] leading-5 text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                onClose()
                            }
                            disabled={
                                loading
                            }
                            className="h-9 flex-1 rounded-lg border border-zinc-900 bg-black text-xs text-zinc-500 hover:border-zinc-800 hover:text-zinc-300 disabled:opacity-40"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !name.trim()
                            }
                            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-100 text-xs font-medium text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            {loading && (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-500 border-t-black" />
                            )}

                            {loading
                                ? "Creating..."
                                : "Create key"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function RevokeKeyModal({
    apiKey,
    loading,
    onClose,
    onConfirm,
}: {
    apiKey: ProjectApiKey;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close modal"
                onClick={() =>
                    !loading &&
                    onClose()
                }
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-md rounded-xl border border-zinc-900 bg-zinc-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-200">
                            Revoke API key
                        </h2>

                        <p className="mt-1 text-[10px] text-zinc-700">
                            This action will stop the key from authenticating
                            telemetry requests.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            !loading &&
                            onClose()
                        }
                        disabled={
                            loading
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-900 hover:text-zinc-300 disabled:opacity-40"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="rounded-lg border border-red-500/10 bg-red-500/[0.03] p-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

                            <div>
                                <p className="text-xs font-medium text-red-400">
                                    Revoke "{apiKey.name}"?
                                </p>

                                <p className="mt-1 text-[10px] leading-5 text-zinc-600">
                                    Applications using this API key will no
                                    longer be able to send telemetry to this
                                    project.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                loading
                            }
                            className="h-9 flex-1 rounded-lg border border-zinc-900 bg-black text-xs text-zinc-500 hover:border-zinc-800 hover:text-zinc-300 disabled:opacity-40"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                void onConfirm()
                            }
                            disabled={
                                loading
                            }
                            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading && (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                            )}

                            {loading
                                ? "Revoking..."
                                : "Revoke key"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
