"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Server,
    TriangleAlert,
} from "lucide-react";

import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { useOrganizationStore } from "../../stores/organization.store";
import { useProjectStore } from "../../stores/project.store";
import { useOverviewStore } from "../../stores/overview.store";
import { useTraceStore } from "../../stores/trace.store";
import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "./components/ResponsiveDataTable";

type TimeRange =
    | "15m"
    | "1h"
    | "6h"
    | "24h"
    | "7d";

const TIME_RANGES: Array<{
    value: TimeRange;
    label: string;
    milliseconds: number;
}> = [
        {
            value: "15m",
            label: "Last 15 minutes",
            milliseconds: 15 * 60 * 1000,
        },
        {
            value: "1h",
            label: "Last 1 hour",
            milliseconds: 60 * 60 * 1000,
        },
        {
            value: "6h",
            label: "Last 6 hours",
            milliseconds: 6 * 60 * 60 * 1000,
        },
        {
            value: "24h",
            label: "Last 24 hours",
            milliseconds: 24 * 60 * 60 * 1000,
        },
        {
            value: "7d",
            label: "Last 7 days",
            milliseconds: 7 * 24 * 60 * 60 * 1000,
        },
    ];

type RecentTrace = {
    id: string;
    operation: string;
    service: string;
    duration: string;
    status: "OK" | "ERROR" | "UNSET";
    time: string;
};

function getTimeRangeBounds(
    timeRange: TimeRange,
) {
    const range = TIME_RANGES.find(
        (item) => item.value === timeRange,
    );

    const endTime = new Date();

    const startTime = new Date(
        endTime.getTime() -
        (range?.milliseconds ??
            24 * 60 * 60 * 1000),
    );

    return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
    };
}

function formatNumber(
    value: number,
    maximumFractionDigits = 2,
) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits,
    }).format(value);
}

function formatRequestRate(value: number) {
    if (value === 0) {
        return "0 req/s";
    }

    if (value >= 1000) {
        return `${formatNumber(value / 1000, 2)}K req/s`;
    }

    if (value >= 1) {
        return `${formatNumber(value, 2)} req/s`;
    }

    if (value >= 0.01) {
        return `${formatNumber(value, 3)} req/s`;
    }

    return "< 0.01 req/s";
}

function formatLatency(
    value: number,
) {
    return `${formatNumber(value)}ms`;
}

function formatPercentage(
    value: number,
) {
    return `${formatNumber(value)}%`;
}

function formatRelativeTime(
    value: string,
) {
    const timestamp = new Date(value).getTime();

    if (Number.isNaN(timestamp)) {
        return "Unknown";
    }

    const difference =
        Math.max(0, Date.now() - timestamp);

    const seconds = Math.floor(
        difference / 1000,
    );

    if (seconds < 10) {
        return "just now";
    }

    if (seconds < 60) {
        return `${seconds} sec ago`;
    }

    const minutes = Math.floor(
        seconds / 60,
    );

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(
        minutes / 60,
    );

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days = Math.floor(
        hours / 24,
    );

    return `${days}d ago`;
}

function normalizeStatus(
    status: string,
): "OK" | "ERROR" | "UNSET" {
    if (status === "ERROR") {
        return "ERROR";
    }

    if (status === "OK") {
        return "OK";
    }

    return "UNSET";
}

export default function DashboardPage() {
    const services = useOverviewStore(
        (state) => state.services,
    );

    const errorSummary = useOverviewStore(
        (state) => state.errorSummary,
    );

    const selectedOrganization =
        useOrganizationStore(
            (state) =>
                state.selectedOrganization,
        );

    const selectedProject =
        useProjectStore(
            (state) => state.selectedProject,
        );

    const summary =
        useOverviewStore(
            (state) => state.summary,
        );

    const overviewLoading =
        useOverviewStore(
            (state) => state.loading,
        );

    const overviewError =
        useOverviewStore(
            (state) => state.error,
        );

    const fetchOverview =
        useOverviewStore(
            (state) => state.fetchOverview,
        );

    const traces =
        useTraceStore(
            (state) => state.traces,
        );

    const tracesLoading =
        useTraceStore(
            (state) => state.loading,
        );

    const tracesError =
        useTraceStore(
            (state) => state.error,
        );

    const fetchTraces =
        useTraceStore(
            (state) => state.fetchTraces,
        );

    const [timeRange, setTimeRange] =
        useState<TimeRange>("24h");

    const [showTimeRange, setShowTimeRange] =
        useState(false);

    const selectedRange =
        TIME_RANGES.find(
            (item) =>
                item.value === timeRange,
        );

    useEffect(() => {
        if (!selectedProject?.id) {
            return;
        }

        const bounds =
            getTimeRangeBounds(timeRange);

        void fetchOverview(
            selectedProject.id,
            bounds,
        );
    }, [
        selectedProject?.id,
        timeRange,
        fetchOverview,
    ]);

    useEffect(() => {
        if (!selectedProject?.id) {
            return;
        }

        void fetchTraces(
            selectedProject.id,
        );
    }, [
        selectedProject?.id,
        fetchTraces,
    ]);

    const recentTraces =
        useMemo<RecentTrace[]>(() => {
            return traces
                .slice(0, 5)
                .map((trace) => ({
                    id: trace.traceId,
                    operation:
                        trace.operationName ??
                        trace.serviceName,
                    service:
                        trace.serviceName,
                    duration:
                        trace.durationMs !== null
                            ? formatLatency(
                                trace.durationMs,
                            )
                            : "—",
                    status:
                        normalizeStatus(
                            trace.status,
                        ),
                    time: formatRelativeTime(
                        trace.startTime,
                    ),
                }));
        }, [traces]);

    const recentTraceColumns:
        ResponsiveColumn<RecentTrace>[] =
        useMemo(
            () => [
                {
                    key: "operation",
                    header: "Operation",
                    mobileLabel: "Operation",
                    render: (trace) => (
                        <span className="font-mono text-xs text-zinc-400">
                            {trace.operation}
                        </span>
                    ),
                },
                {
                    key: "service",
                    header: "Service",
                    mobileLabel: "Service",
                    render: (trace) => (
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/60" />
                            {trace.service}
                        </span>
                    ),
                },
                {
                    key: "duration",
                    header: "Duration",
                    mobileLabel: "Duration",
                    render: (trace) => (
                        <span className="font-mono text-xs text-zinc-600">
                            {trace.duration}
                        </span>
                    ),
                },
                {
                    key: "status",
                    header: "Status",
                    mobileLabel: "Status",
                    render: (trace) =>
                        trace.status === "OK" ? (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                OK
                            </span>
                        ) : trace.status ===
                            "ERROR" ? (
                            <span className="flex items-center gap-1.5 text-xs text-red-400">
                                <TriangleAlert className="h-3.5 w-3.5" />
                                Error
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-600">
                                Unset
                            </span>
                        ),
                },
                {
                    key: "time",
                    header: "Time",
                    mobileLabel: "Time",
                    render: (trace) => (
                        <span className="text-xs text-zinc-700">
                            {trace.time}
                        </span>
                    ),
                },
            ],
            [],
        );

    const hasSummary =
        summary !== null;

    return (
        <ProtectedRoute>
            <div>
                <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <Activity className="h-3.5 w-3.5" />
                            <span>Monitoring</span>
                            <span>/</span>
                            <span>Overview</span>
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                            Overview
                        </h1>

                        <p className="mt-1 text-sm text-zinc-600">
                            Monitor your application's
                            health and performance
                            {selectedProject
                                ? ` for ${selectedProject.name}.`
                                : "."}
                        </p>

                        {selectedOrganization &&
                            selectedProject && (
                                <p className="mt-2 text-[10px] text-zinc-800">
                                    {
                                        selectedOrganization.name
                                    }
                                    <span className="mx-1.5">
                                        /
                                    </span>
                                    {
                                        selectedProject.name
                                    }
                                </p>
                            )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>

                            <span className="text-xs text-zinc-500">
                                Live
                            </span>
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowTimeRange(
                                        (value) =>
                                            !value,
                                    )
                                }
                                className="
                                    flex h-9
                                    items-center gap-2
                                    rounded-lg
                                    border border-zinc-900
                                    bg-zinc-950
                                    px-3
                                    text-xs text-zinc-500
                                    transition-colors
                                    hover:border-zinc-800
                                    hover:text-zinc-300
                                "
                            >
                                {selectedRange?.label ??
                                    "Last 24 hours"}
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>

                            {showTimeRange && (
                                <div className="absolute right-0 top-11 z-20 min-w-44 overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-xl">
                                    {TIME_RANGES.map(
                                        (range) => (
                                            <button
                                                key={
                                                    range.value
                                                }
                                                type="button"
                                                onClick={() => {
                                                    setTimeRange(
                                                        range.value,
                                                    );
                                                    setShowTimeRange(
                                                        false,
                                                    );
                                                }}
                                                className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition-colors ${timeRange ===
                                                    range.value
                                                    ? "bg-zinc-900 text-zinc-200"
                                                    : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
                                                    }`}
                                            >
                                                {
                                                    range.label
                                                }
                                            </button>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {overviewError && (
                    <div className="mb-6 rounded-lg border border-red-950 bg-red-950/20 px-4 py-3 text-xs text-red-400">
                        {overviewError}
                    </div>
                )}

                {!selectedProject ? (
                    <EmptyState
                        icon={Server}
                        title="No project selected"
                        description="Select a project to view application health and performance."
                    />
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                icon={Activity}
                                label="Request rate"
                                value={
                                    overviewLoading &&
                                        !hasSummary
                                        ? "—"
                                        : formatRequestRate(
                                            summary?.requestRate ??
                                            0,
                                        )
                                }
                            />

                            <MetricCard
                                icon={Clock3}
                                label="P95 latency"
                                value={
                                    overviewLoading &&
                                        !hasSummary
                                        ? "—"
                                        : formatLatency(
                                            summary?.p95Latency ??
                                            0,
                                        )
                                }
                            />

                            <MetricCard
                                icon={
                                    AlertTriangle
                                }
                                label="Error rate"
                                value={
                                    overviewLoading &&
                                        !hasSummary
                                        ? "—"
                                        : formatPercentage(
                                            summary?.errorRate ??
                                            0,
                                        )
                                }
                            />

                            <MetricCard
                                icon={Server}
                                label="Active services"
                                value={
                                    overviewLoading &&
                                        !hasSummary
                                        ? "—"
                                        : formatNumber(
                                            summary?.activeServices ??
                                            0,
                                            0,
                                        )
                                }
                            />
                        </div>

                        <div className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Overview metrics
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Current application performance for{" "}
                                        {selectedRange?.label.toLowerCase() ??
                                            "the selected period"}
                                    </p>
                                </div>

                                {overviewLoading && (
                                    <span className="text-[10px] text-zinc-700">
                                        Updating...
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
                                <OverviewStat
                                    label="Requests"
                                    value={
                                        summary
                                            ? formatRequestRate(
                                                summary.requestRate,
                                            )
                                            : "—"
                                    }
                                    description="Average request rate"
                                />

                                <OverviewStat
                                    label="Latency"
                                    value={
                                        summary
                                            ? formatLatency(
                                                summary.p95Latency,
                                            )
                                            : "—"
                                    }
                                    description="95th percentile"
                                />

                                <OverviewStat
                                    label="Errors"
                                    value={
                                        summary
                                            ? formatPercentage(
                                                summary.errorRate,
                                            )
                                            : "—"
                                    }
                                    description="Percentage of traces"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                                <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-200">
                                            Service health
                                        </h2>

                                        <p className="mt-1 text-xs text-zinc-700">
                                            Current status across your services
                                        </p>
                                    </div>

                                    <Link
                                        href="/dashboard/services"
                                        className="flex items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
                                    >
                                        View all
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>

                                {overviewLoading &&
                                    services.length === 0 ? (
                                    <div className="px-5 py-10 text-center text-xs text-zinc-700">
                                        Loading service health...
                                    </div>
                                ) : services.length === 0 ? (
                                    <EmptyState
                                        icon={Server}
                                        title="No service data"
                                        description="No services were observed during the selected time range."
                                        compact
                                    />
                                ) : (
                                    <div className="divide-y divide-zinc-900/70">
                                        {services.map((service) => (
                                            <Link
                                                key={service.name}
                                                href={`/dashboard/services/${encodeURIComponent(service.name)}`}
                                                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-900/20"
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                                    <Server className="h-3.5 w-3.5 text-zinc-600" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-xs font-medium text-zinc-400">
                                                            {service.name}
                                                        </p>

                                                        <span
                                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${service.status ===
                                                                "Healthy"
                                                                ? "bg-emerald-500"
                                                                : "bg-amber-500"
                                                                }`}
                                                        />
                                                    </div>

                                                    <p className="mt-1 text-[10px] text-zinc-700">
                                                        {formatNumber(
                                                            service.requestCount,
                                                            0,
                                                        )}{" "}
                                                        requests
                                                    </p>
                                                </div>

                                                <div className="hidden text-right sm:block">
                                                    <p className="font-mono text-xs text-zinc-500">
                                                        {formatLatency(
                                                            service.averageLatencyMs,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-zinc-700">
                                                        avg latency
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p
                                                        className={`text-xs ${service.status ===
                                                            "Healthy"
                                                            ? "text-emerald-500"
                                                            : "text-amber-500"
                                                            }`}
                                                    >
                                                        {service.status}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-zinc-700">
                                                        {formatPercentage(
                                                            service.errorRate,
                                                        )}{" "}
                                                        errors
                                                    </p>
                                                </div>

                                                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-800" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                                <div className="border-b border-zinc-900 px-5 py-4">
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Error summary
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Failed traces grouped by operation
                                    </p>
                                </div>

                                <div className="p-5">
                                    {overviewLoading &&
                                        errorSummary.length === 0 ? (
                                        <div className="py-10 text-center text-xs text-zinc-700">
                                            Loading error summary...
                                        </div>
                                    ) : errorSummary.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </div>

                                            <p className="mt-4 text-sm text-emerald-500">
                                                No errors detected
                                            </p>

                                            <p className="mt-1 text-[10px] text-zinc-700">
                                                No failed traces were recorded
                                                during the selected time range.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-3xl font-semibold tracking-tight text-zinc-100">
                                                        {formatPercentage(
                                                            summary?.errorRate ??
                                                            0,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-600">
                                                        <TriangleAlert className="h-3 w-3" />
                                                        Current error rate
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                                    <TriangleAlert className="h-4 w-4 text-zinc-600" />
                                                </div>
                                            </div>

                                            <div className="mt-7 space-y-4">
                                                {errorSummary.map((error) => (
                                                    <ErrorRow
                                                        key={error.endpoint}
                                                        endpoint={error.endpoint}
                                                        count={formatNumber(
                                                            error.count,
                                                            0,
                                                        )}
                                                        percentage={formatPercentage(
                                                            error.percentage,
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>

                        <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Recent traces
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Latest requests captured by
                                        OpenTelemetry
                                    </p>
                                </div>

                                <Link
                                    href="/dashboard/traces"
                                    className="
                                        flex items-center gap-1
                                        text-[11px] text-zinc-600
                                        transition-colors
                                        hover:text-zinc-300
                                    "
                                >
                                    View all
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>

                            {tracesError ? (
                                <div className="px-5 py-8 text-center text-xs text-red-400">
                                    {tracesError}
                                </div>
                            ) : tracesLoading ? (
                                <div className="px-5 py-8 text-center text-xs text-zinc-700">
                                    Loading recent traces...
                                </div>
                            ) : recentTraces.length ===
                                0 ? (
                                <EmptyState
                                    icon={Activity}
                                    title="No traces yet"
                                    description="Send OpenTelemetry traces to this project and they will appear here."
                                    compact
                                />
                            ) : (
                                <ResponsiveDataTable
                                    data={recentTraces}
                                    columns={
                                        recentTraceColumns
                                    }
                                    rowKey={(trace) =>
                                        trace.id
                                    }
                                    onRowClick={(
                                        trace,
                                    ) => {
                                        window.location.href = `/dashboard/traces?trace=${trace.id}`;
                                    }}
                                />
                            )}
                        </section>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <Link
                                href="/dashboard/http-monitoring"
                                className="
                                    group
                                    rounded-xl
                                    border border-zinc-900
                                    bg-zinc-950
                                    p-5
                                    transition-colors
                                    hover:border-zinc-800
                                "
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                        <BarChart3 className="h-4 w-4 text-zinc-600" />
                                    </div>

                                    <ArrowUpRight className="h-4 w-4 text-zinc-800 transition-colors group-hover:text-zinc-500" />
                                </div>

                                <h3 className="mt-5 text-sm font-medium text-zinc-300">
                                    HTTP Endpoint Monitoring
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    Monitor endpoint availability,
                                    response time, and check history.
                                </p>
                            </Link>

                            <Link
                                href="/dashboard/instrumentation"
                                className="
                                    group
                                    rounded-xl
                                    border border-zinc-900
                                    bg-zinc-950
                                    p-5
                                    transition-colors
                                    hover:border-zinc-800
                                "
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                        <Activity className="h-4 w-4 text-zinc-600" />
                                    </div>

                                    <ArrowUpRight className="h-4 w-4 text-zinc-800 transition-colors group-hover:text-zinc-500" />
                                </div>

                                <h3 className="mt-5 text-sm font-medium text-zinc-300">
                                    OpenTelemetry setup
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    Configure your application to start
                                    sending telemetry to Uptrace.
                                </p>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}

function ErrorRow({
    endpoint,
    count,
    percentage,
}: {
    endpoint: string;
    count: string;
    percentage: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-900 bg-black">
                <TriangleAlert className="h-3.5 w-3.5 text-red-400" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-zinc-400">
                    {endpoint}
                </p>

                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                    <div
                        className="h-full rounded-full bg-red-500/60"
                        style={{
                            width: percentage,
                        }}
                    />
                </div>
            </div>

            <div className="shrink-0 text-right">
                <p className="font-mono text-xs text-zinc-500">
                    {count}
                </p>

                <p className="mt-0.5 text-[10px] text-zinc-700">
                    {percentage}
                </p>
            </div>
        </div>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Activity;
    label: string;
    value: string;
}) {
    return (
        <div
            className="
                group
                rounded-xl
                border border-zinc-900
                bg-zinc-950
                p-5
                transition-colors
                hover:border-zinc-800
            "
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">
                    {label}
                </p>

                <div
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        border border-zinc-900
                        bg-black
                        text-zinc-700
                        transition-colors
                        group-hover:text-zinc-500
                    "
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">
                {value}
            </p>
        </div>
    );
}

function OverviewStat({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="bg-zinc-950 p-5">
            <p className="text-xs font-medium text-zinc-500">
                {label}
            </p>

            <p className="mt-3 font-mono text-lg font-semibold text-zinc-200">
                {value}
            </p>

            <p className="mt-1 text-[10px] text-zinc-700">
                {description}
            </p>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
    compact = false,
}: {
    icon: typeof Activity;
    title: string;
    description: string;
    compact?: boolean;
}) {
    return (
        <div
            className={`rounded-xl border border-zinc-900 bg-zinc-950 text-center ${compact
                ? "px-5 py-8"
                : "px-5 py-16"
                }`}
        >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                <Icon className="h-4 w-4 text-zinc-700" />
            </div>

            <h3 className="mt-4 text-sm font-medium text-zinc-400">
                {title}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-zinc-700">
                {description}
            </p>
        </div>
    );
}