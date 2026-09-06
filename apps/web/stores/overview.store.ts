import { create } from "zustand";

import {
    getOverview,
    type OverviewData,
    type GetOverviewParams,
} from "../lib/api/overview";

type OverviewStore = {
    data: OverviewData | null;
    summary: OverviewData["summary"] | null;
    services: OverviewData["services"];
    errorSummary: OverviewData["errorSummary"];

    loading: boolean;
    error: string | null;

    fetchOverview: (
        projectId: string,
        params?: GetOverviewParams,
    ) => Promise<void>;

    clearOverview: () => void;
};

export const useOverviewStore =
    create<OverviewStore>((set) => ({
        data: null,
        summary: null,
        services: [],
        errorSummary: [],

        loading: false,
        error: null,

        fetchOverview: async (
            projectId,
            params,
        ) => {
            if (!projectId) {
                set({
                    data: null,
                    summary: null,
                    services: [],
                    errorSummary: [],
                    loading: false,
                    error: null,
                });

                return;
            }

            set({
                loading: true,
                error: null,
            });

            try {
                const response =
                    await getOverview(
                        projectId,
                        params,
                    );

                set({
                    data: response.data,
                    summary:
                        response.data.summary,
                    services:
                        response.data.services,
                    errorSummary:
                        response.data
                            .errorSummary,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error(
                    "Failed to fetch overview:",
                    error,
                );

                set({
                    data: null,
                    summary: null,
                    services: [],
                    errorSummary: [],
                    loading: false,
                    error:
                        "Failed to load overview",
                });
            }
        },

        clearOverview: () => {
            set({
                data: null,
                summary: null,
                services: [],
                errorSummary: [],
                loading: false,
                error: null,
            });
        },
    }));