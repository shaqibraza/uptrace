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
                metrics: response.metrics,
                summary: response.summary,
                sources: response.sources,
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

        set({
            detailLoading: true,
            error: null,
        });

        try {
            const metric = await getMetricDetail(
                projectId,
                metricName,
                options,
            );

            set({
                selectedMetric: metric,
                detailLoading: false,
                error: null,
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
                timeSeries,
                timeSeriesLoading: false,
                error: null,
            });
        } catch {
            set({
                timeSeries: [],
                timeSeriesLoading: false,
                error: "Failed to load metric time series",
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
                secondaryTimeSeries: timeSeries,
                secondaryTimeSeriesLoading: false,
                error: null,
            });
        } catch {
            set({
                secondaryTimeSeries: [],
                secondaryTimeSeriesLoading: false,
                error: "Failed to load secondary metric time series",
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
                summary,
                summaryLoading: false,
                error: null,
            });
        } catch {
            set({
                summary: null,
                summaryLoading: false,
                error: "Failed to load metrics summary",
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
                sources,
                sourcesLoading: false,
                error: null,
            });
        } catch {
            set({
                sources: [],
                sourcesLoading: false,
                error: "Failed to load metric sources",
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