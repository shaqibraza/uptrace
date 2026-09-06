import { api } from "./axios";

export type Log = {
    id: string;
    timestamp: string;
    observedTimestamp: string | null;
    severityNumber: number | null;
    severityText: string | null;
    body: string | null;
    traceId: string | null;
    spanId: string | null;
    serviceName: string | null;
    environment: string | null;
    attributes: Record<string, unknown> | null;
    resourceAttributes: Record<string, unknown> | null;
    scopeName: string | null;
    scopeVersion: string | null;
};

export type LogSummary = {
    totalLogs: number;
    errorLogs: number;
    warnLogs: number;
    infoLogs: number;
    debugLogs: number;
};

export type LogSource = {
    name: string;
    logCount: number;
};

export type GetLogsParams = {
    startTime?: string;
    endTime?: string;
    serviceName?: string;
    environment?: string;
    severity?: string;
    search?: string;
    traceId?: string;
    spanId?: string;
    limit?: number;
    offset?: number;
};

export type GetLogsResponse = {
    success: true;
    data: {
        logs: Log[];
        total: number;
    };
};

type GetLogSummaryApiResponse = {
    success: true;
    data: LogSummary;
};

export type GetLogSummaryResponse = {
    success: true;
    data: {
        summary: LogSummary;
    };
};

type GetLogSourcesApiResponse = {
    success: true;
    data: LogSource[];
};

export type GetLogSourcesResponse = {
    success: true;
    data: {
        sources: LogSource[];
    };
};

export type GetLogResponse = {
    success: true;
    data: {
        log: Log;
    };
};

export async function getLogs(
    projectId: string,
    params?: GetLogsParams,
) {
    const response = await api.get<GetLogsResponse>(
        `/projects/${projectId}/logs`,
        { params },
    );

    return response.data;
}

export async function getLogSummary(
    projectId: string,
    params?: Pick<
        GetLogsParams,
        "startTime" | "endTime"
    >,
): Promise<GetLogSummaryResponse> {
    const response =
        await api.get<GetLogSummaryApiResponse>(
            `/projects/${projectId}/logs/summary`,
            { params },
        );

    return {
        success: true,
        data: {
            summary: response.data.data,
        },
    };
}

export async function getLogSources(
    projectId: string,
    params?: Pick<
        GetLogsParams,
        "startTime" | "endTime"
    >,
): Promise<GetLogSourcesResponse> {
    const response =
        await api.get<GetLogSourcesApiResponse>(
            `/projects/${projectId}/logs/sources`,
            { params },
        );

    const rawSources = response.data.data;

    const sources = Array.isArray(rawSources)
        ? rawSources
        : Array.isArray(
              (rawSources as { sources?: unknown })
                  ?.sources,
          )
          ? (rawSources as {
                sources: LogSource[];
            }).sources
          : [];

    return {
        success: true,
        data: {
            sources,
        },
    };
}

export async function getLog(
    projectId: string,
    logId: string,
) {
    const response =
        await api.get<GetLogResponse>(
            `/projects/${projectId}/logs/${logId}`,
        );

    return response.data;
}
