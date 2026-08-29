"use client";

import {
    type ReactNode,
    useEffect,
} from "react";
import { X } from "lucide-react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[140]">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="
                    absolute inset-0
                    bg-black/80
                    backdrop-blur-sm
                "
            />

            {/* Center */}
            <div className="relative flex min-h-full items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={`
                        relative flex w-full
                        ${sizes[size]}
                        max-h-[calc(100vh-2rem)]
                        flex-col
                        overflow-hidden
                        rounded-xl
                        border border-zinc-800
                        bg-zinc-950
                        shadow-2xl shadow-black/60
                    `}
                >
                    {/* Header */}
                    <div className="flex shrink-0 items-start justify-between border-b border-zinc-900 px-5 py-4">
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                {title}
                            </h2>

                            {description && (
                                <p className="mt-1 text-[10px] leading-5 text-zinc-700">
                                    {description}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="
                                ml-4 flex h-7 w-7
                                shrink-0
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
                    </div>

                    {/* Content */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-5">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="shrink-0 border-t border-zinc-900 bg-black/30 px-5 py-4">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}