"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import {
    ToastContainer,
    type ToastItem,
} from "../components/ui/ToastContainer";

import type { ToastType } from "../components/ui/Toast";

type ShowToastInput = {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
};

type ToastContextValue = {
    toasts: ToastItem[];
    showToast: (input: ShowToastInput) => string;
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    removeToast: (id: string) => void;
};

const ToastContext =
    createContext<ToastContextValue | null>(null);

export function ToastProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((current) =>
            current.filter((toast) => toast.id !== id),
        );
    }, []);

    const showToast = useCallback(
        ({
            type,
            title,
            message,
            duration = 3500,
        }: ShowToastInput) => {
            const id = crypto.randomUUID();

            setToasts((current) => [
                ...current,
                {
                    id,
                    type,
                    title,
                    message,
                },
            ]);

            if (duration > 0) {
                window.setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast],
    );

    const success = useCallback(
        (title: string, message?: string) =>
            showToast({
                type: "success",
                title,
                message,
            }),
        [showToast],
    );

    const error = useCallback(
        (title: string, message?: string) =>
            showToast({
                type: "error",
                title,
                message,
            }),
        [showToast],
    );

    const warning = useCallback(
        (title: string, message?: string) =>
            showToast({
                type: "warning",
                title,
                message,
            }),
        [showToast],
    );

    const info = useCallback(
        (title: string, message?: string) =>
            showToast({
                type: "info",
                title,
                message,
            }),
        [showToast],
    );

    const value = useMemo(
        () => ({
            toasts,
            showToast,
            success,
            error,
            warning,
            info,
            removeToast,
        }),
        [
            toasts,
            showToast,
            success,
            error,
            warning,
            info,
            removeToast,
        ],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <ToastContainer
                toasts={toasts}
                onRemove={removeToast}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error(
            "useToast must be used inside ToastProvider",
        );
    }

    return context;
}