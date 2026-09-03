import { create } from "zustand";
import {
    getTraces,
    type Trace,
} from "../lib/api/trace.api";

type TraceStore = {
    traces: Trace[];
    loading: boolean;
    error: string | null;

    fetchTraces: (projectId: string) => Promise<void>;
    clearTraces: () => void;
};

export const useTraceStore = create<TraceStore>((set) => ({
    traces: [],
    loading: false,
    error: null,

    fetchTraces: async (projectId: string) => {
        if (!projectId) {
            set({
                traces: [],
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
            const response = await getTraces(projectId);

            set({
                traces: response.data.traces,
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error(
                "Failed to fetch traces:",
                error,
            );

            set({
                traces: [],
                loading: false,
                error: "Failed to load traces",
            });
        }
    },

    clearTraces: () => {
        set({
            traces: [],
            loading: false,
            error: null,
        });
    },
}));