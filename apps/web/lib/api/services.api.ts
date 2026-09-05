import { api } from "./axios";

export type ServiceListItem = {
    name: string;

    requestCount: number;

    averageLatencyMs: number;

    p95LatencyMs: number;

    errorCount: number;

    errorRate: number;

    uptime: number;

    trend: "up" | "down" | "flat";

    trendValue: number;

    firstSeenAt: string | null;

    lastSeenAt: string | null;
};

export type ListServicesResponse = {
    success: boolean;

    data: {
        services: ServiceListItem[];
    };
};

export type ListServicesParams = {
    projectId: string;

    startTime?: string;

    endTime?: string;
};

export async function listServices(
    params: ListServicesParams,
): Promise<ListServicesResponse> {
    const {
        projectId,
        startTime,
        endTime,
    } = params;

    const response =
        await api.get<ListServicesResponse>(
            `/projects/${projectId}/services`,
            {
                params: {
                    ...(startTime
                        ? { startTime }
                        : {}),

                    ...(endTime
                        ? { endTime }
                        : {}),
                },
            },
        );

    return response.data;
}

export type ServiceOperation = {
    name: string;

    requestCount: number;

    averageLatencyMs: number;

    p95LatencyMs: number;

    errorCount: number;

    errorRate: number;
};

export type ServiceTimeSeriesPoint = {
    timestamp: string;

    requestCount: number;

    requestRate: number;

    averageLatencyMs: number;

    errorCount: number;

    errorRate: number;
};

export type ServiceTrace = {
    traceId: string;

    operationName: string;

    durationMs: number;

    status: "OK" | "ERROR" | "UNSET";

    startTime: string;
};

export type ServiceDependency = {
    name: string;

    type:
        | "service"
        | "database"
        | "http"
        | "messaging"
        | "unknown";

    requestCount: number;

    averageLatencyMs: number;

    p95LatencyMs: number;

    errorCount: number;

    errorRate: number;

    lastSeenAt: string | null;
};

export type ServiceInstance = {
    id: string;

    hostName: string | null;

    hostId: string | null;

    environment: string | null;

    requestCount: number;

    averageLatencyMs: number;

    p95LatencyMs: number;

    errorCount: number;

    errorRate: number;

    lastSeenAt: string | null;
};

export type ServiceDetail = {
    name: string;

    requestCount: number;

    requestRate: number;

    averageLatencyMs: number;

    p95LatencyMs: number;

    errorCount: number;

    errorRate: number;

    uptime: number;

    trend: "up" | "down" | "flat";

    trendValue: number;

    firstSeenAt: string | null;

    lastSeenAt: string | null;

    operations: ServiceOperation[];

    timeSeries: ServiceTimeSeriesPoint[];

    recentTraces: ServiceTrace[];

    dependencies: ServiceDependency[];

    instances: ServiceInstance[];
};

export type GetServiceDetailResponse = {
    success: boolean;

    data: {
        service: ServiceDetail;
    };
};

export type GetServiceDetailParams = {
    projectId: string;

    serviceName: string;

    startTime?: string;

    endTime?: string;
};

export async function getServiceDetail(
    params: GetServiceDetailParams,
): Promise<GetServiceDetailResponse> {
    const {
        projectId,
        serviceName,
        startTime,
        endTime,
    } = params;

    const response =
        await api.get<GetServiceDetailResponse>(
            `/projects/${projectId}/services/${encodeURIComponent(serviceName)}`,
            {
                params: {
                    ...(startTime
                        ? { startTime }
                        : {}),

                    ...(endTime
                        ? { endTime }
                        : {}),
                },
            },
        );

    return response.data;
}