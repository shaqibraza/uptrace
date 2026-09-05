import { api } from "./axios";

export type MetricType =
    | "Counter"
    | "Gauge"
    | "Histogram"
    | "unknown";

export type MetricSummary = {
    name: string;
    type: MetricType;
    description: string | null;
    unit: string | null;
    serviceName: string | null;
    environment: string | null;
    latestValue: number;
    dataPointCount: number;
    firstSeenAt: string | null;
    lastSeenAt: string | null;
};

export type MetricDataPoint = {
    timestamp: string;
    value: number;
};

export type MetricTimeSeriesPoint = {
    timestamp: string;
    value: number;
    dataPointCount: number;
    averageValue: number;
    minValue: number;
    maxValue: number;
};

export type MetricSource = {
    name: string;
    metricCount: number;
    dataPointCount: number;
};

export type MetricDetail = {
    name: string;
    type: MetricType;
    description: string | null;
    unit: string | null;
    serviceName: string | null;
    environment: string | null;
    latestValue: number;
    dataPointCount: number;
    firstSeenAt: string | null;
    lastSeenAt: string | null;
    timeSeries: MetricTimeSeriesPoint[];
    dataPoints: MetricDataPoint[];
};

export type MetricsSummary = {
    activeMetrics: number;
    dataPoints: number;
    throughput: number;
    collectionDelayMs: number;
};

export type MetricsOverview = {
    metrics: MetricSummary[];
    summary: MetricsSummary;
    sources: MetricSource[];
};

export type MetricQueryOptions = {
    startTime?: string;
    endTime?: string;
    serviceName?: string;
    environment?: string;
    search?: string;
};

function buildQueryParams(
    options?: MetricQueryOptions,
): string {
    if (!options) {
        return "";
    }

    const params = new URLSearchParams();

    if (options.startTime) {
        params.set("startTime", options.startTime);
    }

    if (options.endTime) {
        params.set("endTime", options.endTime);
    }

    if (options.serviceName) {
        params.set("serviceName", options.serviceName);
    }

    if (options.environment) {
        params.set("environment", options.environment);
    }

    if (options.search) {
        params.set("search", options.search);
    }

    const query = params.toString();

    return query ? `?${query}` : "";
}

function encodeMetricName(metricName: string): string {
    return encodeURIComponent(metricName);
}

export async function listMetrics(
    projectId: string,
    options?: MetricQueryOptions,
): Promise<MetricsOverview> {
    const query = buildQueryParams(options);

    const response = await api.get<{
        success: true;
        data: MetricsOverview;
    }>(
        `/projects/${projectId}/metrics${query}`,
    );

    return response.data.data;
}

export async function getMetricDetail(
    projectId: string,
    metricName: string,
    options?: Omit<MetricQueryOptions, "search">,
): Promise<MetricDetail | null> {
    const query = buildQueryParams(options);

    const response = await api.get<{
        success: true;
        data: MetricDetail | null;
    }>(
        `/projects/${projectId}/metrics/${encodeMetricName(
            metricName,
        )}${query}`,
    );

    return response.data.data;
}

export async function getMetricTimeSeries(
    projectId: string,
    metricName: string,
    options?: Omit<MetricQueryOptions, "search">,
): Promise<MetricTimeSeriesPoint[]> {
    const query = buildQueryParams(options);

    const response = await api.get<{
        success: true;
        data: {
            timeSeries: MetricTimeSeriesPoint[];
        };
    }>(
        `/projects/${projectId}/metrics/${encodeMetricName(
            metricName,
        )}/time-series${query}`,
    );

    return response.data.data.timeSeries;
}

export async function getMetricsSummary(
    projectId: string,
    options?: Omit<MetricQueryOptions, "search">,
): Promise<MetricsSummary> {
    const query = buildQueryParams(options);

    const response = await api.get<{
        success: true;
        data: MetricsSummary;
    }>(
        `/projects/${projectId}/metrics/summary${query}`,
    );

    return response.data.data;
}

export async function getMetricSources(
    projectId: string,
    options?: Omit<MetricQueryOptions, "search">,
): Promise<MetricSource[]> {
    const query = buildQueryParams(options);

    const response = await api.get<{
        success: true;
        data: {
            sources: MetricSource[];
        };
    }>(
        `/projects/${projectId}/metrics/sources${query}`,
    );

    return response.data.data.sources;
}