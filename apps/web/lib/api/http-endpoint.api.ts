import { api } from "./axios";

// Types  
export type HttpEndpointMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEAD"
    | "OPTIONS";

export type HttpEndpoint = {
    id: string;
    projectId: string;
    name: string;
    url: string;
    method: HttpEndpointMethod;
    expectedStatusCode: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateHttpEndpointPayload = {
    name: string;
    url: string;
    method: HttpEndpointMethod;
    expectedStatusCode?: number;
    intervalSeconds?: number;
    timeoutMs?: number;
};

export type UpdateHttpEndpointPayload = {
    name?: string;
    url?: string;
    method?: HttpEndpointMethod;
    expectedStatusCode?: number;
    intervalSeconds?: number;
    timeoutMs?: number;
    isActive?: boolean;
};

// Response Types 
export type CreateHttpEndpointResponse = {
    success: true;
    data: {
        endpoint: HttpEndpoint;
    };
};

export type ListHttpEndpointsResponse = {
    success: true;
    data: {
        endpoints: HttpEndpoint[];
    };
};

export type GetHttpEndpointResponse = {
    success: true;
    data: {
        endpoint: HttpEndpoint;
    };
};

export type UpdateHttpEndpointResponse = {
    success: true;
    data: {
        endpoint: HttpEndpoint;
    };
};

export type DeleteHttpEndpointResponse = {
    success: true;
    data: {
        message: string;
    };
};

//  Create 
export async function createHttpEndpoint(
    projectId: string,
    payload: CreateHttpEndpointPayload,
): Promise<CreateHttpEndpointResponse> {
    const response =
        await api.post<CreateHttpEndpointResponse>(
            `/projects/${projectId}/http-endpoints`,
            payload,
        );

    return response.data;
}

// List 
export async function getHttpEndpoints(
    projectId: string,
): Promise<ListHttpEndpointsResponse> {
    const response =
        await api.get<ListHttpEndpointsResponse>(
            `/projects/${projectId}/http-endpoints`,
        );

    return response.data;
}

// Get By ID
export async function getHttpEndpoint(
    endpointId: string,
): Promise<GetHttpEndpointResponse> {
    const response =
        await api.get<GetHttpEndpointResponse>(
            `/http-endpoints/${endpointId}`,
        );

    return response.data;
}

// Update
export async function updateHttpEndpoint(
    endpointId: string,
    payload: UpdateHttpEndpointPayload,
): Promise<UpdateHttpEndpointResponse> {
    const response =
        await api.patch<UpdateHttpEndpointResponse>(
            `/http-endpoints/${endpointId}`,
            payload,
        );

    return response.data;
}

// Delete 
export async function deleteHttpEndpoint(
    endpointId: string,
): Promise<void> {
    await api.delete(
        `/http-endpoints/${endpointId}`,
    );
}


// HTTP Endpoint Check Results
export type HttpCheckResultStatus = "UP" | "DOWN";

export type HttpCheckResult = {
    id: string;
    endpointId: string;
    status: HttpCheckResultStatus;
    statusCode: number | null;
    responseTimeMs: number | null;
    errorMessage: string | null;
    checkedAt: string;
};

export type GetLatestHttpCheckResultResponse = {
    success: true;
    data: {
        result: HttpCheckResult | null;
    };
};

export type GetHttpCheckResultsResponse = {
    success: true;
    data: {
        results: HttpCheckResult[];
    };
};

export async function getLatestHttpCheckResult(
    endpointId: string,
): Promise<GetLatestHttpCheckResultResponse> {
    const response =
        await api.get<GetLatestHttpCheckResultResponse>(
            `/http-endpoints/${endpointId}/check-results/latest`,
        );

    return response.data;
}

export async function getHttpCheckResults(
    endpointId: string,
): Promise<GetHttpCheckResultsResponse> {
    const response =
        await api.get<GetHttpCheckResultsResponse>(
            `/http-endpoints/${endpointId}/check-results`,
        );

    return response.data;
}