"use client";

import { useCallback, useState } from "react";
import type { ToastItem, } from "./ToastContainer";
import type { ToastType } from "./Toast";

export function useToast() {
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
        }: {
            type: ToastType;
            title: string;
            message?: string;
            duration?: number;
        }) => {
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

    return {
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        removeToast,
    };
}