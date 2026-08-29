"use client";

import { Toast, type ToastType } from "./Toast";

export type ToastItem = {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
};

type ToastContainerProps = {
    toasts: ToastItem[];
    onRemove: (id: string) => void;
};

export function ToastContainer({
    toasts,
    onRemove,
}: ToastContainerProps) {
    return (
        <div
            className="
                pointer-events-none
                fixed right-4 top-4
                z-[200]
                flex flex-col gap-3
                sm:right-6 sm:top-6
            "
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
}