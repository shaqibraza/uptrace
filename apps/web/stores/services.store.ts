import { create } from "zustand";

import {
    listServices as listServicesApi,
    getServiceDetail as getServiceDetailApi,
    type ServiceListItem,
    type ServiceDetail,
} from "../lib/api/services.api";

type ServicesState = {
    services: ServiceListItem[];

    serviceDetail: ServiceDetail | null;

    isLoading: boolean;
    isDetailLoading: boolean;

    error: string | null;
    detailError: string | null;

    fetchServices: (
        projectId: string,
        options?: {
            startTime?: string;
            endTime?: string;
        },
    ) => Promise<boolean>;

    fetchServiceDetail: (
        projectId: string,
        serviceName: string,
        options?: {
            startTime?: string;
            endTime?: string;
        },
    ) => Promise<boolean>;

    clearServices: () => void;
    clearServiceDetail: () => void;
    clearError: () => void;
};

export const useServicesStore =
    create<ServicesState>()(
        (set) => ({
            services: [],

            serviceDetail: null,

            isLoading: false,
            isDetailLoading: false,

            error: null,
            detailError: null,

            fetchServices: async (
                projectId,
                options,
            ) => {
                if (!projectId) {
                    set({
                        services: [],
                        error: null,
                    });

                    return false;
                }

                set({
                    isLoading: true,
                    error: null,
                });

                try {
                    const response =
                        await listServicesApi({
                            projectId,
                            ...options,
                        });

                    const services =
                        response.data.services;

                    set({
                        services,
                        isLoading: false,
                        error: null,
                    });

                    return true;
                } catch (error) {
                    const message =
                        getApiErrorMessage(
                            error,
                        );

                    set({
                        isLoading: false,
                        error: message,
                    });

                    return false;
                }
            },

            fetchServiceDetail:
                async (
                    projectId,
                    serviceName,
                    options,
                ) => {
                    if (
                        !projectId ||
                        !serviceName
                    ) {
                        set({
                            serviceDetail: null,
                            detailError: null,
                        });

                        return false;
                    }

                    set({
                        isDetailLoading: true,
                        detailError: null,
                    });

                    try {
                        const response =
                            await getServiceDetailApi(
                                {
                                    projectId,
                                    serviceName,
                                    ...options,
                                },
                            );

                        const serviceDetail =
                            response.data.service;

                        set({
                            serviceDetail,
                            isDetailLoading:
                                false,
                            detailError: null,
                        });

                        return true;
                    } catch (error) {
                        const message =
                            getApiErrorMessage(
                                error,
                            );

                        set({
                            serviceDetail: null,
                            isDetailLoading:
                                false,
                            detailError:
                                message,
                        });

                        return false;
                    }
                },

            clearServices: () => {
                set({
                    services: [],
                    error: null,
                });
            },

            clearServiceDetail: () => {
                set({
                    serviceDetail: null,
                    detailError: null,
                });
            },

            clearError: () => {
                set({
                    error: null,
                    detailError: null,
                });
            },
        }),
    );

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