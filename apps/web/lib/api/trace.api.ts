import { api } from "./axios";

export type TraceStatus =
    | "OK"
    | "ERROR"
    | "UNSET";

export type Trace = {
    id: string;
    projectId: string;
    traceId: string;
    serviceName: string;
    environment: string | null;
    operationName: string | null;
    spanCount: number | string;
    startTime: string;
    endTime: string | null;
    durationMs: number | null;
    status: TraceStatus;
    createdAt: string;
};

export type Span = {
    id: string;
    projectId: string;
    traceId: string;
    spanId: string;
    parentSpanId: string | null;
    traceRecordId: string | null;
    serviceName: string;
    name: string;
    kind: string;
    startTime: string;
    endTime: string | null;
    durationMs: number | null;
    status: string;
    statusMessage: string | null;
    attributes: unknown;
    resourceAttributes: unknown;
    events: unknown;
    createdAt: string;
};

export type GetTracesResponse = {
    success: true;
    data: {
        traces: Trace[];
    };
};

export type GetTraceResponse = {
    success: true;
    data: {
        trace: Trace;
        spans: Span[];
    };
};

export async function getTraces(projectId: string) {
    const response = await api.get<GetTracesResponse>(
        `/projects/${projectId}/traces`,
    );

    return response.data;
}

export async function getTrace(
    projectId: string,
    traceId: string,
) {
    const response = await api.get<GetTraceResponse>(
        `/projects/${projectId}/traces/${traceId}`,
    );

    return response.data;
}