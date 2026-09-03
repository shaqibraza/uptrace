import { create } from "zustand";

import {
    createProjectApiKey,
    getProjectApiKeys,
    revokeProjectApiKey,
    type CreatedProjectApiKey,
    type ProjectApiKey,
} from "../lib/api/api-key.api";

type ApiKeyStore = {
    apiKeys: ProjectApiKey[];
    createdApiKey: CreatedProjectApiKey | null;

    isLoading: boolean;
    isCreating: boolean;
    isRevoking: boolean;

    error: string | null;

    fetchApiKeys: (
        projectId: string,
    ) => Promise<ProjectApiKey[]>;

    createApiKey: (
        projectId: string,
        name: string,
    ) => Promise<CreatedProjectApiKey>;

    revokeApiKey: (
        projectId: string,
        apiKeyId: string,
    ) => Promise<ProjectApiKey>;

    clearCreatedApiKey: () => void;
    clearError: () => void;
};

export const useApiKeyStore =
    create<ApiKeyStore>((set) => ({
        apiKeys: [],
        createdApiKey: null,

        isLoading: false,
        isCreating: false,
        isRevoking: false,

        error: null,

        fetchApiKeys: async (
            projectId: string,
        ) => {
            set({
                isLoading: true,
                error: null,
            });

            try {
                const response =
                    await getProjectApiKeys(
                        projectId,
                    );

                const apiKeys =
                    response.data.apiKeys;

                set({
                    apiKeys,
                    isLoading: false,
                });

                return apiKeys;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch API keys";

                set({
                    isLoading: false,
                    error: message,
                });

                throw error;
            }
        },

        createApiKey: async (
            projectId: string,
            name: string,
        ) => {
            set({
                isCreating: true,
                error: null,
                createdApiKey: null,
            });

            try {
                const response =
                    await createProjectApiKey(
                        projectId,
                        name,
                    );

                const apiKey =
                    response.data.apiKey;

                set((state) => ({
                    apiKeys: [
                        apiKey,
                        ...state.apiKeys,
                    ],
                    createdApiKey: apiKey,
                    isCreating: false,
                }));

                return apiKey;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to create API key";

                set({
                    isCreating: false,
                    error: message,
                });

                throw error;
            }
        },

        revokeApiKey: async (
            projectId: string,
            apiKeyId: string,
        ) => {
            set({
                isRevoking: true,
                error: null,
            });

            try {
                const response =
                    await revokeProjectApiKey(
                        projectId,
                        apiKeyId,
                    );

                const revokedApiKey =
                    response.data.apiKey;

                set((state) => ({
                    apiKeys:
                        state.apiKeys.map(
                            (apiKey) =>
                                apiKey.id ===
                                revokedApiKey.id
                                    ? revokedApiKey
                                    : apiKey,
                        ),
                    isRevoking: false,
                }));

                return revokedApiKey;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to revoke API key";

                set({
                    isRevoking: false,
                    error: message,
                });

                throw error;
            }
        },

        clearCreatedApiKey: () => {
            set({
                createdApiKey: null,
            });
        },

        clearError: () => {
            set({
                error: null,
            });
        },
    }));