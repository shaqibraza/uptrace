"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
    Activity,
    BarChart3,
    ChevronRight,
    Database,
    FileText,
    KeyRound,
    LayoutDashboard,
    Settings,
    Terminal,
    X,
} from "lucide-react";

type MobileSidebarProps = {
    open: boolean;
    onClose: () => void;
};

const navigation = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Traces",
        href: "/dashboard/traces",
        icon: Activity,
    },
    {
        label: "Services",
        href: "/dashboard/services",
        icon: Terminal,
    },
    {
        label: "Metrics",
        href: "/dashboard/metrics",
        icon: BarChart3,
    },
    {
        label: "Logs",
        href: "/dashboard/logs",
        icon: FileText,
    },
];

const dataNavigation = [
    {
        label: "Connections",
        href: "/dashboard/connections",
        icon: Database,
    },
];

const manageNavigation = [
    {
        label: "API Keys",
        href: "/dashboard/api-keys",
        icon: KeyRound,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function MobileSidebar({
    open,
    onClose,
}: MobileSidebarProps) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
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
        <div className="fixed inset-0 z-[120] lg:hidden">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close sidebar"
                onClick={onClose}
                className="
                    absolute inset-0
                    bg-black/70
                    backdrop-blur-sm
                "
            />

            {/* Drawer */}
            <aside
                className="
                    absolute left-0 top-0
                    flex h-full
                    w-[280px]
                    flex-col
                    border-r border-zinc-900
                    bg-black
                    shadow-2xl shadow-black/60
                "
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-zinc-900 px-4">
                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-black">
                            U
                        </div>

                        <span className="text-sm font-semibold tracking-tight text-zinc-200">
                            Uptrace
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                        className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            text-zinc-700
                            transition-colors
                            hover:bg-zinc-900
                            hover:text-zinc-300
                        "
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Project */}
                <div className="border-b border-zinc-900 p-3">
                    <button
                        type="button"
                        className="
                            flex w-full
                            items-center gap-3
                            rounded-lg
                            border border-zinc-900
                            bg-zinc-950
                            px-3 py-2.5
                            text-left
                        "
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-[9px] font-semibold text-zinc-400">
                            M
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-medium text-zinc-400">
                                My Project
                            </p>

                            <p className="mt-0.5 text-[8px] text-zinc-800">
                                production
                            </p>
                        </div>

                        <ChevronRight className="h-3 w-3 text-zinc-800" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <NavGroup
                        items={navigation}
                        onClose={onClose}
                    />

                    <div className="my-5 h-px bg-zinc-900" />

                    <NavLabel label="Data" />

                    <div className="mt-2">
                        <NavGroup
                            items={dataNavigation}
                            onClose={onClose}
                        />
                    </div>

                    <div className="my-5 h-px bg-zinc-900" />

                    <NavLabel label="Manage" />

                    <div className="mt-2">
                        <NavGroup
                            items={manageNavigation}
                            onClose={onClose}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-900 p-3">
                    <div className="rounded-lg bg-zinc-950 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span className="text-[9px] text-zinc-600">
                                All systems operational
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

/* ========================================================================== */
/* Navigation Group                                                           */
/* ========================================================================== */

function NavGroup({
    items,
    onClose,
}: {
    items: {
        label: string;
        href: string;
        icon: React.ElementType;
    }[];
    onClose: () => void;
}) {
    return (
        <nav className="space-y-1">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="
                            group flex
                            items-center gap-3
                            rounded-lg
                            px-3 py-2.5
                            text-xs
                            text-zinc-600
                            transition-colors
                            hover:bg-zinc-900
                            hover:text-zinc-300
                        "
                    >
                        <Icon
                            className="
                                h-4 w-4
                                text-zinc-700
                                transition-colors
                                group-hover:text-zinc-500
                            "
                        />

                        <span className="flex-1">
                            {item.label}
                        </span>

                        <ChevronRight
                            className="
                                h-3 w-3
                                text-zinc-900
                                transition-colors
                                group-hover:text-zinc-700
                            "
                        />
                    </Link>
                );
            })}
        </nav>
    );
}

/* ========================================================================== */
/* Nav Label                                                                  */
/* ========================================================================== */

function NavLabel({
    label,
}: {
    label: string;
}) {
    return (
        <p className="px-3 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-800">
            {label}
        </p>
    );
}