import { api } from "./axios";

export type ProjectApiKey = {
    id: string;
    projectId: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    revokedAt: string | null;
};

export type CreatedProjectApiKey = ProjectApiKey & {
    key: string;
};

export type GetProjectApiKeysResponse = {
    success: true;
    data: {
        apiKeys: ProjectApiKey[];
    };
};

export type CreateProjectApiKeyResponse = {
    success: true;
    data: {
        apiKey: CreatedProjectApiKey;
    };
};

export type RevokeProjectApiKeyResponse = {
    success: true;
    data: {
        apiKey: ProjectApiKey;
    };
};

export async function getProjectApiKeys(
    projectId: string,
) {
    const response =
        await api.get<GetProjectApiKeysResponse>(
            `/projects/${projectId}/api-keys`,
        );

    return response.data;
}

export async function createProjectApiKey(
    projectId: string,
    name: string,
) {
    const response =
        await api.post<CreateProjectApiKeyResponse>(
            `/projects/${projectId}/api-keys`,
            {
                name,
            },
        );

    return response.data;
}

export async function revokeProjectApiKey(
    projectId: string,
    apiKeyId: string,
) {
    const response =
        await api.delete<RevokeProjectApiKeyResponse>(
            `/projects/${projectId}/api-keys/${apiKeyId}`,
        );

    return response.data;
}