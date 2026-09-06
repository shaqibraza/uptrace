"use client";

import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import Link from "next/link";
import {
    Activity,
    ArrowRight,
    BarChart3,
    ChevronDown,
    Clock3,
    Database,
    Gauge,
    MoreHorizontal,
    Plus,
    Search,
    Server,
    TrendingDown,
    TrendingUp,
    X,
} from "lucide-react";

import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../components/ResponsiveDataTable";

import {
    useMetricsStore,
} from "../../../stores/metrics.store";
import {
    useProjectStore,
} from "../../../stores/project.store";
import {
    useAuthStore,
} from "../../../stores/auth.store";

import type {
    MetricSummary,
    MetricType,
    MetricSource,
    MetricTimeSeriesPoint,
} from "../../../lib/api/metrics.api";

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

function formatValue(value: number): string {
    if (!Number.isFinite(value)) {
        return "—";
    }

    if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)}M`;
    }

    if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(2)}K`;
    }

    if (Number.isInteger(value)) {
        return value.toLocaleString();
    }

    return value.toFixed(2);
}

function formatMetricValue(
    value: number,
    unit: string | null,
): string {
    return `${formatValue(value)}${unit ? ` ${unit}` : ""}`;
}

function getMetricSource(
    metric: MetricSummary,
): string {
    return metric.serviceName ?? "unknown";
}

function getChangeFromSeries(
    data: MetricTimeSeriesPoint[],
): {
    value: string;
    positive: boolean;
} {
    if (data.length < 2) {
        return {
            value: "—",
            positive: true,
        };
    }

    const first = data[0]?.averageValue ?? data[0]?.value ?? 0;
    const last =
        data[data.length - 1]?.averageValue ??
        data[data.length - 1]?.value ??
        0;

    if (first === 0) {
        return {
            value: "—",
            positive: true,
        };
    }

    const change = ((last - first) / Math.abs(first)) * 100;

    return {
        value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
        positive: change >= 0,
    };
}

export default function MetricsPage() {
    const [search, setSearch] = useState("");
    const [type, setType] =
        useState<"All" | MetricType>("All");
    const [source, setSource] =
        useState("All sources");
    const [showFilters, setShowFilters] =
        useState(false);
    const [timeRange, setTimeRange] =
        useState<TimeRange>("24h");
    const [showTimeRangeMenu, setShowTimeRangeMenu] =
        useState(false);

    const authStatus = useAuthStore(
        (state) => state.status,
    );

    const selectedProject = useProjectStore(
        (state) => state.selectedProject,
    );

    const {
        metrics,
        summary,
        sources,
        timeSeries,
        secondaryTimeSeries,
        loading,
        detailLoading,
        timeSeriesLoading,
        secondaryTimeSeriesLoading,
        error,
        fetchMetrics,
        fetchMetricTimeSeries,
        fetchSecondaryMetricTimeSeries,
        clearMetrics,
    } = useMetricsStore();

    const projectId = selectedProject?.id;

    const getRangeOptions = () => {
        const endTime = new Date();

        const startTime = new Date(
            endTime.getTime() -
            TIME_RANGES[timeRange].durationMs,
        );

        return {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };
    };

    /*
     * Load metrics overview.
     */
    useEffect(() => {
        if (
            authStatus !== "authenticated" ||
            !projectId
        ) {
            clearMetrics();
            return;
        }

        const options = getRangeOptions();

        fetchMetrics(projectId, options);

    }, [
        authStatus,
        projectId,
        timeRange,
        fetchMetrics,
        clearMetrics,
    ]);

    /*
     * Load time-series data for the first metric.
     *
     * This effect depends on `metrics`, so it will run again
     * after fetchMetrics() successfully populates the metrics array.
     */
    const primaryMetric = metrics[0] ?? null;
    const secondaryMetric = metrics[1] ?? null;

    useEffect(() => {
        const currentProjectId = selectedProject?.id;

        if (
            authStatus !== "authenticated" ||
            !currentProjectId
        ) {
            return;
        }

        const endTime = new Date();

        const startTime = new Date(
            endTime.getTime() -
            TIME_RANGES[timeRange].durationMs,
        );

        const options = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };

        const primaryMetricName = metrics[0]?.name;
        const secondaryMetricName = metrics[1]?.name;

        if (primaryMetricName) {
            fetchMetricTimeSeries(
                currentProjectId,
                primaryMetricName,
                options,
            );
        }

        if (secondaryMetricName) {
            fetchSecondaryMetricTimeSeries(
                currentProjectId,
                secondaryMetricName,
                options,
            );
        }
    }, [
        authStatus,
        selectedProject?.id,
        metrics,
        timeRange,
        fetchMetricTimeSeries,
        fetchSecondaryMetricTimeSeries,
    ]);

    const metricSources = useMemo(() => {
        const names = sources
            .map((item) => item.name)
            .filter(Boolean);

        return [
            "All sources",
            ...Array.from(new Set(names)),
        ];
    }, [sources]);

    const filteredMetrics = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return metrics.filter((metric) => {
            const metricSource =
                getMetricSource(metric);

            const matchesSearch =
                !query ||
                metric.name
                    .toLowerCase()
                    .includes(query) ||
                (metric.description ?? "")
                    .toLowerCase()
                    .includes(query) ||
                metricSource
                    .toLowerCase()
                    .includes(query);

            const matchesType =
                type === "All" ||
                metric.type === type;

            const matchesSource =
                source === "All sources" ||
                metricSource === source;

            return (
                matchesSearch &&
                matchesType &&
                matchesSource
            );
        });
    }, [
        metrics,
        search,
        type,
        source,
    ]);

    const primaryChange =
        getChangeFromSeries(timeSeries);

    const hasActiveFilters =
        search.trim().length > 0 ||
        type !== "All" ||
        source !== "All sources";

    const resetFilters = () => {
        setSearch("");
        setType("All");
        setSource("All sources");
    };

    const retry = () => {
        if (
            authStatus !== "authenticated" ||
            !projectId
        ) {
            return;
        }

        fetchMetrics(
            projectId,
            getRangeOptions(),
        );
    };

    const metricColumns: ResponsiveColumn<MetricSummary>[] =
        [
            {
                key: "name",
                header: "Metric",
                mobileLabel: "Metric",
                render: (metric) => (
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-mono text-xs text-zinc-400">
                                {metric.name}
                            </span>

                            <MetricTypeBadge
                                type={metric.type}
                            />
                        </div>

                        <p className="mt-1 truncate text-[10px] text-zinc-800">
                            {metric.description ??
                                "No description"}
                        </p>
                    </div>
                ),
            },
            {
                key: "value",
                header: "Value",
                render: (metric) => (
                    <span className="font-mono text-[11px] text-zinc-500">
                        {formatMetricValue(
                            metric.latestValue,
                            metric.unit,
                        )}
                    </span>
                ),
            },
            {
                key: "source",
                header: "Source",
                render: (metric) => (
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/60" />

                        <span className="text-[11px] text-zinc-600">
                            {getMetricSource(metric)}
                        </span>
                    </div>
                ),
            },
            {
                key: "points",
                header: "Data points",
                render: (metric) => (
                    <span className="font-mono text-[11px] text-zinc-500">
                        {metric.dataPointCount.toLocaleString()}
                    </span>
                ),
            },
            {
                key: "lastSeen",
                header: "Last seen",
                render: (metric) => (
                    <span className="font-mono text-[10px] text-zinc-600">
                        {metric.lastSeenAt
                            ? new Date(
                                metric.lastSeenAt,
                            ).toLocaleString()
                            : "—"}
                    </span>
                ),
            },
            {
                key: "action",
                header: "",
                mobileLabel: "Action",
                render: (metric) => (
                    <Link
                        href={`/dashboard/metrics/${encodeURIComponent(
                            metric.name,
                        )}`}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                        aria-label={`Open ${metric.name}`}
                    >
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                ),
            },
        ];

    return (
        <div>
            <main>
                <div>
                    {/* Header */}

                    <div className="mb-7">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <BarChart3 className="h-3.5 w-3.5" />

                            <span>Monitoring</span>

                            <span>/</span>

                            <span>Metrics</span>
                        </div>

                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    Metrics
                                </h1>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Explore application and
                                    infrastructure metrics.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTimeRangeMenu(
                                                (current) => !current,
                                            )
                                        }
                                        aria-haspopup="menu"
                                        aria-expanded={
                                            showTimeRangeMenu
                                        }
                                        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                    >
                                        <Clock3 className="h-3.5 w-3.5" />

                                        <span>
                                            {
                                                TIME_RANGES[
                                                    timeRange
                                                ].label
                                            }
                                        </span>

                                        <ChevronDown
                                            className={`h-3.5 w-3.5 transition-transform ${showTimeRangeMenu
                                                ? "rotate-180"
                                                : ""
                                                }`}
                                        />
                                    </button>

                                    {showTimeRangeMenu && (
                                        <div
                                            role="menu"
                                            className="absolute right-0 top-11 z-30 min-w-[170px] overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl shadow-black/40"
                                        >
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
                                                ([value, range]) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        role="menuitem"
                                                        onClick={() => {
                                                            setTimeRange(
                                                                value,
                                                            );
                                                            setShowTimeRangeMenu(
                                                                false,
                                                            );
                                                        }}
                                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${timeRange ===
                                                            value
                                                            ? "bg-zinc-900 text-zinc-200"
                                                            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                                                            }`}
                                                    >
                                                        <span>
                                                            {range.label}
                                                        </span>

                                                        {timeRange ===
                                                            value && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            )}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-black transition-colors hover:bg-white"
                                >
                                    <Plus className="h-3.5 w-3.5" />

                                    Create chart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            icon={BarChart3}
                            label="Active metrics"
                            value={
                                summary
                                    ? summary.activeMetrics.toLocaleString()
                                    : loading
                                        ? "..."
                                        : "0"
                            }
                            detail="currently reporting"
                        />

                        <SummaryCard
                            icon={Activity}
                            label="Data points"
                            value={
                                summary
                                    ? formatValue(
                                        summary.dataPoints,
                                    )
                                    : loading
                                        ? "..."
                                        : "0"
                            }
                            detail="received in range"
                            positive
                        />

                        <SummaryCard
                            icon={Gauge}
                            label="Avg. throughput"
                            value={
                                summary
                                    ? summary.throughput.toFixed(
                                        1,
                                    )
                                    : loading
                                        ? "..."
                                        : "0"
                            }
                            detail="points/sec"
                        />

                        <SummaryCard
                            icon={Clock3}
                            label="Collection delay"
                            value={
                                summary
                                    ? `${(
                                        summary.collectionDelayMs /
                                        1000
                                    ).toFixed(1)}s`
                                    : loading
                                        ? "..."
                                        : "0s"
                            }
                            detail="latest telemetry"
                        />
                    </div>

                    {/* Explorer */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                    <Search className="h-3.5 w-3.5 text-zinc-600" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Metrics explorer
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Select a metric to visualize
                                        its timeseries.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex flex-col gap-3 lg:flex-row">
                                {/* Search */}

                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Search metrics..."
                                        className="h-10 w-full rounded-lg border border-zinc-900 bg-black pl-9 pr-9 text-xs text-zinc-300 outline-none placeholder:text-zinc-800 focus:border-zinc-700"
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-900 hover:text-zinc-400"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Type filters */}

                                <div className="flex gap-2 overflow-x-auto">
                                    {(
                                        [
                                            "All",
                                            "Counter",
                                            "Gauge",
                                            "Histogram",
                                        ] as const
                                    ).map((item) => (
                                        <MetricFilter
                                            key={item}
                                            active={type === item}
                                            onClick={() =>
                                                setType(item)
                                            }
                                        >
                                            {item}
                                        </MetricFilter>
                                    ))}
                                </div>

                                {/* More filters */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${showFilters
                                        ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                                        : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-300"
                                        }`}
                                    aria-label="More filters"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Source filter */}

                            {showFilters && (
                                <div className="mt-4 flex flex-col gap-3 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] text-zinc-700">
                                            Source
                                        </span>

                                        {metricSources.map(
                                            (item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() =>
                                                        setSource(item)
                                                    }
                                                    className={`rounded-md px-2.5 py-1.5 text-[10px] transition-colors ${source === item
                                                        ? "bg-zinc-800 text-zinc-300"
                                                        : "text-zinc-700 hover:bg-zinc-900 hover:text-zinc-500"
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            ),
                                        )}

                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={
                                                    resetFilters
                                                }
                                                className="rounded-md px-2.5 py-1.5 text-[10px] text-zinc-700 hover:bg-zinc-900 hover:text-zinc-400"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    <span className="text-[10px] text-zinc-800">
                                        {filteredMetrics.length}{" "}
                                        matching metrics
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Charts */}

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <MetricChart
                            title={
                                primaryMetric?.description ??
                                "Latest metric"
                            }
                            metric={
                                primaryMetric?.name ??
                                "No metric available"
                            }
                            value={
                                primaryMetric
                                    ? formatMetricValue(
                                        primaryMetric.latestValue,
                                        primaryMetric.unit,
                                    )
                                    : "—"
                            }
                            change={primaryChange.value}
                            data={timeSeries}
                            positive={primaryChange.positive}
                            loading={
                                timeSeriesLoading ||
                                detailLoading
                            }
                        />

                        <MetricChart
                            title={
                                secondaryMetric?.description ??
                                "Second metric"
                            }
                            metric={
                                secondaryMetric?.name ??
                                "No second metric available"
                            }
                            value={
                                secondaryMetric
                                    ? formatMetricValue(
                                        secondaryMetric.latestValue,
                                        secondaryMetric.unit,
                                    )
                                    : "—"
                            }
                            change={
                                getChangeFromSeries(
                                    secondaryTimeSeries,
                                ).value
                            }
                            data={secondaryTimeSeries}
                            positive={
                                getChangeFromSeries(
                                    secondaryTimeSeries,
                                ).positive
                            }
                            loading={
                                secondaryTimeSeriesLoading ||
                                detailLoading
                            }
                            valueAccessor={(point) =>
                                point.averageValue ??
                                point.value
                            }
                        />
                    </div>

                    {/* Metrics Table */}

                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Available metrics
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {filteredMetrics.length}{" "}
                                    {filteredMetrics.length ===
                                        1
                                        ? "metric"
                                        : "metrics"}{" "}
                                    matched
                                </p>
                            </div>

                            <span className="text-[10px] text-zinc-800">
                                {loading
                                    ? "Updating..."
                                    : "Updated just now"}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <Activity className="h-4 w-4 animate-pulse text-zinc-700" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    Loading metrics
                                </h3>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Fetching metric telemetry...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <Activity className="h-4 w-4 text-red-400" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    Failed to load metrics
                                </h3>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={retry}
                                    className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : filteredMetrics.length >
                            0 ? (
                            <ResponsiveDataTable
                                data={filteredMetrics}
                                columns={metricColumns}
                                rowKey={(metric) =>
                                    metric.name
                                }
                                onRowClick={(metric) => {
                                    window.location.href =
                                        `/dashboard/metrics/${encodeURIComponent(
                                            metric.name,
                                        )}`;
                                }}
                            />
                        ) : (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <Search className="h-4 w-4 text-zinc-700" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    No metrics found
                                </h3>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {metrics.length === 0
                                        ? "No OpenTelemetry metric data has been received yet."
                                        : "Try another metric name, type, or source."}
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Sources */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Metric sources
                            </h2>

                            <p className="mt-1 text-xs text-zinc-700">
                                Where your metrics are being
                                collected from.
                            </p>
                        </div>

                        {sources.length > 0 ? (
                            <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
                                {sources.map(
                                    (item) => (
                                        <SourceCard
                                            key={item.name}
                                            icon={
                                                item.name
                                                    .toLowerCase()
                                                    .includes("postgres")
                                                    ? Database
                                                    : Server
                                            }
                                            name={item.name}
                                            metrics={`${item.metricCount} ${item.metricCount ===
                                                1
                                                ? "metric"
                                                : "metrics"
                                                }`}
                                            dataPoints={`${item.dataPointCount.toLocaleString()} data points`}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="px-5 py-8 text-center">
                                <p className="text-xs text-zinc-700">
                                    No metric sources have been
                                    detected yet.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Bottom status */}

                    <div className="mt-4 flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Metrics are displayed from
                            incoming OpenTelemetry telemetry.
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span>
                                Collection healthy
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ==========================================================================
   Summary Card
   ========================================================================== */

function SummaryCard({
    icon: Icon,
    label,
    value,
    detail,
    positive,
}: {
    icon: typeof BarChart3;
    label: string;
    value: string;
    detail: string;
    positive?: boolean;
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

            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                {positive && (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                )}

                <span
                    className={
                        positive
                            ? "text-emerald-500"
                            : "text-zinc-700"
                    }
                >
                    {detail}
                </span>
            </div>
        </div>
    );
}

/* ==========================================================================
   Metric Chart
   ========================================================================== */

function MetricChart({
    title,
    metric,
    value,
    change,
    data,
    positive,
    loading,
    valueAccessor
}: {
    title: string;
    metric: string;
    value: string;
    change: string;
    data: MetricTimeSeriesPoint[];
    positive?: boolean;
    loading?: boolean;
    valueAccessor?: (
        point: MetricTimeSeriesPoint,
    ) => number;
}) {
    const getPointValue =
        valueAccessor ??
        ((point: MetricTimeSeriesPoint) =>
            point.averageValue ?? point.value);

    const chartPoints = data
        .map((point) => ({
            timestamp: point.timestamp,
            value: getPointValue(point),
        }))
        .filter(
            (point) =>
                Number.isFinite(point.value) &&
                !Number.isNaN(new Date(point.timestamp).getTime()),
        );

    const values = chartPoints.map((point) => point.value);
    const max = values.length > 0 ? Math.max(...values) : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const range = max - min;

    const chartWidth = 1000;
    const chartHeight = 240;
    const horizontalPadding = 12;
    const verticalPadding = 12;
    const plotWidth = chartWidth - horizontalPadding * 2;
    const plotHeight = chartHeight - verticalPadding * 2;

    const points = chartPoints.map((point, index) => {
        const x =
            chartPoints.length <= 1
                ? chartWidth / 2
                : horizontalPadding +
                (index / (chartPoints.length - 1)) *
                plotWidth;

        const normalized =
            range === 0
                ? point.value === 0
                    ? 0.5
                    : 0.85
                : (point.value - min) / range;

        const y =
            chartHeight -
            verticalPadding -
            normalized * plotHeight;

        return {
            x,
            y,
            value: point.value,
            timestamp: point.timestamp,
        };
    });

    const linePath =
        points.length > 0
            ? points
                .map(
                    (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
                )
                .join(" ")
            : "";

    const areaPath =
        points.length > 0
            ? `${linePath} L ${points[points.length - 1]!.x.toFixed(2)} ${chartHeight - verticalPadding} L ${points[0]!.x.toFixed(2)} ${chartHeight - verticalPadding} Z`
            : "";

    const firstTimestamp =
        chartPoints[0]?.timestamp
            ? new Date(chartPoints[0].timestamp)
            : null;

    const lastTimestamp =
        chartPoints[chartPoints.length - 1]?.timestamp
            ? new Date(
                chartPoints[chartPoints.length - 1]!.timestamp,
            )
            : null;

    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex items-start justify-between border-b border-zinc-900 px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-zinc-200">
                        {title}
                    </p>

                    <p className="mt-1 font-mono text-[10px] text-zinc-700">
                        {metric}
                    </p>
                </div>

                <button
                    type="button"
                    aria-label={`More options for ${title}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                            {loading ? "..." : value}
                        </p>

                        <div
                            className={`mt-1 flex items-center gap-1 text-[10px] ${positive
                                ? "text-emerald-500"
                                : "text-red-400"
                                }`}
                        >
                            {positive ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}

                            {change}
                        </div>
                    </div>

                    <span className="text-[9px] uppercase tracking-wider text-zinc-800">
                        Last 24h
                    </span>
                </div>

                <div className="relative mt-6 h-48">
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {[0, 1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="border-t border-zinc-900"
                            />
                        ))}
                    </div>

                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] text-zinc-700">
                                Loading timeseries...
                            </span>
                        </div>
                    ) : points.length > 0 ? (
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                            <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                preserveAspectRatio="none"
                                className="h-full w-full"
                                role="img"
                                aria-label={`Time series chart for ${metric}`}
                            >
                                <defs>
                                    <linearGradient
                                        id="metric-area-gradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopOpacity="0.18"
                                        />
                                        <stop
                                            offset="100%"
                                            stopOpacity="0"
                                        />
                                    </linearGradient>
                                </defs>

                                {areaPath && (
                                    <path
                                        d={areaPath}
                                        fill="url(#metric-area-gradient)"
                                    />
                                )}

                                {linePath && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-zinc-500"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                )}

                                {points.length <= 120 &&
                                    points.map((point, index) => (
                                        <circle
                                            key={`${point.timestamp}-${index}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r={point.value === max && max > 0 ? 5 : 2.5}
                                            className="fill-zinc-300 opacity-0 transition-opacity hover:opacity-100"
                                        >
                                            <title>
                                                {`${point.value} · ${new Date(point.timestamp).toLocaleString()}`}
                                            </title>
                                        </circle>
                                    ))}
                            </svg>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] text-zinc-800">
                                No timeseries data
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-zinc-800">
                    <span>
                        {firstTimestamp &&
                            !Number.isNaN(firstTimestamp.getTime())
                            ? firstTimestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "24h ago"}
                    </span>

                    <span>
                        {lastTimestamp &&
                            !Number.isNaN(lastTimestamp.getTime())
                            ? lastTimestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "Now"}
                    </span>
                </div>
            </div>
        </section>
    );
}

/* ==========================================================================
   Metric Type Badge
   ========================================================================== */

function MetricTypeBadge({
    type,
}: {
    type: MetricType;
}) {
    const styles: Record<
        MetricType,
        string
    > = {
        Counter:
            "border-cyan-500/10 bg-cyan-500/5 text-cyan-500",
        Gauge:
            "border-amber-500/10 bg-amber-500/5 text-amber-500",
        Histogram:
            "border-violet-500/10 bg-violet-500/5 text-violet-400",
        unknown:
            "border-zinc-700 bg-zinc-900 text-zinc-500",
    };

    return (
        <span
            className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium ${styles[type]}`}
        >
            {type}
        </span>
    );
}

/* ==========================================================================
   Source Card
   ========================================================================== */

function SourceCard({
    icon: Icon,
    name,
    metrics,
    dataPoints,
}: {
    icon: typeof Server;
    name: string;
    metrics: string;
    dataPoints: string;
}) {
    return (
        <div className="bg-zinc-950 p-5 transition-colors hover:bg-zinc-900/40">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                        <Icon className="h-3.5 w-3.5 text-zinc-600" />
                    </div>

                    <div>
                        <p className="text-xs font-medium text-zinc-400">
                            {name}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-800">
                            {metrics} · {dataPoints}
                        </p>
                    </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    Healthy
                </span>
            </div>
        </div>
    );
}

/* ==========================================================================
   Metric Filter
   ========================================================================== */

function MetricFilter({
    children,
    active,
    onClick,
}: {
    children: ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`h-10 shrink-0 rounded-lg border px-3 text-xs transition-colors ${active
                ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                }`}
        >
            {children}
        </button>
    );
}