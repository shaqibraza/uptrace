"use client";

import {
    Activity,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    BarChart3,
    Clock3,
    Database,
    Gauge,
    MoreHorizontal,
    Server,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuthStore } from "../../../../stores/auth.store";
import { useMetricsStore } from "../../../../stores/metrics.store";
import { useProjectStore } from "../../../../stores/project.store";
import type {
    MetricDetail,
    MetricTimeSeriesPoint,
} from "../../../../lib/api/metrics.api";

type TimeRange = "1h" | "6h" | "24h" | "7d";
type ChartMode = "value" | "average" | "min" | "max";

const TIME_RANGES: Record<
    TimeRange,
    {
        label: string;
        durationMs: number;
    }
> = {
    "1h": {
        label: "Last hour",
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

function formatValue(value: number, unit = "") {
    if (!Number.isFinite(value)) {
        return "—";
    }

    let formatted: string;

    if (Math.abs(value) >= 1_000_000) {
        formatted = `${(value / 1_000_000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1_000) {
        formatted = `${(value / 1_000).toFixed(2)}K`;
    } else if (Number.isInteger(value)) {
        formatted = value.toLocaleString();
    } else {
        formatted = value.toFixed(2);
    }

    return `${formatted}${unit ? ` ${unit}` : ""}`;
}

function formatTimestamp(value: string | null, compact = false) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    if (compact) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getRangeOptions(timeRange: TimeRange) {
    const endTime = new Date();
    const startTime = new Date(
        endTime.getTime() - TIME_RANGES[timeRange].durationMs,
    );

    return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
    };
}

function getPointValue(
    point: MetricTimeSeriesPoint,
    mode: ChartMode,
) {
    if (mode === "min") {
        return point.minValue;
    }

    if (mode === "max") {
        return point.maxValue;
    }

    if (mode === "average") {
        return point.averageValue;
    }

    return point.value;
}

function calculateStats(
    values: number[],
    fallback: {
        averageValue: number;
        minValue: number;
        maxValue: number;
    },
) {
    const finiteValues = values.filter(Number.isFinite);

    if (!finiteValues.length) {
        return fallback;
    }

    const sum = finiteValues.reduce(
        (total, value) => total + value,
        0,
    );

    return {
        averageValue: sum / finiteValues.length,
        minValue: Math.min(...finiteValues),
        maxValue: Math.max(...finiteValues),
    };
}

function MetricChart({
    data,
    mode,
    unit,
}: {
    data: MetricTimeSeriesPoint[];
    mode: ChartMode;
    unit: string;
}) {
    const chart = useMemo(() => {
        const width = 1000;
        const height = 300;
        const paddingX = 22;
        const paddingY = 28;

        const values = data.map((point) =>
            getPointValue(point, mode),
        );

        const finiteValues = values.filter(Number.isFinite);

        if (!finiteValues.length) {
            return null;
        }

        const min = Math.min(...finiteValues);
        const max = Math.max(...finiteValues);
        const spread = Math.max(max - min, 1);

        const points = values.map((value, index) => {
            const x =
                paddingX +
                (index / Math.max(values.length - 1, 1)) *
                (width - paddingX * 2);

            const y =
                height -
                paddingY -
                ((value - min) / spread) *
                (height - paddingY * 2);

            return { x, y, value };
        });

        const line = points
            .map(
                (point, index) =>
                    `${index === 0 ? "M" : "L"} ${point.x.toFixed(
                        2,
                    )} ${point.y.toFixed(2)}`,
            )
            .join(" ");

        const area = `${line} L ${(width - paddingX).toFixed(
            2,
        )} ${height - paddingY} L ${paddingX} ${height - paddingY
            } Z`;

        return {
            width,
            height,
            points,
            line,
            area,
            min,
            max,
        };
    }, [data, mode]);

    if (!chart) {
        return (
            <div className="flex h-[300px] items-center justify-center text-sm text-zinc-600">
                No timeseries data in this range
            </div>
        );
    }

    const labels = [
        chart.max,
        chart.min + (chart.max - chart.min) * 0.66,
        chart.min + (chart.max - chart.min) * 0.33,
        chart.min,
    ];

    return (
        <div className="relative">
            <div className="absolute left-0 top-0 flex h-[300px] w-14 flex-col justify-between py-5 text-right text-[10px] text-zinc-600">
                {labels.map((label, index) => (
                    <span key={index}>
                        {formatValue(label, unit)}
                    </span>
                ))}
            </div>

            <div className="ml-16 overflow-hidden">
                <svg
                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                    className="h-[300px] w-full"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient
                            id="metric-area"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopOpacity="0.22"
                            />
                            <stop
                                offset="100%"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    {[0, 1, 2, 3].map((line) => {
                        const y = 28 + (line / 3) * 244;

                        return (
                            <line
                                key={line}
                                x1="22"
                                x2="978"
                                y1={y}
                                y2={y}
                                stroke="currentColor"
                                className="text-zinc-900"
                                strokeWidth="1"
                            />
                        );
                    })}

                    <path
                        d={chart.area}
                        fill="url(#metric-area)"
                        className="text-zinc-400"
                    />

                    <path
                        d={chart.line}
                        fill="none"
                        stroke="currentColor"
                        className="text-zinc-300"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {chart.points.map((point, index) => {
                        if (
                            index !==
                            chart.points.length - 1
                        ) {
                            return null;
                        }

                        return (
                            <circle
                                key={index}
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                className="fill-zinc-100"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>

                <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                    <span>
                        {formatTimestamp(
                            data[0]?.timestamp ?? null,
                            true,
                        )}
                    </span>
                    <span>
                        {formatTimestamp(
                            data[
                                Math.floor(data.length / 2)
                            ]?.timestamp ?? null,
                            true,
                        )}
                    </span>
                    <span>
                        {formatTimestamp(
                            data[data.length - 1]?.timestamp ??
                            null,
                            true,
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    helper,
    icon,
    trend,
}: {
    label: string;
    value: string;
    helper: string;
    icon: React.ReactNode;
    trend?: "up" | "down";
}) {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                    {label}
                </span>
                <div className="text-zinc-600">{icon}</div>
            </div>

            <div className="mt-3 flex items-end gap-2">
                <span className="text-2xl font-semibold tracking-tight text-zinc-100">
                    {value}
                </span>

                {trend === "up" ? (
                    <ArrowUp className="mb-1 h-4 w-4 text-zinc-400" />
                ) : null}

                {trend === "down" ? (
                    <ArrowDown className="mb-1 h-4 w-4 text-zinc-400" />
                ) : null}
            </div>

            <p className="mt-1 text-[11px] text-zinc-600">
                {helper}
            </p>
        </div>
    );
}

function MetadataRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-6 border-b border-zinc-900 py-3 last:border-0">
            <span className="text-xs text-zinc-600">
                {label}
            </span>
            <span className="max-w-[65%] break-all text-right text-xs text-zinc-300">
                {value || "—"}
            </span>
        </div>
    );
}

function LoadingState({
    projectId,
    metric,
    error,
    metricName,
}: {
    projectId: string | undefined;
    metric: MetricDetail | null;
    error: string | null;
    metricName: string;
}) {
    if (!projectId) {
        return (
            <main className="min-h-full bg-black px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1400px]">
                    <Link
                        href="/dashboard/metrics"
                        className="inline-flex items-center gap-2 text-xs text-zinc-600 transition hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to metrics
                    </Link>

                    <div className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950 p-8 text-center">
                        <h1 className="text-lg font-semibold text-zinc-200">
                            No project selected
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Select a project before opening a metric.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (!metric) {
        return (
            <main className="min-h-full bg-black px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1400px]">
                    <Link
                        href="/dashboard/metrics"
                        className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-600 transition hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to metrics
                    </Link>

                    <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-8 text-center">
                        <h1 className="text-lg font-semibold text-zinc-200">
                            Metric not found
                        </h1>
                        <p className="mt-2 break-all text-sm text-zinc-600">
                            {error ??
                                `No data was returned for "${metricName}".`}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-full bg-black px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1400px]">
                <div className="mb-6 h-4 w-28 animate-pulse rounded bg-zinc-900" />
                <div className="mb-6 h-10 w-80 animate-pulse rounded bg-zinc-900" />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-28 animate-pulse rounded-xl border border-zinc-900 bg-zinc-950"
                            />
                        ),
                    )}
                </div>

                <div className="mt-4 h-[390px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-950" />
            </div>
        </main>
    );
}

export default function MetricDetailPage() {
    const params = useParams<{
        metricName: string;
    }>();

    const rawMetricName = params.metricName ?? "";
    const metricName = useMemo(() => {
        try {
            return decodeURIComponent(rawMetricName);
        } catch {
            return rawMetricName;
        }
    }, [rawMetricName]);

    const authStatus = useAuthStore(
        (state) => state.status,
    );

    const selectedProject = useProjectStore(
        (state) => state.selectedProject,
    );

    const {
        selectedMetric,
        detailLoading,
        error,
        fetchMetricDetail,
    } = useMetricsStore();

    const [timeRange, setTimeRange] =
        useState<TimeRange>("24h");

    const [chartMode, setChartMode] =
        useState<ChartMode>("average");

    const projectId = selectedProject?.id;

    useEffect(() => {
        if (
            authStatus !== "authenticated" ||
            !projectId ||
            !metricName
        ) {
            return;
        }

        const options = getRangeOptions(timeRange);

        void fetchMetricDetail(
            projectId,
            metricName,
            options,
        );
    }, [
        authStatus,
        projectId,
        metricName,
        timeRange,
        fetchMetricDetail,
    ]);

    const metric = selectedMetric;

    const series = useMemo(
        () => metric?.timeSeries ?? [],
        [metric],
    );

    const recentPoints = useMemo(
        () =>
            [...(metric?.dataPoints ?? [])]
                .sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime(),
                )
                .slice(0, 10),
        [metric],
    );

    const stats = useMemo(
        () =>
            metric
                ? calculateStats(
                    (metric.dataPoints ?? []).map(
                        (point) => point.value,
                    ),
                    {
                        averageValue:
                            series.length > 0
                                ? series.reduce(
                                    (sum, point) =>
                                        sum +
                                        point.averageValue,
                                    0,
                                ) /
                                series.length
                                : metric.latestValue,
                        minValue:
                            series.length > 0
                                ? Math.min(
                                    ...series.map(
                                        (point) =>
                                            point.minValue,
                                    ),
                                )
                                : metric.latestValue,
                        maxValue:
                            series.length > 0
                                ? Math.max(
                                    ...series.map(
                                        (point) =>
                                            point.maxValue,
                                    ),
                                )
                                : metric.latestValue,
                    },
                )
                : {
                    averageValue: 0,
                    minValue: 0,
                    maxValue: 0,
                },
        [metric, series],
    );

    const change = useMemo(() => {
        if (series.length < 2) {
            return 0;
        }

        const first =
            series[0]?.averageValue ?? 0;
        const last =
            series[series.length - 1]?.averageValue ??
            0;

        if (first === 0) {
            return 0;
        }

        return (
            ((last - first) / Math.abs(first)) * 100
        );
    }, [series]);

    const chartValue = useMemo(() => {
        if (!metric) {
            return "—";
        }

        const point =
            series[series.length - 1];

        if (!point) {
            return formatValue(
                metric.latestValue,
                metric.unit ?? "",
            );
        }

        return formatValue(
            getPointValue(point, chartMode),
            metric.unit ?? "",
        );
    }, [
        chartMode,
        metric,
        series,
    ]);

    if (detailLoading) {
        return (
            <LoadingState
                projectId={projectId}
                metric={metric}
                error={error}
                metricName={metricName}
            />
        );
    }

    if (!projectId) {
        return (
            <LoadingState
                projectId={projectId}
                metric={metric}
                error={error}
                metricName={metricName}
            />
        );
    }

    if (!metric) {
        return (
            <LoadingState
                projectId={projectId}
                metric={metric}
                error={error}
                metricName={metricName}
            />
        );
    }

    return (
        <main className="min-h-full bg-black px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1400px]">
                <div className="mb-6">
                    <Link
                        href="/dashboard/metrics"
                        className="mb-4 inline-flex items-center gap-2 text-xs text-zinc-600 transition hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to metrics
                    </Link>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-medium text-zinc-400">
                                    <Gauge className="h-3 w-3" />
                                    {metric.type}
                                </span>

                                {metric.serviceName ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-900 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-500">
                                        <Server className="h-3 w-3" />
                                        {metric.serviceName}
                                    </span>
                                ) : null}

                                {metric.environment ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-900 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-500">
                                        <Activity className="h-3 w-3" />
                                        {metric.environment}
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="break-all text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                                {metric.name}
                            </h1>

                            {metric.description ? (
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                                    {metric.description}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(event) =>
                                        setTimeRange(
                                            event.target
                                                .value as TimeRange,
                                        )
                                    }
                                    className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 pr-8 text-xs text-zinc-300 outline-none focus:border-zinc-700"
                                >
                                    {Object.entries(
                                        TIME_RANGES,
                                    ).map(
                                        ([
                                            value,
                                            option,
                                        ]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {
                                                    option.label
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>

                                <Clock3 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                            </div>

                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-200"
                                aria-label="More metric actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        label="Latest value"
                        value={formatValue(
                            metric.latestValue,
                            metric.unit ?? "",
                        )}
                        helper="Most recent datapoint in range"
                        icon={
                            <Activity className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Average"
                        value={formatValue(
                            stats.averageValue,
                            metric.unit ?? "",
                        )}
                        helper="Calculated from returned datapoints"
                        icon={
                            <BarChart3 className="h-4 w-4" />
                        }
                    />

                    <StatCard
                        label="Minimum"
                        value={formatValue(
                            stats.minValue,
                            metric.unit ?? "",
                        )}
                        helper="Lowest returned datapoint"
                        icon={
                            <TrendingDown className="h-4 w-4" />
                        }
                        trend="down"
                    />

                    <StatCard
                        label="Maximum"
                        value={formatValue(
                            stats.maxValue,
                            metric.unit ?? "",
                        )}
                        helper="Highest returned datapoint"
                        icon={
                            <TrendingUp className="h-4 w-4" />
                        }
                        trend="up"
                    />

                    <StatCard
                        label="Data points"
                        value={(metric.dataPointCount ?? metric.dataPoints?.length ?? 0).toLocaleString()}
                        helper="Observed in selected range"
                        icon={
                            <Database className="h-4 w-4" />
                        }
                    />
                </div>

                <section className="mt-4 rounded-xl border border-zinc-900 bg-zinc-950">
                    <div className="flex flex-col gap-4 border-b border-zinc-900 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Metric timeseries
                            </h2>
                            <p className="mt-1 text-xs text-zinc-600">
                                {TIME_RANGES[timeRange].label} ·{" "}
                                {chartValue}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-900 bg-black p-1">
                            {(
                                [
                                    [
                                        "average",
                                        "Average",
                                    ],
                                    ["value", "Value"],
                                    ["min", "Min"],
                                    ["max", "Max"],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        setChartMode(
                                            value,
                                        )
                                    }
                                    className={`rounded-md px-3 py-1.5 text-[10px] transition ${chartMode ===
                                            value
                                            ? "bg-zinc-900 text-zinc-200"
                                            : "text-zinc-600 hover:text-zinc-300"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="px-5 py-5">
                        <MetricChart
                            data={series}
                            mode={chartMode}
                            unit={metric.unit ?? ""}
                        />

                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-900 pt-4 text-[10px] text-zinc-600">
                            <span className="flex items-center gap-2">
                                <span className="h-1.5 w-5 rounded-full bg-zinc-300" />
                                {chartMode ===
                                    "average"
                                    ? "Average"
                                    : chartMode ===
                                        "min"
                                        ? "Minimum"
                                        : chartMode ===
                                            "max"
                                            ? "Maximum"
                                            : "Value"}
                            </span>

                            <span>
                                Latest change{" "}
                                <span
                                    className={
                                        change >= 0
                                            ? "text-zinc-300"
                                            : "text-zinc-500"
                                    }
                                >
                                    {change >= 0
                                        ? "+"
                                        : ""}
                                    {change.toFixed(1)}%
                                </span>
                            </span>
                        </div>
                    </div>
                </section>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
                    <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Recent data points
                                </h2>
                                <p className="mt-1 text-xs text-zinc-600">
                                    Latest observed values returned by the API
                                </p>
                            </div>

                            <span className="text-[10px] text-zinc-700">
                                {recentPoints.length} shown
                            </span>
                        </div>

                        {recentPoints.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[520px] text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-900 text-[10px] uppercase tracking-wider text-zinc-700">
                                            <th className="px-5 py-3 font-medium">
                                                Timestamp
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Value
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentPoints.map(
                                            (point, index) => (
                                                <tr
                                                    key={`${point.timestamp}-${point.value}-${index}`}
                                                    className="border-b border-zinc-900/70 last:border-0"
                                                >
                                                    <td className="whitespace-nowrap px-5 py-3 text-xs text-zinc-500">
                                                        {formatTimestamp(
                                                            point.timestamp,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3 text-xs font-medium text-zinc-200">
                                                        {formatValue(
                                                            point.value,
                                                            metric.unit ??
                                                            "",
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-5 py-10 text-center text-sm text-zinc-600">
                                No datapoints were returned for this time range.
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Metric information
                            </h2>
                            <p className="mt-1 text-xs text-zinc-600">
                                Metadata returned by the metric API
                            </p>
                        </div>

                        <div className="px-5">
                            <MetadataRow
                                label="Name"
                                value={metric.name}
                            />

                            <MetadataRow
                                label="Type"
                                value={metric.type}
                            />

                            <MetadataRow
                                label="Unit"
                                value={metric.unit ?? ""}
                            />

                            <MetadataRow
                                label="Service"
                                value={
                                    metric.serviceName ??
                                    ""
                                }
                            />

                            <MetadataRow
                                label="Environment"
                                value={
                                    metric.environment ??
                                    ""
                                }
                            />

                            <MetadataRow
                                label="First seen"
                                value={formatTimestamp(
                                    metric.firstSeenAt,
                                )}
                            />

                            <MetadataRow
                                label="Last seen"
                                value={formatTimestamp(
                                    metric.lastSeenAt,
                                )}
                            />
                        </div>
                    </section>
                </div>

                <div className="mt-4 rounded-lg border border-dashed border-zinc-900 bg-zinc-950/50 px-4 py-3 text-[11px] text-zinc-700">
                    Live metric data is loaded from the selected project and
                    the <span className="text-zinc-500">{metric.name}</span>{" "}
                    metric API. The selected time range controls the backend
                    query.
                </div>
            </div>
        </main>
    );
}
