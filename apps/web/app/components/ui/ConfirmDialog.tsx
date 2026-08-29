"use client";

import {
    AlertTriangle,
    Loader2,
    X,
} from "lucide-react";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = true,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close dialog"
                onClick={loading ? undefined : onCancel}
                className="
                    absolute inset-0
                    bg-black/80
                    backdrop-blur-sm
                "
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="
                    relative w-full max-w-md
                    overflow-hidden
                    rounded-xl
                    border border-zinc-800
                    bg-zinc-950
                    shadow-2xl shadow-black/60
                "
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-900 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div
                            className={`
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-lg
                                border
                                ${
                                    destructive
                                        ? "border-red-500/10 bg-red-500/[0.04]"
                                        : "border-zinc-900 bg-black"
                                }
                            `}
                        >
                            <AlertTriangle
                                className={`
                                    h-4 w-4
                                    ${
                                        destructive
                                            ? "text-red-400"
                                            : "text-zinc-600"
                                    }
                                `}
                            />
                        </div>

                        <div className="min-w-0">
                            <h2
                                id="confirm-dialog-title"
                                className="text-sm font-semibold text-zinc-200"
                            >
                                {title}
                            </h2>

                            <p className="mt-1 text-[10px] leading-5 text-zinc-700">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        aria-label="Close dialog"
                        className="
                            flex h-7 w-7 shrink-0
                            items-center justify-center
                            rounded-md
                            text-zinc-700
                            transition-colors
                            hover:bg-zinc-900
                            hover:text-zinc-300
                            disabled:pointer-events-none
                            disabled:opacity-40
                        "
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                    <p className="text-xs leading-6 text-zinc-500">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-zinc-900 bg-black/30 px-5 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
                            h-9 flex-1
                            rounded-lg
                            border border-zinc-900
                            bg-black
                            text-xs
                            text-zinc-500
                            transition-colors
                            hover:border-zinc-800
                            hover:text-zinc-300
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            flex h-9 flex-1
                            items-center justify-center
                            gap-2
                            rounded-lg
                            px-4
                            text-xs
                            font-medium
                            transition-colors
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            ${
                                destructive
                                    ? "bg-red-500 text-white hover:bg-red-400"
                                    : "bg-zinc-100 text-black hover:bg-white"
                            }
                        `}
                    >
                        {loading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}

                        {loading
                            ? "Processing..."
                            : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}