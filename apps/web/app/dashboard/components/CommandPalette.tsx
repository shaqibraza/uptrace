"use client";

import Link from "next/link";
import {
    Activity,
    BarChart3,
    Database,
    FileText,
    LayoutDashboard,
    Search,
    Settings,
    Terminal,
    X,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

type CommandItem = {
    label: string;
    description: string;
    href: string;
    icon: React.ElementType;
    keywords: string[];
};

const commands: CommandItem[] = [
    {
        label: "Overview",
        description: "Dashboard overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        keywords: ["home", "dashboard", "overview"],
    },
    {
        label: "Traces",
        description: "Inspect distributed traces",
        href: "/dashboard/traces",
        icon: Activity,
        keywords: ["trace", "spans", "requests"],
    },
    {
        label: "Services",
        description: "Monitor application services",
        href: "/dashboard/services",
        icon: Terminal,
        keywords: ["service", "application", "apps"],
    },
    {
        label: "Metrics",
        description: "Explore application metrics",
        href: "/dashboard/metrics",
        icon: BarChart3,
        keywords: ["metrics", "charts", "monitoring"],
    },
    {
        label: "Logs",
        description: "Search application logs",
        href: "/dashboard/logs",
        icon: FileText,
        keywords: ["logs", "errors", "events"],
    },
    {
        label: "Connections",
        description: "Manage data connections",
        href: "/dashboard/connections",
        icon: Database,
        keywords: ["database", "connection", "postgres"],
    },
    {
        label: "Settings",
        description: "Manage project settings",
        href: "/dashboard/settings",
        icon: Settings,
        keywords: ["settings", "configuration", "preferences"],
    },
];

type CommandPaletteProps = {
    open: boolean;
    onClose: () => void;
};

export function CommandPalette({
    open,
    onClose,
}: CommandPaletteProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] =
        useState(0);

    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = useMemo(() => {
        const normalizedQuery =
            query.trim().toLowerCase();

        if (!normalizedQuery) {
            return commands;
        }

        return commands.filter((command) => {
            const searchableText = [
                command.label,
                command.description,
                ...command.keywords,
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedQuery,
            );
        });
    }, [query]);

    const close = useCallback(() => {
        setQuery("");
        setSelectedIndex(0);
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const timeout = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();

                setSelectedIndex((current) =>
                    filteredCommands.length === 0
                        ? 0
                        : (current + 1) %
                          filteredCommands.length,
                );

                return;
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();

                setSelectedIndex((current) =>
                    filteredCommands.length === 0
                        ? 0
                        : current <= 0
                          ? filteredCommands.length - 1
                          : current - 1,
                );

                return;
            }

            if (
                event.key === "Enter" &&
                filteredCommands.length > 0
            ) {
                event.preventDefault();

                const command =
                    filteredCommands[selectedIndex];

                if (command) {
                    window.location.href =
                        command.href;
                }
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        open,
        close,
        filteredCommands,
        selectedIndex,
    ]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[160]">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close command palette"
                onClick={close}
                className="
                    absolute inset-0
                    bg-black/80
                    backdrop-blur-sm
                "
            />

            {/* Palette */}
            <div className="relative mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Command palette"
                    className="
                        overflow-hidden
                        rounded-xl
                        border border-zinc-800
                        bg-zinc-950
                        shadow-2xl
                        shadow-black/70
                    "
                >
                    {/* Search */}
                    <div className="flex h-14 items-center gap-3 border-b border-zinc-900 px-4">
                        <Search className="h-4 w-4 shrink-0 text-zinc-600" />

                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value,
                                )
                            }
                            placeholder="Search anything..."
                            className="
                                min-w-0 flex-1
                                bg-transparent
                                text-sm
                                text-zinc-300
                                outline-none
                                placeholder:text-zinc-700
                            "
                        />

                        <button
                            type="button"
                            onClick={close}
                            className="
                                flex h-6 w-6
                                items-center justify-center
                                rounded-md
                                text-zinc-700
                                hover:bg-zinc-900
                                hover:text-zinc-400
                            "
                            aria-label="Close"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[55vh] overflow-y-auto p-2">
                        {filteredCommands.length > 0 ? (
                            <>
                                <p className="px-3 py-2 text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-800">
                                    Navigation
                                </p>

                                {filteredCommands.map(
                                    (
                                        command,
                                        index,
                                    ) => {
                                        const Icon =
                                            command.icon;

                                        const active =
                                            index ===
                                            selectedIndex;

                                        return (
                                            <Link
                                                key={
                                                    command.href
                                                }
                                                href={
                                                    command.href
                                                }
                                                onClick={
                                                    close
                                                }
                                                onMouseEnter={() =>
                                                    setSelectedIndex(
                                                        index,
                                                    )
                                                }
                                                className={`
                                                    flex items-center
                                                    gap-3 rounded-lg
                                                    px-3 py-2.5
                                                    transition-colors
                                                    ${
                                                        active
                                                            ? "bg-zinc-900"
                                                            : "hover:bg-zinc-900/60"
                                                    }
                                                `}
                                            >
                                                <div
                                                    className={`
                                                        flex h-8 w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        border
                                                        ${
                                                            active
                                                                ? "border-zinc-800 bg-black"
                                                                : "border-zinc-900 bg-black/50"
                                                        }
                                                    `}
                                                >
                                                    <Icon
                                                        className={`
                                                            h-3.5 w-3.5
                                                            ${
                                                                active
                                                                    ? "text-zinc-300"
                                                                    : "text-zinc-700"
                                                            }
                                                        `}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className={`
                                                            text-xs
                                                            ${
                                                                active
                                                                    ? "text-zinc-200"
                                                                    : "text-zinc-500"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            command.label
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[9px] text-zinc-800">
                                                        {
                                                            command.description
                                                        }
                                                    </p>
                                                </div>

                                                {active && (
                                                    <span className="text-[9px] text-zinc-700">
                                                        Enter
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    },
                                )}
                            </>
                        ) : (
                            <div className="flex min-h-32 flex-col items-center justify-center">
                                <Search className="h-5 w-5 text-zinc-800" />

                                <p className="mt-3 text-xs text-zinc-600">
                                    No results found
                                </p>

                                <p className="mt-1 text-[9px] text-zinc-800">
                                    Try a different search term.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-zinc-900 px-4 py-3">
                        <div className="flex items-center gap-3 text-[9px] text-zinc-800">
                            <span>
                                ↑↓ Navigate
                            </span>

                            <span>
                                ↵ Open
                            </span>

                            <span>
                                Esc Close
                            </span>
                        </div>

                        <span className="hidden text-[9px] text-zinc-800 sm:block">
                            Uptrace
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}