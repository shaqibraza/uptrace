import { create } from "zustand";

import {
    listMetrics,
    getMetricDetail,
    getMetricTimeSeries,
    getMetricsSummary,
    getMetricSources,
    type MetricSummary,
    type MetricDetail,
    type MetricTimeSeriesPoint,
    type MetricSource,
    type MetricsSummary,
    type MetricQueryOptions,
} from "../lib/api/metrics.api";

type MetricsStore = {
    metrics: MetricSummary[];

    selectedMetric: MetricDetail | null;

    /**
     * Primary metric timeseries.
     */
    timeSeries: MetricTimeSeriesPoint[];

    /**
     * Secondary metric timeseries.
     *
     * This is intentionally kept separate from `timeSeries`
     * so multiple charts can display different metrics without
     * overwriting each other's data.
     */
    secondaryTimeSeries: MetricTimeSeriesPoint[];

    summary: MetricsSummary | null;

    sources: MetricSource[];

    loading: boolean;
    detailLoading: boolean;
    timeSeriesLoading: boolean;
    secondaryTimeSeriesLoading: boolean;
    summaryLoading: boolean;
    sourcesLoading: boolean;

    error: string | null;

    fetchMetrics: (
        projectId: string,
        options?: MetricQueryOptions,
    ) => Promise<void>;

    fetchMetricDetail: (
        projectId: string,
        metricName: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => Promise<void>;

    fetchMetricTimeSeries: (
        projectId: string,
        metricName: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => Promise<void>;

    fetchSecondaryMetricTimeSeries: (
        projectId: string,
        metricName: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => Promise<void>;

    fetchMetricsSummary: (
        projectId: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => Promise<void>;

    fetchMetricSources: (
        projectId: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => Promise<void>;

    clearMetrics: () => void;
};

/**
 * Normalize a metric detail response before putting it into Zustand.
 *
 * The backend normally returns all of these fields, but keeping the
 * normalization here prevents the UI from crashing if an optional
 * field is missing or if an older backend response is encountered.
 */
function normalizeMetricDetail(
    metric: MetricDetail | null,
): MetricDetail | null {
    if (!metric) {
        return null;
    }

    const dataPoints = Array.isArray(metric.dataPoints)
        ? metric.dataPoints
              .filter(
                  (point) =>
                      point &&
                      typeof point.timestamp === "string",
              )
              .map((point) => ({
                  timestamp: point.timestamp,
                  value:
                      typeof point.value === "number" &&
                      Number.isFinite(point.value)
                          ? point.value
                          : 0,
              }))
        : [];

    const timeSeries = Array.isArray(metric.timeSeries)
        ? metric.timeSeries
              .filter(
                  (point) =>
                      point &&
                      typeof point.timestamp === "string",
              )
              .map((point) => ({
                  timestamp: point.timestamp,
                  value:
                      typeof point.value === "number" &&
                      Number.isFinite(point.value)
                          ? point.value
                          : 0,
                  dataPointCount:
                      typeof point.dataPointCount === "number" &&
                      Number.isFinite(point.dataPointCount)
                          ? point.dataPointCount
                          : 0,
                  averageValue:
                      typeof point.averageValue === "number" &&
                      Number.isFinite(point.averageValue)
                          ? point.averageValue
                          : 0,
                  minValue:
                      typeof point.minValue === "number" &&
                      Number.isFinite(point.minValue)
                          ? point.minValue
                          : 0,
                  maxValue:
                      typeof point.maxValue === "number" &&
                      Number.isFinite(point.maxValue)
                          ? point.maxValue
                          : 0,
              }))
        : [];

    const lastDataPoint =
        dataPoints.length > 0
            ? dataPoints[dataPoints.length - 1]
            : null;

    const lastSeriesPoint =
        timeSeries.length > 0
            ? timeSeries[timeSeries.length - 1]
            : null;

    const latestValue =
        typeof metric.latestValue === "number" &&
        Number.isFinite(metric.latestValue)
            ? metric.latestValue
            : lastDataPoint?.value ??
              lastSeriesPoint?.value ??
              lastSeriesPoint?.averageValue ??
              0;

    const dataPointCount =
        typeof metric.dataPointCount === "number" &&
        Number.isFinite(metric.dataPointCount)
            ? metric.dataPointCount
            : dataPoints.length;

    return {
        name:
            typeof metric.name === "string"
                ? metric.name
                : "",

        type:
            metric.type === "Counter" ||
            metric.type === "Gauge" ||
            metric.type === "Histogram"
                ? metric.type
                : "unknown",

        description:
            typeof metric.description === "string"
                ? metric.description
                : null,

        unit:
            typeof metric.unit === "string"
                ? metric.unit
                : null,

        serviceName:
            typeof metric.serviceName === "string"
                ? metric.serviceName
                : null,

        environment:
            typeof metric.environment === "string"
                ? metric.environment
                : null,

        latestValue,

        dataPointCount,

        firstSeenAt:
            typeof metric.firstSeenAt === "string"
                ? metric.firstSeenAt
                : null,

        lastSeenAt:
            typeof metric.lastSeenAt === "string"
                ? metric.lastSeenAt
                : null,

        timeSeries,

        dataPoints,
    };
}

export const useMetricsStore = create<MetricsStore>((set) => ({
    metrics: [],

    selectedMetric: null,

    timeSeries: [],

    secondaryTimeSeries: [],

    summary: null,

    sources: [],

    loading: false,

    detailLoading: false,

    timeSeriesLoading: false,

    secondaryTimeSeriesLoading: false,

    summaryLoading: false,

    sourcesLoading: false,

    error: null,

    fetchMetrics: async (
        projectId: string,
        options?: MetricQueryOptions,
    ) => {
        if (!projectId) {
            set({
                metrics: [],
                loading: false,
                error: null,
            });

            return;
        }

        set({
            loading: true,
            error: null,
        });

        try {
            const response = await listMetrics(
                projectId,
                options,
            );

            set({
                metrics: Array.isArray(response.metrics)
                    ? response.metrics
                    : [],

                summary: response.summary ?? null,

                sources: Array.isArray(response.sources)
                    ? response.sources
                    : [],

                loading: false,

                error: null,
            });
        } catch {
            set({
                metrics: [],

                loading: false,

                error: "Failed to load metrics",
            });
        }
    },

    fetchMetricDetail: async (
        projectId: string,
        metricName: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => {
        if (!projectId || !metricName) {
            set({
                selectedMetric: null,
                detailLoading: false,
            });

            return;
        }

        /**
         * Clear the previous metric immediately.
         *
         * This prevents a previous metric from being displayed while
         * the new metric detail request is loading.
         */
        set({
            selectedMetric: null,
            detailLoading: true,
            error: null,
        });

        try {
            const metric = await getMetricDetail(
                projectId,
                metricName,
                options,
            );

            const normalizedMetric =
                normalizeMetricDetail(metric);

            set({
                selectedMetric: normalizedMetric,

                detailLoading: false,

                error: normalizedMetric
                    ? null
                    : "Metric not found",
            });
        } catch {
            set({
                selectedMetric: null,

                detailLoading: false,

                error: "Failed to load metric detail",
            });
        }
    },

    fetchMetricTimeSeries: async (
        projectId: string,
        metricName: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => {
        if (!projectId || !metricName) {
            set({
                timeSeries: [],
                timeSeriesLoading: false,
            });

            return;
        }

        set({
            timeSeriesLoading: true,
            error: null,
        });

        try {
            const timeSeries =
                await getMetricTimeSeries(
                    projectId,
                    metricName,
                    options,
                );

            set({
                timeSeries: Array.isArray(timeSeries)
                    ? timeSeries
                    : [],

                timeSeriesLoading: false,

                error: null,
            });
        } catch {
            set({
                timeSeries: [],

                timeSeriesLoading: false,

                error:
                    "Failed to load metric time series",
            });
        }
    },

    fetchSecondaryMetricTimeSeries: async (
        projectId: string,
        metricName: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => {
        if (!projectId || !metricName) {
            set({
                secondaryTimeSeries: [],

                secondaryTimeSeriesLoading: false,
            });

            return;
        }

        set({
            secondaryTimeSeriesLoading: true,

            error: null,
        });

        try {
            const timeSeries =
                await getMetricTimeSeries(
                    projectId,
                    metricName,
                    options,
                );

            set({
                secondaryTimeSeries:
                    Array.isArray(timeSeries)
                        ? timeSeries
                        : [],

                secondaryTimeSeriesLoading: false,

                error: null,
            });
        } catch {
            set({
                secondaryTimeSeries: [],

                secondaryTimeSeriesLoading: false,

                error:
                    "Failed to load secondary metric time series",
            });
        }
    },

    fetchMetricsSummary: async (
        projectId: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => {
        if (!projectId) {
            set({
                summary: null,

                summaryLoading: false,
            });

            return;
        }

        set({
            summaryLoading: true,

            error: null,
        });

        try {
            const summary =
                await getMetricsSummary(
                    projectId,
                    options,
                );

            set({
                summary: summary ?? null,

                summaryLoading: false,

                error: null,
            });
        } catch {
            set({
                summary: null,

                summaryLoading: false,

                error:
                    "Failed to load metrics summary",
            });
        }
    },

    fetchMetricSources: async (
        projectId: string,
        options?: Omit<MetricQueryOptions, "search">,
    ) => {
        if (!projectId) {
            set({
                sources: [],

                sourcesLoading: false,
            });

            return;
        }

        set({
            sourcesLoading: true,

            error: null,
        });

        try {
            const sources =
                await getMetricSources(
                    projectId,
                    options,
                );

            set({
                sources: Array.isArray(sources)
                    ? sources
                    : [],

                sourcesLoading: false,

                error: null,
            });
        } catch {
            set({
                sources: [],

                sourcesLoading: false,

                error:
                    "Failed to load metric sources",
            });
        }
    },

    clearMetrics: () => {
        set({
            metrics: [],

            selectedMetric: null,

            timeSeries: [],

            secondaryTimeSeries: [],

            summary: null,

            sources: [],

            loading: false,

            detailLoading: false,

            timeSeriesLoading: false,

            secondaryTimeSeriesLoading: false,

            summaryLoading: false,

            sourcesLoading: false,

            error: null,
        });
    },
}));