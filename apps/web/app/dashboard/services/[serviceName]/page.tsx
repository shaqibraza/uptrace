"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Database,
    ExternalLink,
    GitBranch,
    Server,
    Timer,
    TriangleAlert,
} from "lucide-react";

import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../../components/ResponsiveDataTable";

import {
    useServicesStore,
} from "../../../../stores/services.store";

import {
    useProjectStore,
} from "../../../../stores/project.store";

type TimeRange = "1h" | "6h" | "24h" | "7d";

const TIME_RANGES: Record<
    TimeRange,
    {
        label: string;
        durationMs: number;
    }
> = {
    "1h": {
        label: "Last 1 hour",
        durationMs: 60 * 60 * 1000,
    },
    "6h": {
        label: "Last 6 hours",
        durationMs: 6 * 60 * 60 * 1000,
    },
    "24h": {
        label: "Last 24 hours",
        durationMs: 24 * 60 * 60 * 1000,
    },
    "7d": {
        label: "Last 7 days",
        durationMs: 7 * 24 * 60 * 60 * 1000,
    },
};

type Endpoint = {
    name: string;
    requests: string;
    latency: string;
    errors: string;
    trend: string;
};

type Trace = {
    id: string;
    operation: string;
    duration: string;
    status: "OK" | "Error" | "Unset";
    time: string;
};

function formatNumber(
    value: number,
    maximumFractionDigits = 2,
): string {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits,
    }).format(value);
}

function formatCompactNumber(
    value: number,
): string {
    if (value >= 1_000_000) {
        return `${formatNumber(value / 1_000_000, 1)}M`;
    }

    if (value >= 1_000) {
        return `${formatNumber(value / 1_000, 1)}K`;
    }

    return formatNumber(value, 0);
}

function formatRate(
    value: number,
): string {
    if (value >= 1000) {
        return `${formatNumber(value, 1)} req/s`;
    }

    if (value >= 100) {
        return `${formatNumber(value, 1)} req/s`;
    }

    return `${formatNumber(value, 2)} req/s`;
}

function formatLatency(
    value: number,
): string {
    if (value < 1000) {
        return `${formatNumber(value, 0)}ms`;
    }

    return `${formatNumber(value / 1000, 2)}s`;
}

function formatPercentage(
    value: number,
): string {
    return `${formatNumber(value, 2)}%`;
}

function formatRelativeTime(
    value: string | Date,
): string {
    const date =
        value instanceof Date
            ? value
            : new Date(value);

    const diff =
        Date.now() - date.getTime();

    if (diff < 0) {
        return "just now";
    }

    const seconds =
        Math.floor(diff / 1000);

    if (seconds < 10) {
        return "just now";
    }

    if (seconds < 60) {
        return `${seconds}s ago`;
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(hours / 24);

    return `${days}d ago`;
}

function getChartValues(
    values: number[],
): number[] {
    if (values.length === 0) {
        return [0];
    }

    return values;
}

function getTrendText(
    trend: "up" | "down" | "flat",
    value: number,
): string {
    if (trend === "flat") {
        return "0.0%";
    }

    const prefix =
        value >= 0 ? "+" : "";

    return `${prefix}${formatNumber(
        value,
        1,
    )}%`;
}

function getTrendPositive(
    trend: "up" | "down" | "flat",
): boolean {
    return trend === "up";
}

function getHealthState(
    errorRate: number,
    requestCount: number,
): "Healthy" | "Degraded" | "Down" {
    if (requestCount === 0) {
        return "Down";
    }

    if (errorRate >= 5) {
        return "Down";
    }

    if (errorRate >= 1) {
        return "Degraded";
    }

    return "Healthy";
}

const endpointColumns: ResponsiveColumn<Endpoint>[] = [
    {
        key: "endpoint",
        header: "Endpoint",
        mobileLabel: "Endpoint",
        render: (endpoint) => (
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                    <GitBranch className="h-3.5 w-3.5 text-zinc-700" />
                </div>

                <span className="truncate font-mono text-xs text-zinc-400">
                    {endpoint.name}
                </span>
            </div>
        ),
    },
    {
        key: "requests",
        header: "Requests",
        render: (endpoint) => (
            <span className="font-mono text-xs text-zinc-600">
                {endpoint.requests}
            </span>
        ),
    },
    {
        key: "latency",
        header: "Latency",
        render: (endpoint) => (
            <span className="font-mono text-xs text-zinc-600">
                {endpoint.latency}
            </span>
        ),
    },
    {
        key: "errors",
        header: "Errors",
        render: (endpoint) => {
            const numericError =
                Number.parseFloat(
                    endpoint.errors,
                );

            return (
                <span
                    className={`font-mono text-xs ${numericError >= 1
                            ? "text-amber-500"
                            : "text-zinc-600"
                        }`}
                >
                    {endpoint.errors}
                </span>
            );
        },
    },
    {
        key: "trend",
        header: "Trend",
        render: (endpoint) => {
            const numericTrend =
                Number.parseFloat(
                    endpoint.trend,
                );

            const positive =
                numericTrend >= 0;

            return (
                <span
                    className={`flex items-center gap-1 text-[11px] ${positive
                            ? "text-emerald-500"
                            : "text-red-400"
                        }`}
                >
                    {positive ? (
                        <ArrowUpRight className="h-3 w-3" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3" />
                    )}

                    {endpoint.trend}
                </span>
            );
        },
    },
];

export default function ServiceDetailPage() {
    const params = useParams();

    const selectedProject =
        useProjectStore(
            (state) =>
                state.selectedProject,
        );

    const projectId =
        selectedProject?.id ?? "";

    const {
        serviceDetail,
        isDetailLoading,
        detailError,
        fetchServiceDetail,
        clearServiceDetail,
    } = useServicesStore();

    const rawServiceName =
        Array.isArray(params.serviceName)
            ? params.serviceName[0]
            : params.serviceName;

    const serviceName = rawServiceName
        ? decodeURIComponent(rawServiceName)
        : "";

    const [timeRange, setTimeRange] =
        useState<TimeRange>("24h");

    const [endpointPage, setEndpointPage] =
        useState(1);

    const [tracePage, setTracePage] =
        useState(1);

    const [
        showTimeRangeMenu,
        setShowTimeRangeMenu,
    ] = useState(false);

    useEffect(() => {
        if (!projectId || !serviceName) {
            clearServiceDetail();
            return;
        }

        const selectedRange =
            TIME_RANGES[timeRange];

        const endTime = new Date();

        const startTime = new Date(
            endTime.getTime() -
            selectedRange.durationMs,
        );

        setEndpointPage(1);
        setTracePage(1);

        void fetchServiceDetail(
            projectId,
            serviceName,
            {
                startTime:
                    startTime.toISOString(),
                endTime:
                    endTime.toISOString(),
            },
        );
    }, [
        projectId,
        serviceName,
        timeRange,
        fetchServiceDetail,
        clearServiceDetail,
    ]);

    const service =
        serviceDetail;

    const timeSeries =
        service?.timeSeries ?? [];

    const requestData =
        useMemo(
            () =>
                getChartValues(
                    timeSeries.map(
                        (point) =>
                            point.requestRate,
                    ),
                ),
            [timeSeries],
        );

    const latencyData =
        useMemo(
            () =>
                getChartValues(
                    timeSeries.map(
                        (point) =>
                            point.averageLatencyMs,
                    ),
                ),
            [timeSeries],
        );

    const errorData =
        useMemo(
            () =>
                getChartValues(
                    timeSeries.map(
                        (point) =>
                            point.errorRate,
                    ),
                ),
            [timeSeries],
        );

    const endpoints =
        useMemo<Endpoint[]>(
            () =>
                (service?.operations ?? []).map(
                    (operation) => ({
                        name:
                            operation.name,

                        requests:
                            formatCompactNumber(
                                operation.requestCount,
                            ),

                        latency:
                            formatLatency(
                                operation.p95LatencyMs,
                            ),

                        errors:
                            formatPercentage(
                                operation.errorRate,
                            ),

                        // Operation trend is not currently
                        // returned by the backend.
                        trend: "0.0%",
                    }),
                ),
            [service],
        );

    const traces =
        useMemo<Trace[]>(
            () =>
                (
                    service?.recentTraces ??
                    []
                ).map((trace) => ({
                    id:
                        trace.traceId,

                    operation:
                        trace.operationName,

                    duration:
                        formatLatency(
                            trace.durationMs,
                        ),

                    status:
                        trace.status ===
                            "OK"
                            ? "OK"
                            : trace.status ===
                                "ERROR"
                                ? "Error"
                                : "Unset",

                    time:
                        formatRelativeTime(
                            trace.startTime,
                        ),
                })),
            [service],
        );

    const ENDPOINTS_PER_PAGE = 5;
    const TRACES_PER_PAGE = 10;

    const endpointPageCount = Math.max(
        1,
        Math.ceil(endpoints.length / ENDPOINTS_PER_PAGE),
    );

    const tracePageCount = Math.max(
        1,
        Math.ceil(traces.length / TRACES_PER_PAGE),
    );

    const paginatedEndpoints = endpoints.slice(
        (endpointPage - 1) * ENDPOINTS_PER_PAGE,
        endpointPage * ENDPOINTS_PER_PAGE,
    );

    const paginatedTraces = traces.slice(
        (tracePage - 1) * TRACES_PER_PAGE,
        tracePage * TRACES_PER_PAGE,
    );

    const health = service
        ? getHealthState(
            service.errorRate,
            service.requestCount,
        )
        : "Down";

    const trendPositive =
        service
            ? getTrendPositive(
                service.trend,
            )
            : false;

    const trendText =
        service
            ? getTrendText(
                service.trend,
                service.trendValue,
            )
            : "0.0%";

    const selectedRangeLabel =
        TIME_RANGES[timeRange].label;

    if (!projectId) {
        return (
            <div className="p-6">
                <EmptyState
                    title="No project selected"
                    description="Select a project to view service telemetry."
                />
            </div>
        );
    }

    if (
        isDetailLoading &&
        !service
    ) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <Link
                        href="/dashboard/services"
                        className="inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to services
                    </Link>
                </div>

                <LoadingState />
            </div>
        );
    }

    if (detailError && !service) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <Link
                        href="/dashboard/services"
                        className="inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to services
                    </Link>
                </div>

                <EmptyState
                    title="Unable to load service"
                    description={detailError}
                    action={
                        projectId &&
                            serviceName ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const endTime =
                                        new Date();

                                    const startTime =
                                        new Date(
                                            endTime.getTime() -
                                            TIME_RANGES[
                                                timeRange
                                            ]
                                                .durationMs,
                                        );

                                    void fetchServiceDetail(
                                        projectId,
                                        serviceName,
                                        {
                                            startTime:
                                                startTime.toISOString(),
                                            endTime:
                                                endTime.toISOString(),
                                        },
                                    );
                                }}
                                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                            >
                                Retry
                            </button>
                        ) : undefined
                    }
                />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="p-6">
                <div className="mb-6">
                    <Link
                        href="/dashboard/services"
                        className="inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to services
                    </Link>
                </div>

                <EmptyState
                    title="Service not found"
                    description={`No telemetry was found for "${serviceName}".`}
                />
            </div>
        );
    }

    return (
        <div>
            <main>
                <div>
                    {/* Back */}
                    <Link
                        href="/dashboard/services"
                        className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to services
                    </Link>

                    {/* Service header */}
                    <div className="mb-7">
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950">
                                    <Server className="h-5 w-5 text-zinc-500" />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                            {service.name}
                                        </h1>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] ${health ===
                                                    "Healthy"
                                                    ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-500"
                                                    : health ===
                                                        "Degraded"
                                                        ? "border-amber-500/10 bg-amber-500/5 text-amber-500"
                                                        : "border-red-500/10 bg-red-500/5 text-red-400"
                                                }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${health ===
                                                        "Healthy"
                                                        ? "bg-emerald-500"
                                                        : health ===
                                                            "Degraded"
                                                            ? "bg-amber-500"
                                                            : "bg-red-400"
                                                    }`}
                                            />

                                            {health}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-700">
                                        <span>
                                            OTEL
                                        </span>

                                        <span>
                                            {service.requestCount ===
                                                0
                                                ? "No traffic"
                                                : `${formatCompactNumber(
                                                    service.requestCount,
                                                )} requests`}
                                        </span>

                                        <span>
                                            Last seen{" "}
                                            {service.lastSeenAt
                                                ? formatRelativeTime(
                                                    service.lastSeenAt,
                                                )
                                                : "never"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTimeRangeMenu(
                                                (value) =>
                                                    !value,
                                            )
                                        }
                                        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                    >
                                        {
                                            selectedRangeLabel
                                        }

                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>

                                    {showTimeRangeMenu && (
                                        <div className="absolute right-0 z-30 mt-2 min-w-44 overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-xl">
                                            {(
                                                Object.entries(
                                                    TIME_RANGES,
                                                ) as [
                                                    TimeRange,
                                                    {
                                                        label: string;
                                                        durationMs: number;
                                                    },
                                                ][]
                                            ).map(
                                                ([
                                                    key,
                                                    range,
                                                ]) => (
                                                    <button
                                                        key={
                                                            key
                                                        }
                                                        type="button"
                                                        onClick={() => {
                                                            setTimeRange(
                                                                key,
                                                            );

                                                            setShowTimeRangeMenu(
                                                                false,
                                                            );
                                                        }}
                                                        className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition-colors ${timeRange ===
                                                                key
                                                                ? "bg-zinc-900 text-zinc-200"
                                                                : "text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300"
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

                                <Link
                                    href="/dashboard/traces"
                                    className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open traces
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Refresh indicator */}
                    {isDetailLoading && (
                        <div className="mb-4 flex items-center gap-2 text-[10px] text-zinc-700">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
                            Updating telemetry...
                        </div>
                    )}

                    {/* Metrics */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            icon={Activity}
                            label="Request rate"
                            value={formatRate(
                                service.requestRate,
                            )}
                            change={trendText}
                            positive={
                                trendPositive
                            }
                        />

                        <MetricCard
                            icon={Clock3}
                            label="P95 latency"
                            value={formatLatency(
                                service.p95LatencyMs,
                            )}
                            change="Current period"
                            positive
                        />

                        <MetricCard
                            icon={TriangleAlert}
                            label="Error rate"
                            value={formatPercentage(
                                service.errorRate,
                            )}
                            change={
                                service.errorCount ===
                                    0
                                    ? "No errors"
                                    : `${formatCompactNumber(
                                        service.errorCount,
                                    )} errors`
                            }
                            positive={
                                service.errorRate <
                                1
                            }
                        />

                        <MetricCard
                            icon={Server}
                            label="Telemetry uptime"
                            value={formatPercentage(
                                service.uptime,
                            )}
                            change={
                                service.requestCount >
                                    0
                                    ? "Based on spans"
                                    : "No traffic"
                            }
                            positive={
                                service.uptime >=
                                99
                            }
                        />
                    </div>

                    {/* Main charts */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <ChartCard
                            title="Request rate"
                            subtitle="Requests per second"
                            value={formatRate(
                                service.requestRate,
                            )}
                            data={requestData}
                            timeRange={timeRange}
                        />

                        <ChartCard
                            title="Latency"
                            subtitle="Average response time"
                            value={formatLatency(
                                service.averageLatencyMs,
                            )}
                            data={latencyData}
                            timeRange={timeRange}
                        />
                    </div>

                    {/* Error chart */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Error rate
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Errors over the selected period
                                </p>
                            </div>

                            <span className="font-mono text-xs text-zinc-500">
                                {formatPercentage(
                                    service.errorRate,
                                )}
                            </span>
                        </div>

                        <div className="p-5">
                            <MiniLineChart
                                data={errorData}
                            />

                            <ChartLabels
                                timeRange={
                                    timeRange
                                }
                            />
                        </div>
                    </section>

                    {/* Endpoints + dependencies */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
                        {/* Endpoints */}
                        <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Endpoints
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Top operations for this service
                                    </p>
                                </div>

                                <GitBranch className="h-4 w-4 text-zinc-700" />
                            </div>

                            {endpoints.length > 0 ? (
                                <>
                                    <ResponsiveDataTable
                                        data={
                                            paginatedEndpoints
                                        }
                                        columns={
                                            endpointColumns
                                        }
                                        rowKey={(
                                            endpoint,
                                        ) =>
                                            endpoint.name
                                        }
                                    />

                                    {endpointPageCount > 1 && (
                                        <Pagination
                                            currentPage={endpointPage}
                                            totalPages={endpointPageCount}
                                            onPageChange={setEndpointPage}
                                            totalItems={endpoints.length}
                                            pageSize={ENDPOINTS_PER_PAGE}
                                        />
                                    )}
                                </>
                            ) : (
                                <EmptySection
                                    icon={
                                        GitBranch
                                    }
                                    title="No operations"
                                    description="No operations were recorded for this period."
                                />
                            )}
                        </section>

                        {/* Dependencies */}
                        <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="border-b border-zinc-900 px-5 py-4">
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Dependencies
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Services and resources this service calls
                                </p>
                            </div>

                            <EmptySection
                                icon={Database}
                                title="Dependency data unavailable"
                                description="Dependency mapping is not available from the current telemetry schema."
                            />
                        </section>
                    </div>

                    {/* Recent traces */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Recent traces
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Latest traces generated by this service
                                </p>
                            </div>

                            <Link
                                href="/dashboard/traces"
                                className="flex items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
                            >
                                View all

                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {traces.length > 0 ? (
                            <>
                                <div className="divide-y divide-zinc-900/70">
                                    {paginatedTraces.map(
                                        (trace) => (
                                            <Link
                                                key={
                                                    trace.id
                                                }
                                                href="/dashboard/traces"
                                                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-zinc-900/20 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                                    {trace.status ===
                                                        "OK" ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                    ) : trace.status ===
                                                        "Error" ? (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                                    ) : (
                                                        <Clock3 className="h-3.5 w-3.5 text-zinc-600" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-mono text-xs text-zinc-400">
                                                        {
                                                            trace.operation
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate font-mono text-[10px] text-zinc-800">
                                                        {
                                                            trace.id
                                                        }
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                                    <span className="font-mono text-xs text-zinc-600">
                                                        {
                                                            trace.duration
                                                        }
                                                    </span>

                                                    <span
                                                        className={`text-[10px] ${trace.status ===
                                                                "OK"
                                                                ? "text-emerald-600"
                                                                : trace.status ===
                                                                    "Error"
                                                                    ? "text-red-400"
                                                                    : "text-zinc-600"
                                                            }`}
                                                    >
                                                        {
                                                            trace.status
                                                        }
                                                    </span>

                                                    <span className="text-[10px] text-zinc-800">
                                                        {
                                                            trace.time
                                                        }
                                                    </span>
                                                </div>
                                            </Link>
                                        ),
                                    )}
                                </div>

                                {tracePageCount > 1 && (
                                    <Pagination
                                        currentPage={tracePage}
                                        totalPages={tracePageCount}
                                        onPageChange={setTracePage}
                                        totalItems={traces.length}
                                        pageSize={TRACES_PER_PAGE}
                                    />
                                )}
                            </>
                        ) : (
                            <EmptySection
                                icon={Activity}
                                title="No recent traces"
                                description="No traces were recorded for this service in the selected period."
                            />
                        )}
                    </section>

                    {/* Instances */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Instances
                            </h2>

                            <p className="mt-1 text-xs text-zinc-700">
                                Runtime instance information
                            </p>
                        </div>

                        <EmptySection
                            icon={Server}
                            title="Instance metrics unavailable"
                            description="CPU, memory, region and instance-level health are not currently exposed by the backend telemetry API."
                        />
                    </section>

                    <div className="mt-6 flex items-center gap-2 text-[10px] text-zinc-800">
                        <Timer className="h-3 w-3" />

                        Data shown for the selected{" "}
                        {
                            TIME_RANGES[
                                timeRange
                            ].label.toLowerCase()
                        }.
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ========================================================================== */
/* Pagination                                                                 */
/* ========================================================================== */

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
}) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-3 border-t border-zinc-900 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-zinc-700">
                Showing {startItem}-{endItem} of {totalItems}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-900 bg-zinc-950 text-zinc-600 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ArrowLeft className="h-3 w-3" />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-[10px] transition-colors ${
                                currentPage === page
                                    ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                                    : "border-transparent text-zinc-700 hover:border-zinc-900 hover:bg-zinc-950 hover:text-zinc-400"
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-900 bg-zinc-950 text-zinc-600 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Metric Card                                                                */
/* ========================================================================== */

function MetricCard({
    icon: Icon,
    label,
    value,
    change,
    positive,
}: {
    icon: typeof Activity;
    label: string;
    value: string;
    change: string;
    positive: boolean;
}) {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 transition-colors hover:border-zinc-800">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">
                    {label}
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                    <Icon className="h-4 w-4 text-zinc-700" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">
                {value}
            </p>

            <div className="mt-1 flex items-center gap-1 text-[10px]">
                {positive ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                    <ArrowDownRight className="h-3 w-3 text-amber-500" />
                )}

                <span
                    className={
                        positive
                            ? "text-emerald-500"
                            : "text-amber-500"
                    }
                >
                    {change}
                </span>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Chart Card                                                                 */
/* ========================================================================== */

function ChartCard({
    title,
    subtitle,
    value,
    data,
    timeRange,
}: {
    title: string;
    subtitle: string;
    value: string;
    data: number[];
    timeRange: TimeRange;
}) {
    const max =
        Math.max(...data, 0);

    const safeMax =
        max > 0 ? max : 1;

    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex flex-col gap-2 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-200">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-700">
                        {subtitle}
                    </p>
                </div>

                <span className="font-mono text-xs text-zinc-500">
                    {value}
                </span>
            </div>

            <div className="p-5">
                <div className="relative h-56">
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {[0, 1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="border-t border-zinc-900"
                                />
                            ),
                        )}
                    </div>

                    <div className="absolute inset-0 flex items-end gap-[3px] px-1">
                        {data.map(
                            (
                                item,
                                index,
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    className="group relative flex h-full flex-1 items-end"
                                >
                                    <div
                                        className="w-full rounded-t-[2px] bg-zinc-800 transition-colors group-hover:bg-zinc-600"
                                        style={{
                                            height: `${Math.max(
                                                (
                                                    item /
                                                    safeMax
                                                ) *
                                                100,
                                                item >
                                                    0
                                                    ? 2
                                                    : 0,
                                            )}%`,
                                        }}
                                    />
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <ChartLabels
                    timeRange={timeRange}
                />
            </div>
        </section>
    );
}

/* ========================================================================== */
/* Mini Chart                                                                 */
/* ========================================================================== */

function MiniLineChart({
    data,
}: {
    data: number[];
}) {
    const max =
        Math.max(...data, 0);

    const safeMax =
        max > 0 ? max : 1;

    return (
        <div className="relative h-52">
            <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map(
                    (item) => (
                        <div
                            key={item}
                            className="border-t border-zinc-900"
                        />
                    ),
                )}
            </div>

            <div className="absolute inset-0 flex items-end gap-[3px] px-1">
                {data.map(
                    (
                        item,
                        index,
                    ) => (
                        <div
                            key={index}
                            className="flex h-full flex-1 items-end"
                        >
                            <div
                                className="w-full rounded-t-[2px] bg-zinc-800"
                                style={{
                                    height: `${Math.max(
                                        (
                                            item /
                                            safeMax
                                        ) *
                                        100,
                                        item >
                                            0
                                            ? 2
                                            : 0,
                                    )}%`,
                                }}
                            />
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Chart Labels                                                               */
/* ========================================================================== */

function ChartLabels({
    timeRange,
}: {
    timeRange: TimeRange;
}) {
    const labels =
        timeRange === "1h"
            ? [
                "1h ago",
                "45m",
                "30m",
                "15m",
                "Now",
            ]
            : timeRange === "6h"
                ? [
                    "6h ago",
                    "4.5h",
                    "3h",
                    "1.5h",
                    "Now",
                ]
                : timeRange === "7d"
                    ? [
                        "7d ago",
                        "5d",
                        "3d",
                        "1d",
                        "Now",
                    ]
                    : [
                        "24h ago",
                        "18h",
                        "12h",
                        "6h",
                        "Now",
                    ];

    return (
        <div className="mt-3 flex justify-between text-[10px] text-zinc-800">
            {labels.map(
                (label) => (
                    <span
                        key={label}
                    >
                        {label}
                    </span>
                ),
            )}
        </div>
    );
}

/* ========================================================================== */
/* Empty State                                                                */
/* ========================================================================== */

function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                <TriangleAlert className="h-4 w-4 text-zinc-600" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-zinc-300">
                {title}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-700">
                {description}
            </p>

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}

/* ========================================================================== */
/* Empty Section                                                              */
/* ========================================================================== */

function EmptySection({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Activity;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                <Icon className="h-4 w-4 text-zinc-700" />
            </div>

            <p className="mt-3 text-xs font-medium text-zinc-500">
                {title}
            </p>

            <p className="mt-1 max-w-xs text-[10px] leading-4 text-zinc-800">
                {description}
            </p>
        </div>
    );
}

/* ========================================================================== */
/* Loading                                                                    */
/* ========================================================================== */

function LoadingState() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-xl border border-zinc-900 bg-zinc-950"
                        />
                    ),
                )}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                {[1, 2].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-80 animate-pulse rounded-xl border border-zinc-900 bg-zinc-950"
                        />
                    ),
                )}
            </div>

            <div className="h-64 animate-pulse rounded-xl border border-zinc-900 bg-zinc-950" />
        </div>
    );
}