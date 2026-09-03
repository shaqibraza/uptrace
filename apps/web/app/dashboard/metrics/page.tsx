"use client";

import { useMemo, useState } from "react";
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

type MetricType = "Counter" | "Gauge" | "Histogram";

type Metric = {
    name: string;
    description: string;
    type: MetricType;
    value: string;
    unit: string;
    change: string;
    positive: boolean;
    source: string;
};

const metrics: Metric[] = [
    {
        name: "http.server.request.duration",
        description: "HTTP server request duration",
        type: "Histogram",
        value: "384",
        unit: "ms",
        change: "-8.7%",
        positive: true,
        source: "uptrace-api",
    },
    {
        name: "http.server.request.count",
        description: "Total HTTP requests",
        type: "Counter",
        value: "28.6",
        unit: "req/s",
        change: "+12.4%",
        positive: true,
        source: "uptrace-api",
    },
    {
        name: "process.cpu.utilization",
        description: "Process CPU utilization",
        type: "Gauge",
        value: "21.4",
        unit: "%",
        change: "-3.2%",
        positive: true,
        source: "uptrace-api",
    },
    {
        name: "process.memory.usage",
        description: "Process memory usage",
        type: "Gauge",
        value: "384",
        unit: "MB",
        change: "+4.8%",
        positive: false,
        source: "uptrace-api",
    },
    {
        name: "db.client.operation.duration",
        description: "Database operation duration",
        type: "Histogram",
        value: "41",
        unit: "ms",
        change: "-11.2%",
        positive: true,
        source: "postgres",
    },
    {
        name: "db.client.operation.count",
        description: "Database operations",
        type: "Counter",
        value: "1.2",
        unit: "K/s",
        change: "+6.4%",
        positive: true,
        source: "postgres",
    },
    {
        name: "queue.messages.pending",
        description: "Pending queue messages",
        type: "Gauge",
        value: "142",
        unit: "messages",
        change: "-18.1%",
        positive: true,
        source: "worker",
    },
    {
        name: "worker.jobs.processed",
        description: "Successfully processed jobs",
        type: "Counter",
        value: "8.4",
        unit: "jobs/s",
        change: "+9.8%",
        positive: true,
        source: "worker",
    },
];

const chartData = [
    38, 42, 36, 48, 44, 53, 49, 61, 57, 64,
    59, 68, 72, 66, 78, 73, 82, 77, 88, 84,
    91, 86, 96, 91, 102, 98, 108, 103, 112, 107,
    118, 111, 121, 116, 126, 120, 131, 125, 136, 129,
    140, 134, 143, 137, 148, 142, 152, 146, 158, 151,
];

const secondaryData = [
    18, 22, 20, 25, 23, 28, 26, 31, 29, 34,
    32, 37, 35, 39, 42, 38, 44, 41, 47, 43,
    49, 46, 52, 48, 55, 51, 58, 54, 61, 57,
    64, 60, 67, 63, 70, 66, 73, 69, 76, 72,
    79, 75, 82, 78, 85, 81, 88, 84, 91, 87,
];

export default function MetricsPage() {
    const [search, setSearch] = useState("");
    const [type, setType] =
        useState<"All" | MetricType>("All");
    const [source, setSource] =
        useState("All sources");
    const [showFilters, setShowFilters] =
        useState(false);

    const filteredMetrics = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return metrics.filter((metric) => {
            const matchesSearch =
                !query ||
                metric.name
                    .toLowerCase()
                    .includes(query) ||
                metric.description
                    .toLowerCase()
                    .includes(query) ||
                metric.source
                    .toLowerCase()
                    .includes(query);

            const matchesType =
                type === "All" ||
                metric.type === type;

            const matchesSource =
                source === "All sources" ||
                metric.source === source;

            return (
                matchesSearch &&
                matchesType &&
                matchesSource
            );
        });
    }, [search, type, source]);

    const metricSources = useMemo(
        () => [
            "All sources",
            ...Array.from(
                new Set(
                    metrics.map(
                        (metric) => metric.source,
                    ),
                ),
            ),
        ],
        [],
    );

    const metricColumns: ResponsiveColumn<Metric>[] =
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
                            {metric.description}
                        </p>
                    </div>
                ),
            },
            {
                key: "value",
                header: "Value",
                render: (metric) => (
                    <span className="font-mono text-[11px] text-zinc-500">
                        {metric.value}{" "}
                        {metric.unit}
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
                            {metric.source}
                        </span>
                    </div>
                ),
            },
            {
                key: "change",
                header: "Change",
                render: (metric) => (
                    <span
                        className={`inline-flex items-center gap-1 text-[11px] ${
                            metric.positive
                                ? "text-emerald-500"
                                : "text-red-400"
                        }`}
                    >
                        {metric.positive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}

                        {metric.change}
                    </span>
                ),
            },
            {
                key: "action",
                header: "",
                mobileLabel: "Action",
                render: (metric) => (
                    <Link
                        href={`/dashboard/metrics?metric=${encodeURIComponent(
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

    const hasActiveFilters =
        search.trim().length > 0 ||
        type !== "All" ||
        source !== "All sources";

    const resetFilters = () => {
        setSearch("");
        setType("All");
        setSource("All sources");
    };

    return (
        <div>
            <main>
                <div>

                    {/* ================================================== */}
                    {/* Header                                             */}
                    {/* ================================================== */}

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
                                <button
                                    type="button"
                                    className="
                                        flex h-9
                                        items-center gap-2
                                        rounded-lg
                                        border border-zinc-900
                                        bg-zinc-950
                                        px-3
                                        text-xs
                                        text-zinc-500
                                        transition-colors
                                        hover:border-zinc-800
                                        hover:text-zinc-300
                                    "
                                >
                                    <Clock3 className="h-3.5 w-3.5" />

                                    Last 24 hours

                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>

                                <button
                                    type="button"
                                    className="
                                        flex h-9
                                        items-center gap-2
                                        rounded-lg
                                        bg-zinc-100
                                        px-3
                                        text-xs
                                        font-medium
                                        text-black
                                        transition-colors
                                        hover:bg-white
                                    "
                                >
                                    <Plus className="h-3.5 w-3.5" />

                                    Create chart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* Summary                                             */}
                    {/* ================================================== */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            icon={BarChart3}
                            label="Active metrics"
                            value="48"
                            detail="+6 this week"
                        />

                        <SummaryCard
                            icon={Activity}
                            label="Data points"
                            value="1.84M"
                            detail="+12.8%"
                            positive
                        />

                        <SummaryCard
                            icon={Gauge}
                            label="Avg. throughput"
                            value="61.8"
                            detail="points/sec"
                        />

                        <SummaryCard
                            icon={Clock3}
                            label="Collection delay"
                            value="1.2s"
                            detail="-18.4%"
                            positive
                        />
                    </div>

                    {/* ================================================== */}
                    {/* Explorer                                             */}
                    {/* ================================================== */}

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
                                        className="
                                            h-10 w-full
                                            rounded-lg
                                            border border-zinc-900
                                            bg-black
                                            pl-9 pr-9
                                            text-xs text-zinc-300
                                            outline-none
                                            placeholder:text-zinc-800
                                            focus:border-zinc-700
                                        "
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                            className="
                                                absolute right-2
                                                top-1/2
                                                flex h-7 w-7
                                                -translate-y-1/2
                                                items-center
                                                justify-center
                                                rounded-md
                                                text-zinc-700
                                                hover:bg-zinc-900
                                                hover:text-zinc-400
                                            "
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
                                    ).map(
                                        (item) => (
                                            <MetricFilter
                                                key={item}
                                                active={
                                                    type ===
                                                    item
                                                }
                                                onClick={() =>
                                                    setType(
                                                        item,
                                                    )
                                                }
                                            >
                                                {item}
                                            </MetricFilter>
                                        ),
                                    )}
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
                                    className={`
                                        flex h-10 w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        transition-colors
                                        ${
                                            showFilters
                                                ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                                                : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-300"
                                        }
                                    `}
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
                                                        setSource(
                                                            item,
                                                        )
                                                    }
                                                    className={`
                                                        rounded-md
                                                        px-2.5 py-1.5
                                                        text-[10px]
                                                        transition-colors
                                                        ${
                                                            source ===
                                                            item
                                                                ? "bg-zinc-800 text-zinc-300"
                                                                : "text-zinc-700 hover:bg-zinc-900 hover:text-zinc-500"
                                                        }
                                                    `}
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
                                                className="
                                                    rounded-md
                                                    px-2.5 py-1.5
                                                    text-[10px]
                                                    text-zinc-700
                                                    hover:bg-zinc-900
                                                    hover:text-zinc-400
                                                "
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

                    {/* ================================================== */}
                    {/* Charts                                              */}
                    {/* ================================================== */}

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <MetricChart
                            title="HTTP requests"
                            metric="http.server.request.count"
                            value="28.6 req/s"
                            change="+12.4%"
                            data={chartData}
                            positive
                        />

                        <MetricChart
                            title="Request duration"
                            metric="http.server.request.duration"
                            value="384ms"
                            change="-8.7%"
                            data={secondaryData}
                            positive
                        />
                    </div>

                    {/* ================================================== */}
                    {/* Metrics Table                                        */}
                    {/* ================================================== */}

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

                            <Link
                                href="/dashboard/metrics"
                                className="
                                    flex items-center gap-1
                                    text-[11px]
                                    text-zinc-600
                                    transition-colors
                                    hover:text-zinc-300
                                "
                            >
                                Explore all

                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {filteredMetrics.length > 0 ? (
                            <ResponsiveDataTable
                                data={filteredMetrics}
                                columns={metricColumns}
                                rowKey={(metric) =>
                                    metric.name
                                }
                                onRowClick={(metric) => {
                                    window.location.href =
                                        `/dashboard/metrics?metric=${encodeURIComponent(
                                            metric.name,
                                        )}`;
                                }}
                            />
                        ) : (
                            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <Search className="h-4 w-4 text-zinc-700" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    No metrics found
                                </h3>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Try another metric name,
                                    type, or source.
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="
                                            mt-5
                                            rounded-lg
                                            border border-zinc-800
                                            bg-zinc-950
                                            px-3 py-2
                                            text-xs
                                            text-zinc-500
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-300
                                        "
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* ================================================== */}
                    {/* Sources                                              */}
                    {/* ================================================== */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Metric sources
                            </h2>

                            <p className="mt-1 text-xs text-zinc-700">
                                Where your metrics are being collected
                                from.
                            </p>
                        </div>

                        <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
                            <SourceCard
                                icon={Server}
                                name="uptrace-api"
                                metrics="24 metrics"
                                status="Healthy"
                            />

                            <SourceCard
                                icon={Database}
                                name="postgres"
                                metrics="16 metrics"
                                status="Healthy"
                            />

                            <SourceCard
                                icon={Activity}
                                name="worker"
                                metrics="8 metrics"
                                status="Healthy"
                            />
                        </div>
                    </section>

                    {/* Bottom status */}
                    <div className="mt-4 flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Metrics are currently displayed using
                            sample data.
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

/* ========================================================================== */
/* Summary Card                                                               */
/* ========================================================================== */

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

/* ========================================================================== */
/* Metric Chart                                                               */
/* ========================================================================== */

function MetricChart({
    title,
    metric,
    value,
    change,
    data,
    positive,
}: {
    title: string;
    metric: string;
    value: string;
    change: string;
    data: number[];
    positive?: boolean;
}) {
    const max = Math.max(...data);

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
                            {value}
                        </p>

                        <div
                            className={`mt-1 flex items-center gap-1 text-[10px] ${
                                positive
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
                        {[0, 1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="border-t border-zinc-900"
                                />
                            ),
                        )}
                    </div>

                    <div className="absolute inset-0 flex items-end gap-[3px]">
                        {data.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="group flex h-full flex-1 items-end"
                                >
                                    <div
                                        className="
                                            w-full
                                            rounded-t-[2px]
                                            bg-zinc-800
                                            transition-colors
                                            group-hover:bg-zinc-600
                                        "
                                        style={{
                                            height: `${(item / max) * 100}%`,
                                        }}
                                    />
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-zinc-800">
                    <span>24h ago</span>
                    <span>18h</span>
                    <span>12h</span>
                    <span>6h</span>
                    <span>Now</span>
                </div>
            </div>
        </section>
    );
}

/* ========================================================================== */
/* Metric Type Badge                                                          */
/* ========================================================================== */

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
    };

    return (
        <span
            className={`
                rounded-md
                border
                px-1.5 py-0.5
                text-[8px]
                font-medium
                ${styles[type]}
            `}
        >
            {type}
        </span>
    );
}

/* ========================================================================== */
/* Source Card                                                                */
/* ========================================================================== */

function SourceCard({
    icon: Icon,
    name,
    metrics,
    status,
}: {
    icon: typeof Server;
    name: string;
    metrics: string;
    status: string;
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
                            {metrics}
                        </p>
                    </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    {status}
                </span>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Metric Filter                                                              */
/* ========================================================================== */

function MetricFilter({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                h-10
                shrink-0
                rounded-lg
                border
                px-3
                text-xs
                transition-colors
                ${
                    active
                        ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                        : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                }
            `}
        >
            {children}
        </button>
    );
}
