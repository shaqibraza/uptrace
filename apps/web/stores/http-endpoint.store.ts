"use client";

import { create } from "zustand";

import {
    createHttpEndpoint,
    deleteHttpEndpoint,
    getHttpEndpoint,
    getHttpEndpoints,
    updateHttpEndpoint,
    getLatestHttpCheckResult,
    getHttpCheckResults,
    type HttpCheckResult,
    type CreateHttpEndpointPayload,
    type HttpEndpoint,
    type UpdateHttpEndpointPayload,
} from "../lib/api/http-endpoint.api";

type HttpEndpointState = {
    endpoints: HttpEndpoint[];
    selectedEndpoint: HttpEndpoint | null;

    isLoading: boolean;
    isFetching: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    error: string | null;

    checkResults: Record<string, HttpCheckResult[]>;
    latestCheckResults: Record<string, HttpCheckResult | null>;
    isLoadingCheckResults: boolean;
    checkResultsError: string | null;

    fetchEndpoints: (
        projectId: string,
    ) => Promise<boolean>;

    fetchEndpoint: (
        endpointId: string,
    ) => Promise<HttpEndpoint | null>;

    createEndpoint: (
        projectId: string,
        payload: CreateHttpEndpointPayload,
    ) => Promise<HttpEndpoint | null>;

    updateEndpoint: (
        endpointId: string,
        payload: UpdateHttpEndpointPayload,
    ) => Promise<HttpEndpoint | null>;

    deleteEndpoint: (
        endpointId: string,
    ) => Promise<boolean>;

    fetchLatestCheckResult(
        endpointId: string,
    ): Promise<HttpCheckResult | null>;

    fetchCheckResults(
        endpointId: string,
    ): Promise<HttpCheckResult[]>;

    fetchAllLatestCheckResults(
        endpointIds: string[],
    ): Promise<void>;

    fetchAllCheckResults(
        endpointIds: string[],
    ): Promise<void>;

    setSelectedEndpoint: (
        endpoint: HttpEndpoint | null,
    ) => void;

    clearError: () => void;

    reset: () => void;
};

const initialState = {
    endpoints: [],
    selectedEndpoint: null,

    isLoading: false,
    isFetching: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    error: null,

    checkResults: {},
    latestCheckResults: {},
    isLoadingCheckResults: false,
    checkResultsError: null,
};

export const useHttpEndpointStore =
    create<HttpEndpointState>((set, get) => ({
        ...initialState,

        fetchEndpoints: async (projectId) => {
            set({
                isLoading: true,
                isFetching: true,
                error: null,
                checkResults: {},
                latestCheckResults: {},
                isLoadingCheckResults: false,
                checkResultsError: null,
            });

            try {
                const response =
                    await getHttpEndpoints(
                        projectId,
                    );

                set({
                    endpoints:
                        response.data.endpoints,
                    isLoading: false,
                    isFetching: false,
                    error: null,
                });

                return true;
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    endpoints: [],
                    isLoading: false,
                    isFetching: false,
                    error: message,
                });

                return false;
            }
        },

        fetchEndpoint: async (endpointId) => {
            set({
                isLoading: true,
                error: null,
            });

            try {
                const response =
                    await getHttpEndpoint(
                        endpointId,
                    );

                const endpoint =
                    response.data.endpoint;

                set({
                    selectedEndpoint: endpoint,
                    isLoading: false,
                    error: null,
                });

                return endpoint;
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    selectedEndpoint: null,
                    isLoading: false,
                    error: message,
                });

                return null;
            }
        },

        createEndpoint: async (
            projectId,
            payload,
        ) => {
            set({
                isCreating: true,
                error: null,
            });

            try {
                const response =
                    await createHttpEndpoint(
                        projectId,
                        payload,
                    );

                const endpoint =
                    response.data.endpoint;

                set((state) => ({
                    endpoints: [
                        endpoint,
                        ...state.endpoints,
                    ],
                    selectedEndpoint: endpoint,
                    isCreating: false,
                    error: null,
                }));

                return endpoint;
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    isCreating: false,
                    error: message,
                });

                return null;
            }
        },

        updateEndpoint: async (
            endpointId,
            payload,
        ) => {
            set({
                isUpdating: true,
                error: null,
            });

            try {
                const response =
                    await updateHttpEndpoint(
                        endpointId,
                        payload,
                    );

                const updatedEndpoint =
                    response.data.endpoint;

                set((state) => ({
                    endpoints:
                        state.endpoints.map(
                            (endpoint) =>
                                endpoint.id ===
                                    endpointId
                                    ? updatedEndpoint
                                    : endpoint,
                        ),
                    selectedEndpoint:
                        state.selectedEndpoint?.id ===
                            endpointId
                            ? updatedEndpoint
                            : state.selectedEndpoint,
                    isUpdating: false,
                    error: null,
                }));

                return updatedEndpoint;
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    isUpdating: false,
                    error: message,
                });

                return null;
            }
        },

        deleteEndpoint: async (
            endpointId,
        ) => {
            set({
                isDeleting: true,
                error: null,
            });

            try {
                await deleteHttpEndpoint(
                    endpointId,
                );

                set((state) => ({
                    endpoints:
                        state.endpoints.filter(
                            (endpoint) =>
                                endpoint.id !==
                                endpointId,
                        ),
                    selectedEndpoint:
                        state.selectedEndpoint?.id ===
                            endpointId
                            ? null
                            : state.selectedEndpoint,
                    isDeleting: false,
                    error: null,
                }));

                return true;
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    isDeleting: false,
                    error: message,
                });

                return false;
            }
        },

        fetchLatestCheckResult: async (endpointId) => {
            set({
                isLoadingCheckResults: true,
                checkResultsError: null,
            });

            try {
                const response =
                    await getLatestHttpCheckResult(endpointId);

                const result = response.data.result;

                set((state) => ({
                    latestCheckResults: {
                        ...state.latestCheckResults,
                        [endpointId]: result,
                    },
                    isLoadingCheckResults: false,
                }));

                return result;
            } catch (error) {
                set({
                    isLoadingCheckResults: false,
                    checkResultsError:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch check result",
                });

                return null;
            }
        },

        fetchCheckResults: async (endpointId) => {
            set({
                isLoadingCheckResults: true,
                checkResultsError: null,
            });

            try {
                const response =
                    await getHttpCheckResults(endpointId);

                const results = response.data.results;

                set((state) => ({
                    checkResults: {
                        ...state.checkResults,
                        [endpointId]: results,
                    },
                    isLoadingCheckResults: false,
                }));

                return results;
            } catch (error) {
                set({
                    isLoadingCheckResults: false,
                    checkResultsError:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch check results",
                });

                return [];
            }
        },

        fetchAllCheckResults: async (
            endpointIds,
        ) => {
            set({
                isLoadingCheckResults: true,
                checkResultsError: null,
            });

            try {
                const results = await Promise.all(
                    endpointIds.map(async (endpointId) => {
                        const response =
                            await getHttpCheckResults(
                                endpointId,
                            );

                        return {
                            endpointId,
                            results:
                                response.data.results,
                        };
                    }),
                );

                const checkResults: Record<
                    string,
                    HttpCheckResult[]
                > = {};

                for (const item of results) {
                    checkResults[item.endpointId] =
                        item.results;
                }

                set({
                    checkResults,
                    isLoadingCheckResults: false,
                });
            } catch (error) {
                set({
                    isLoadingCheckResults: false,
                    checkResultsError:
                        error instanceof Error
                            ? error.message
                            : "Failed to load HTTP check results",
                });
            }
        },

        fetchAllLatestCheckResults: async (endpointIds) => {
            if (!endpointIds.length) {
                return;
            }

            set({
                isLoadingCheckResults: true,
                checkResultsError: null,
            });

            try {
                const results = await Promise.all(
                    endpointIds.map(async (endpointId) => {
                        const response =
                            await getLatestHttpCheckResult(endpointId);

                        return {
                            endpointId,
                            result: response.data.result,
                        };
                    }),
                );

                const latestCheckResults: Record<
                    string,
                    HttpCheckResult | null
                > = {};

                for (const item of results) {
                    latestCheckResults[item.endpointId] = item.result;
                }

                set({
                    latestCheckResults,
                    isLoadingCheckResults: false,
                });
            } catch (error) {
                set({
                    isLoadingCheckResults: false,
                    checkResultsError:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch check results",
                });
            }
        },

        setSelectedEndpoint: (endpoint) => {
            set({
                selectedEndpoint: endpoint,
            });
        },

        clearError: () => {
            set({
                error: null,
            });
        },

        reset: () => {
            set(initialState);
        },
    }));

function getApiErrorMessage(
    error: unknown,
): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: {
                    data?: {
                        error?: {
                            message?: string;
                        };
                    };
                };
            }
        ).response;

        const message =
            response?.data?.error?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}