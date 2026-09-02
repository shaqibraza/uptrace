"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Activity,
    BarChart3,
    ChevronDown,
    Database,
    KeyRound,
    LayoutDashboard,
    Menu,
    PanelLeft,
    Settings,
    Terminal,
    X,
} from "lucide-react";

const monitoringNavigation = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "HTTP Monitoring",
        href: "/dashboard/http-monitoring",
        icon: Activity,
    },
    {
        label: "Traces",
        href: "/dashboard/traces",
        icon: Activity,
    },
    {
        label: "Services",
        href: "/dashboard/services",
        icon: Activity,
    },
    {
        label: "Metrics",
        href: "/dashboard/metrics",
        icon: BarChart3,
    },
    {
        label: "Logs",
        href: "/dashboard/logs",
        icon: Terminal,
    },
];

const dataNavigation = [
    {
        label: "Connections",
        href: "/dashboard/connections",
        icon: Database,
    },
];

const managementNavigation = [
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

export function Sidebar() {
    const pathname = usePathname();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    };

    return (
        <>
            {/* ============================================================ */}
            {/* Mobile Menu Button                                           */}
            {/* ============================================================ */}

            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
                className="
                    fixed left-4 top-3.5 z-[60]
                    flex h-9 w-9 items-center justify-center
                    rounded-lg border border-zinc-900
                    bg-zinc-950 text-zinc-500
                    transition-colors
                    hover:border-zinc-800
                    hover:text-zinc-200
                    lg:hidden
                "
            >
                <Menu className="h-4 w-4" />
            </button>

            {/* ============================================================ */}
            {/* Mobile Backdrop                                               */}
            {/* ============================================================ */}

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setMobileOpen(false)}
                    className="
                        fixed inset-0 z-[70]
                        bg-black/70
                        backdrop-blur-sm
                        lg:hidden
                    "
                />
            )}

            {/* ============================================================ */}
            {/* Sidebar                                                       */}
            {/* ============================================================ */}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-[80]
                    flex flex-col
                    border-r border-zinc-900
                    bg-black
                    transition-all duration-200
                    ${collapsed
                        ? "w-[72px]"
                        : "w-64"
                    }
                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {/* ======================================================== */}
                {/* Header / Logo                                             */}
                {/* ======================================================== */}

                <div
                    className={`
                        flex h-16 shrink-0
                        items-center
                        border-b border-zinc-900
                        ${collapsed
                            ? "justify-center px-3"
                            : "justify-between px-4"
                        }
                    `}
                >
                    <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-black">
                            U
                        </div>

                        {!collapsed && (
                            <div>
                                <p className="text-sm font-semibold tracking-tight text-zinc-200">
                                    Uptrace
                                </p>

                                <p className="text-[9px] text-zinc-700">
                                    Observability
                                </p>
                            </div>
                        )}
                    </Link>

                    {/* Desktop collapse */}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={() =>
                                setCollapsed(true)
                            }
                            aria-label="Collapse sidebar"
                            className="
                                hidden h-7 w-7
                                items-center justify-center
                                rounded-md
                                text-zinc-800
                                transition-colors
                                hover:bg-zinc-900
                                hover:text-zinc-500
                                lg:flex
                            "
                        >
                            <PanelLeft className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {/* Mobile close */}
                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        aria-label="Close sidebar"
                        className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            text-zinc-700
                            hover:bg-zinc-900
                            hover:text-zinc-300
                            lg:hidden
                        "
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ======================================================== */}
                {/* Expand button when collapsed                              */}
                {/* ======================================================== */}

                {collapsed && (
                    <button
                        type="button"
                        onClick={() =>
                            setCollapsed(false)
                        }
                        aria-label="Expand sidebar"
                        className="
                            mx-auto mt-3
                            hidden h-8 w-8
                            items-center justify-center
                            rounded-lg
                            text-zinc-700
                            hover:bg-zinc-900
                            hover:text-zinc-300
                            lg:flex
                        "
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>
                )}

                {/* ======================================================== */}
                {/* Navigation                                                 */}
                {/* ======================================================== */}

                <div className="flex-1 overflow-y-auto px-3 py-5">

                    {/* ---------------------------------------------------- */}
                    {/* Monitoring                                           */}
                    {/* ---------------------------------------------------- */}

                    {!collapsed && (
                        <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-800">
                            Monitoring
                        </p>
                    )}

                    <nav className="space-y-1">
                        {monitoringNavigation.map(
                            (item) => {
                                const active = isActive(
                                    item.href,
                                );

                                const Icon = item.icon;

                                return (
                                    <SidebarLink
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        icon={Icon}
                                        active={active}
                                        collapsed={collapsed}
                                        onClick={() =>
                                            setMobileOpen(
                                                false,
                                            )
                                        }
                                    />
                                );
                            },
                        )}
                    </nav>

                    {/* ---------------------------------------------------- */}
                    {/* Data                                                  */}
                    {/* ---------------------------------------------------- */}

                    {!collapsed && (
                        <p className="mb-2 mt-8 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-800">
                            Data
                        </p>
                    )}

                    <nav className="space-y-1">
                        {dataNavigation.map(
                            (item) => {
                                const active = isActive(
                                    item.href,
                                );

                                const Icon = item.icon;

                                return (
                                    <SidebarLink
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        icon={Icon}
                                        active={active}
                                        collapsed={collapsed}
                                        onClick={() =>
                                            setMobileOpen(
                                                false,
                                            )
                                        }
                                    />
                                );
                            },
                        )}
                    </nav>

                    {/* ---------------------------------------------------- */}
                    {/* Management                                            */}
                    {/* ---------------------------------------------------- */}

                    {!collapsed && (
                        <p className="mb-2 mt-8 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-800">
                            Management
                        </p>
                    )}

                    <nav className="space-y-1">
                        {managementNavigation.map(
                            (item) => {
                                const active = isActive(
                                    item.href,
                                );

                                const Icon = item.icon;

                                return (
                                    <SidebarLink
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        icon={Icon}
                                        active={active}
                                        collapsed={collapsed}
                                        onClick={() =>
                                            setMobileOpen(
                                                false,
                                            )
                                        }
                                    />
                                );
                            },
                        )}
                    </nav>
                </div>

                {/* ======================================================== */}
                {/* Current Project                                           */}
                {/* ======================================================== */}

                <div className="border-t border-zinc-900 p-3">
                    {collapsed ? (
                        <button
                            type="button"
                            title="Current project"
                            className="
                                mx-auto flex h-9 w-9
                                items-center justify-center
                                rounded-lg
                                border border-zinc-900
                                bg-zinc-950
                            "
                        >
                            <Database className="h-3.5 w-3.5 text-zinc-600" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="
                                flex w-full
                                items-center gap-3
                                rounded-lg
                                border border-zinc-900
                                bg-zinc-950
                                p-3
                                text-left
                                transition-colors
                                hover:border-zinc-800
                            "
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                                <Database className="h-3.5 w-3.5 text-zinc-600" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium text-zinc-400">
                                    My Project
                                </p>

                                <p className="mt-0.5 truncate text-[9px] text-zinc-800">
                                    production
                                </p>
                            </div>

                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-800" />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}

/* ========================================================================== */
/* Sidebar Link                                                               */
/* ========================================================================== */

function SidebarLink({
    href,
    label,
    icon: Icon,
    active,
    collapsed,
    onClick,
}: {
    href: string;
    label: string;
    icon: React.ElementType;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={`
                group relative
                flex items-center gap-3
                rounded-lg
                text-xs
                transition-colors
                ${collapsed
                    ? "justify-center px-2 py-2.5"
                    : "px-3 py-2.5"
                }
                ${active
                    ? "bg-zinc-900 text-zinc-200"
                    : "text-zinc-600 hover:bg-zinc-950 hover:text-zinc-300"
                }
            `}
        >
            {/* Active indicator */}
            {active && (
                <span className="absolute left-0 h-4 w-0.5 rounded-full bg-zinc-300" />
            )}

            <Icon
                className={`
                    h-3.5 w-3.5 shrink-0
                    transition-colors
                    ${active
                        ? "text-zinc-300"
                        : "text-zinc-700 group-hover:text-zinc-500"
                    }
                `}
            />

            {!collapsed && (
                <span className="truncate">
                    {label}
                </span>
            )}
        </Link>
    );
}