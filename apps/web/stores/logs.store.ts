import { create } from "zustand";
import {
    getLogs,
    getLogSummary,
    getLogSources,
    getLog,
    type Log,
    type LogSummary,
    type LogSource,
    type GetLogsParams,
} from "../lib/api/logs";

type LogStore = {
    logs: Log[];
    summary: LogSummary | null;
    sources: LogSource[];
    selectedLog: Log | null;
    total: number;
    loading: boolean;
    summaryLoading: boolean;
    sourcesLoading: boolean;
    detailLoading: boolean;
    error: string | null;
    filters: GetLogsParams;

    fetchLogs: (
        projectId: string,
        params?: GetLogsParams,
    ) => Promise<void>;

    fetchSummary: (
        projectId: string,
        params?: Pick<
            GetLogsParams,
            "startTime" | "endTime"
        >,
    ) => Promise<void>;

    fetchSources: (
        projectId: string,
        params?: Pick<
            GetLogsParams,
            "startTime" | "endTime"
        >,
    ) => Promise<void>;

    fetchLogDetail: (
        projectId: string,
        logId: string,
    ) => Promise<void>;

    setFilters: (
        filters: Partial<GetLogsParams>,
    ) => void;

    resetFilters: () => void;
    clearLogs: () => void;
    clearSelectedLog: () => void;
};

const defaultFilters: GetLogsParams = {
    limit: 50,
    offset: 0,
};

export const useLogStore =
    create<LogStore>((set, get) => ({
        logs: [],
        summary: null,
        sources: [],
        selectedLog: null,
        total: 0,
        loading: false,
        summaryLoading: false,
        sourcesLoading: false,
        detailLoading: false,
        error: null,
        filters: defaultFilters,

        fetchLogs: async (
            projectId,
            params,
        ) => {
            if (!projectId) {
                set({
                    logs: [],
                    total: 0,
                    loading: false,
                    error: null,
                });
                return;
            }

            const requestParams =
                params ?? get().filters;

            set({
                loading: true,
                error: null,
            });

            try {
                const response =
                    await getLogs(
                        projectId,
                        requestParams,
                    );

                set({
                    logs:
                        response.data.logs,
                    total:
                        response.data.total,
                    loading: false,
                    error: null,
                    filters: {
                        ...get().filters,
                        ...requestParams,
                    },
                });
            } catch (error) {
                console.error(
                    "Failed to fetch logs:",
                    error,
                );

                set({
                    logs: [],
                    total: 0,
                    loading: false,
                    error: "Failed to load logs",
                });
            }
        },

        fetchSummary: async (
            projectId,
            params,
        ) => {
            if (!projectId) {
                set({
                    summary: null,
                    summaryLoading: false,
                });
                return;
            }

            set({
                summaryLoading: true,
                error: null,
            });

            try {
                const response =
                    await getLogSummary(
                        projectId,
                        params,
                    );

                set({
                    summary:
                        response.data.summary,
                    summaryLoading: false,
                    error: null,
                });
            } catch (error) {
                console.error(
                    "Failed to fetch log summary:",
                    error,
                );

                set({
                    summary: null,
                    summaryLoading: false,
                    error: "Failed to load log summary",
                });
            }
        },

        fetchSources: async (
            projectId,
            params,
        ) => {
            if (!projectId) {
                set({
                    sources: [],
                    sourcesLoading: false,
                });
                return;
            }

            set({
                sourcesLoading: true,
                error: null,
            });

            try {
                const response =
                    await getLogSources(
                        projectId,
                        params,
                    );

                set({
                    sources:
                        response.data.sources,
                    sourcesLoading: false,
                    error: null,
                });
            } catch (error) {
                console.error(
                    "Failed to fetch log sources:",
                    error,
                );

                set({
                    sources: [],
                    sourcesLoading: false,
                    error: "Failed to load log sources",
                });
            }
        },

        fetchLogDetail: async (
            projectId,
            logId,
        ) => {
            if (!projectId || !logId) {
                set({
                    selectedLog: null,
                    detailLoading: false,
                });
                return;
            }

            set({
                detailLoading: true,
                error: null,
            });

            try {
                const response =
                    await getLog(
                        projectId,
                        logId,
                    );

                set({
                    selectedLog:
                        response.data.log,
                    detailLoading: false,
                    error: null,
                });
            } catch (error) {
                console.error(
                    "Failed to fetch log detail:",
                    error,
                );

                set({
                    selectedLog: null,
                    detailLoading: false,
                    error: "Failed to load log details",
                });
            }
        },

        setFilters: (filters) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    ...filters,
                },
            }));
        },

        resetFilters: () => {
            set({
                filters: {
                    ...defaultFilters,
                },
            });
        },

        clearLogs: () => {
            set({
                logs: [],
                total: 0,
                loading: false,
                error: null,
            });
        },

        clearSelectedLog: () => {
            set({
                selectedLog: null,
                detailLoading: false,
            });
        },
    }));
