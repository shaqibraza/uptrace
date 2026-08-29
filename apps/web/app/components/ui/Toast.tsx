"use client";

import {
    AlertCircle,
    CheckCircle2,
    Info,
    X,
} from "lucide-react";

export type ToastType =
    | "success"
    | "error"
    | "warning"
    | "info";

type ToastProps = {
    type?: ToastType;
    title: string;
    message?: string;
    onClose?: () => void;
};

const styles = {
    success: {
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
    },
    error: {
        icon: AlertCircle,
        iconClass: "text-red-400",
    },
    warning: {
        icon: AlertCircle,
        iconClass: "text-amber-500",
    },
    info: {
        icon: Info,
        iconClass: "text-zinc-400",
    },
};

export function Toast({
    type = "info",
    title,
    message,
    onClose,
}: ToastProps) {
    const { icon: Icon, iconClass } = styles[type];

    return (
        <div
            role="alert"
            className="
                pointer-events-auto
                flex w-[calc(100vw-2rem)]
                max-w-sm items-start gap-3
                rounded-xl
                border border-zinc-800
                bg-zinc-950
                p-4
                shadow-2xl shadow-black/40
            "
        >
            <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`}
            />

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-200">
                    {title}
                </p>

                {message && (
                    <p className="mt-1 text-[10px] leading-5 text-zinc-600">
                        {message}
                    </p>
                )}
            </div>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close notification"
                    className="
                        flex h-5 w-5 shrink-0
                        items-center justify-center
                        rounded-md
                        text-zinc-700
                        transition-colors
                        hover:bg-zinc-900
                        hover:text-zinc-300
                    "
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}