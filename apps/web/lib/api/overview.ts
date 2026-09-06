import { api } from "./axios";

export type OverviewSummary = {
    requestRate: number;
    p95Latency: number;
    errorRate: number;
    activeServices: number;
};

export type OverviewServiceHealth = {
    name: string;
    requestCount: number;
    averageLatencyMs: number;
    errorCount: number;
    errorRate: number;
    status: "Healthy" | "Degraded";
};

export type OverviewErrorSummary = {
    endpoint: string;
    count: number;
    percentage: number;
};

export type OverviewData = {
    summary: OverviewSummary;
    services: OverviewServiceHealth[];
    errorSummary: OverviewErrorSummary[];
};

export type GetOverviewParams = {
    startTime?: string;
    endTime?: string;
};

export type GetOverviewResponse = {
    success: true;
    data: OverviewData;
};

export async function getOverview(
    projectId: string,
    params?: GetOverviewParams,
) {
    const response =
        await api.get<GetOverviewResponse>(
            `/projects/${projectId}/overview`,
            {
                params,
            },
        );

    return response.data;
}