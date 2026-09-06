"use client";

import Link from "next/link";
import {
    AlertCircle,
    ArrowRight,
    ChevronDown,
    Clock3,
    Copy,
    Download,
    Info,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Terminal,
    TriangleAlert,
    X,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../components/ResponsiveDataTable";

import { useProjectStore } from "../../../stores/project.store";
import { useLogStore } from "../../../stores/logs.store";
import type { Log as ApiLog } from "../../../lib/api/logs";

type LogLevel =
    | "INFO"
    | "WARN"
    | "ERROR"
    | "DEBUG"
    | "UNKNOWN";

type Log = ApiLog & {
    level: LogLevel;
    service: string;
    message: string;
    time: string;
    traceId: string;
};

const PAGE_SIZE = 50;

const levels: Array<"All" | LogLevel> = [
    "All",
    "INFO",
    "WARN",
    "ERROR",
    "DEBUG",
];

export default function LogsPage() {
    const selectedProject = useProjectStore(
        (state) => state.selectedProject,
    );

    const logs = useLogStore(
        (state) => state.logs,
    );

    const summary = useLogStore(
        (state) => state.summary,
    );

    const sources = useLogStore(
        (state) => state.sources,
    );

    const selectedLog = useLogStore(
        (state) => state.selectedLog,
    );

    const total = useLogStore(
        (state) => state.total,
    );

    const loading = useLogStore(
        (state) => state.loading,
    );

    const summaryLoading = useLogStore(
        (state) => state.summaryLoading,
    );

    const sourcesLoading = useLogStore(
        (state) => state.sourcesLoading,
    );

    const detailLoading = useLogStore(
        (state) => state.detailLoading,
    );

    const error = useLogStore(
        (state) => state.error,
    );

    const filters = useLogStore(
        (state) => state.filters,
    );

    const fetchLogs = useLogStore(
        (state) => state.fetchLogs,
    );

    const fetchSummary = useLogStore(
        (state) => state.fetchSummary,
    );

    const fetchSources = useLogStore(
        (state) => state.fetchSources,
    );

    const fetchLogDetail = useLogStore(
        (state) => state.fetchLogDetail,
    );

    const setFilters = useLogStore(
        (state) => state.setFilters,
    );

    const resetStoreFilters = useLogStore(
        (state) => state.resetFilters,
    );

    const clearSelectedLog = useLogStore(
        (state) => state.clearSelectedLog,
    );

    const [search, setSearch] = useState("");

    const [level, setLevel] =
        useState<"All" | LogLevel>("All");

    const [service, setService] =
        useState("All services");

    const [showFilters, setShowFilters] =
        useState(false);

    const [page, setPage] = useState(1);

    type TimeRange = "15m" | "1h" | "6h" | "24h" | "7d";

    const [timeRange, setTimeRange] =
        useState<TimeRange>("24h");

    const [showTimeRange, setShowTimeRange] =
        useState(false);

    /*
     * --------------------------------------------------------------------------
     * Initial data
     * --------------------------------------------------------------------------
     */

    useEffect(() => {
        const projectId =
            selectedProject?.id;

        if (!projectId) {
            return;
        }

        const range = getTimeRangeBounds(timeRange);

        setFilters({
            startTime: range.startTime,
            endTime: range.endTime,
            offset: 0,
            limit: PAGE_SIZE,
        });

        void fetchLogs(projectId, {
            startTime: range.startTime,
            endTime: range.endTime,
            offset: 0,
            limit: PAGE_SIZE,
        });

        void fetchSummary(projectId, {
            startTime: range.startTime,
            endTime: range.endTime,
        });

        void fetchSources(projectId, {
            startTime: range.startTime,
            endTime: range.endTime,
        });
    }, [
        selectedProject?.id,
        timeRange,
        fetchLogs,
        fetchSummary,
        fetchSources,
        setFilters,
    ]);

    /*
     * --------------------------------------------------------------------------
     * Backend filtering
     * --------------------------------------------------------------------------
     *
     * Search, level and service are sent to the API.
     * No demo/local filtering is performed.
     */

    useEffect(() => {
        const projectId =
            selectedProject?.id;

        if (!projectId) {
            return;
        }

        const timeout = window.setTimeout(() => {
            const range = getTimeRangeBounds(timeRange);

            const nextFilters = {
                startTime: range.startTime,
                endTime: range.endTime,
                search:
                    search.trim() || undefined,

                severity:
                    level === "All"
                        ? undefined
                        : level,

                serviceName:
                    service === "All services"
                        ? undefined
                        : service,

                offset: 0,
                limit: PAGE_SIZE,
            };

            setFilters(nextFilters);

            void fetchLogs(projectId, nextFilters);
        }, 300);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [
        search,
        level,
        service,
        timeRange,
        selectedProject?.id,
        setFilters,
        fetchLogs,
    ]);

    /*
     * --------------------------------------------------------------------------
     * Pagination
     * --------------------------------------------------------------------------
     */

    const totalPages = Math.max(
        1,
        Math.ceil(total / PAGE_SIZE),
    );

    const currentPage = Math.min(
        page,
        totalPages,
    );

    useEffect(() => {
        if (!selectedProject?.id) {
            return;
        }

        const offset =
            (currentPage - 1) * PAGE_SIZE;

        if (filters.offset === offset) {
            return;
        }

        const nextFilters = {
            ...filters,
            offset,
            limit: PAGE_SIZE,
        };

        setFilters(nextFilters);

        void fetchLogs(
            selectedProject.id,
            nextFilters,
        );
    }, [
        currentPage,
        selectedProject?.id,
        filters.offset,
        setFilters,
        fetchLogs,
    ]);

    /*
     * --------------------------------------------------------------------------
     * Service options
     * --------------------------------------------------------------------------
     */

    const services = useMemo(() => {
        const names = sources
            .map((source) => source.name)
            .filter(Boolean);

        return [
            "All services",
            ...Array.from(
                new Set(names),
            ),
        ];
    }, [sources]);

    /*
     * --------------------------------------------------------------------------
     * UI data normalization
     * --------------------------------------------------------------------------
     */

    const uiLogs = useMemo<Log[]>(() => {
        return logs.map((log) => {
            const normalizedLevel =
                normalizeLevel(
                    log.severityText,
                    log.severityNumber,
                );

            return {
                ...log,
                level: normalizedLevel,
                service:
                    log.serviceName ??
                    "Unknown service",
                message:
                    log.body ??
                    "(empty log body)",
                time: formatDateTime(
                    log.timestamp,
                ),
                traceId:
                    log.traceId ??
                    "—",
            };
        });
    }, [logs]);

    /*
     * --------------------------------------------------------------------------
     * Pagination labels
     * --------------------------------------------------------------------------
     */

    const firstItem =
        total === 0
            ? 0
            : (currentPage - 1) *
                    PAGE_SIZE +
                1;

    const lastItem = Math.min(
        currentPage * PAGE_SIZE,
        total,
    );

    /*
     * --------------------------------------------------------------------------
     * Filters
     * --------------------------------------------------------------------------
     */

    const hasFilters =
        search.trim().length > 0 ||
        level !== "All" ||
        service !== "All services";

    const resetFilters = () => {
        setSearch("");
        setLevel("All");
        setService("All services");
        setPage(1);

        resetStoreFilters();

        if (selectedProject?.id) {
            void fetchLogs(
                selectedProject.id,
            );
        }
    };

    const changeLevel = (
        nextLevel: "All" | LogLevel,
    ) => {
        setLevel(nextLevel);
        setPage(1);
    };

    const changeService = (
        nextService: string,
    ) => {
        setService(nextService);
        setPage(1);
    };

    const selectTimeRange = (
        nextRange: TimeRange,
    ) => {
        setTimeRange(nextRange);
        setShowTimeRange(false);
        setPage(1);
    };

    const exportLogs = () => {
        if (logs.length === 0) {
            return;
        }

        const headers = [
            "timestamp",
            "severity",
            "service",
            "environment",
            "message",
            "traceId",
            "spanId",
        ];

        const rows = logs.map((log) => [
            log.timestamp,
            normalizeLevel(
                log.severityText,
                log.severityNumber,
            ),
            log.serviceName ?? "",
            log.environment ?? "",
            log.body ?? "",
            log.traceId ?? "",
            log.spanId ?? "",
        ]);

        const csv = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map(csvEscape)
                    .join(","),
            )
            .join("\r\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;",
            },
        );

        const url =
            URL.createObjectURL(blob);

        const anchor =
            document.createElement("a");

        anchor.href = url;
        anchor.download = `uptrace-logs-${timeRange}-${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.csv`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    };

    /*
     * --------------------------------------------------------------------------
     * Refresh
     * --------------------------------------------------------------------------
     */

    const refresh = () => {
        if (!selectedProject?.id) {
            return;
        }

        const range = getTimeRangeBounds(timeRange);

        const nextFilters = {
            ...filters,
            startTime: range.startTime,
            endTime: range.endTime,
            offset: (currentPage - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
        };

        setFilters(nextFilters);

        void fetchLogs(
            selectedProject.id,
            nextFilters,
        );

        void fetchSummary(
            selectedProject.id,
            {
                startTime: range.startTime,
                endTime: range.endTime,
            },
        );

        void fetchSources(
            selectedProject.id,
            {
                startTime: range.startTime,
                endTime: range.endTime,
            },
        );
    };

    /*
     * --------------------------------------------------------------------------
     * Log detail
     * --------------------------------------------------------------------------
     */

    const openLog = (log: Log) => {
        if (!selectedProject?.id) {
            return;
        }

        void fetchLogDetail(
            selectedProject.id,
            log.id,
        );
    };

    /*
     * --------------------------------------------------------------------------
     * Table columns
     * --------------------------------------------------------------------------
     */

    const columns: ResponsiveColumn<Log>[] =
        [
            {
                key: "level",
                header: "Level",
                mobileLabel: "Level",
                render: (log) => (
                    <LevelBadge
                        level={log.level}
                    />
                ),
            },
            {
                key: "time",
                header: "Time",
                render: (log) => (
                    <span className="font-mono text-[10px] text-zinc-700">
                        {log.time}
                    </span>
                ),
            },
            {
                key: "service",
                header: "Service",
                render: (log) => (
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/60" />

                        <span className="truncate text-xs text-zinc-500">
                            {log.service}
                        </span>
                    </div>
                ),
            },
            {
                key: "message",
                header: "Message",
                mobileLabel: "Message",
                render: (log) => (
                    <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] text-zinc-400">
                            {log.message}
                        </p>

                        <div className="mt-1 flex items-center gap-3">
                            {log.traceId !==
                                "—" && (
                                <span className="max-w-[180px] truncate font-mono text-[9px] text-zinc-800">
                                    {log.traceId}
                                </span>
                            )}

                            {log.spanId && (
                                <span className="max-w-[140px] truncate font-mono text-[9px] text-zinc-800">
                                    span:{log.spanId}
                                </span>
                            )}
                        </div>
                    </div>
                ),
            },
        ];

    return (
        <div>
            <main>
                <div>
                    {/* ====================================================== */}
                    {/* Header                                                   */}
                    {/* ====================================================== */}

                    <div className="mb-7">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <Terminal className="h-3.5 w-3.5" />

                            <span>
                                Monitoring
                            </span>

                            <span>/</span>

                            <span>Logs</span>
                        </div>

                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    Logs
                                </h1>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Search and explore application
                                    logs.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    <span className="text-xs text-zinc-500">
                                        Telemetry
                                    </span>
                                </div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTimeRange(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                        aria-expanded={
                                            showTimeRange
                                        }
                                        aria-haspopup="menu"
                                    >
                                        <Clock3 className="h-3.5 w-3.5" />

                                        {getTimeRangeLabel(
                                            timeRange,
                                        )}

                                        <ChevronDown
                                            className={`h-3 w-3 transition-transform ${
                                                showTimeRange
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>

                                    {showTimeRange && (
                                        <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl">
                                            {TIME_RANGES.map(
                                                (item) => (
                                                    <button
                                                        key={
                                                            item.value
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            selectTimeRange(
                                                                item.value,
                                                            )
                                                        }
                                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                                                            timeRange ===
                                                            item.value
                                                                ? "bg-zinc-900 text-zinc-200"
                                                                : "text-zinc-600 hover:bg-zinc-900 hover:text-zinc-400"
                                                        }`}
                                                    >
                                                        <span>
                                                            {
                                                                item.label
                                                            }
                                                        </span>

                                                        {timeRange ===
                                                            item.value && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        )}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        refresh
                                    }
                                    disabled={
                                        loading ||
                                        summaryLoading ||
                                        sourcesLoading
                                    }
                                    className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 ${
                                            loading
                                                ? "animate-spin"
                                                : ""
                                        }`}
                                    />

                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    onClick={exportLogs}
                                    disabled={
                                        logs.length === 0 ||
                                        loading
                                    }
                                    className="hidden h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                                >
                                    <Download className="h-3.5 w-3.5" />

                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ====================================================== */}
                    {/* Error                                                    */}
                    {/* ====================================================== */}

                    {error && (
                        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />

                                <p className="text-xs text-red-300">
                                    {error}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    refresh
                                }
                                className="text-[10px] text-red-400 hover:text-red-300"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ====================================================== */}
                    {/* Summary                                                   */}
                    {/* ====================================================== */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            icon={Terminal}
                            label="Total logs"
                            value={
                                summaryLoading
                                    ? "—"
                                    : formatCount(
                                          summary?.totalLogs ??
                                              0,
                                      )
                            }
                            detail={
                                summary
                                    ? `${formatPercentage(
                                          summary.totalLogs,
                                          summary.totalLogs,
                                      )} of all logs`
                                    : "No data"
                            }
                        />

                        <SummaryCard
                            icon={Info}
                            label="Info"
                            value={
                                summaryLoading
                                    ? "—"
                                    : formatCount(
                                          summary?.infoLogs ??
                                              0,
                                      )
                            }
                            detail={
                                summary
                                    ? `${formatPercentage(
                                          summary.infoLogs,
                                          summary.totalLogs,
                                      )} of total`
                                    : "No data"
                            }
                        />

                        <SummaryCard
                            icon={TriangleAlert}
                            label="Warnings"
                            value={
                                summaryLoading
                                    ? "—"
                                    : formatCount(
                                          summary?.warnLogs ??
                                              0,
                                      )
                            }
                            detail={
                                summary
                                    ? `${formatPercentage(
                                          summary.warnLogs,
                                          summary.totalLogs,
                                      )} of total`
                                    : "No data"
                            }
                        />

                        <SummaryCard
                            icon={AlertCircle}
                            label="Errors"
                            value={
                                summaryLoading
                                    ? "—"
                                    : formatCount(
                                          summary?.errorLogs ??
                                              0,
                                      )
                            }
                            detail={
                                summary
                                    ? `${formatPercentage(
                                          summary.errorLogs,
                                          summary.totalLogs,
                                      )} of total`
                                    : "No data"
                            }
                        />
                    </div>

                    {/* ====================================================== */}
                    {/* Search + Filters                                         */}
                    {/* ====================================================== */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="p-4">
                            <div className="flex flex-col gap-3 xl:flex-row">
                                {/* Search */}

                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                                    <input
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event,
                                        ) => {
                                            setSearch(
                                                event
                                                    .target
                                                    .value,
                                            );

                                            setPage(
                                                1,
                                            );
                                        }}
                                        placeholder="Search logs, services, trace IDs..."
                                        className="
                                            h-10 w-full
                                            rounded-lg
                                            border border-zinc-900
                                            bg-black
                                            pl-9 pr-9
                                            text-xs text-zinc-300
                                            outline-none
                                            placeholder:text-zinc-800
                                            focus:border-zinc-700
                                        "
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch(
                                                    "",
                                                );
                                                setPage(
                                                    1,
                                                );
                                            }}
                                            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Levels */}

                                <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
                                    {levels.map(
                                        (item) => (
                                            <button
                                                key={
                                                    item
                                                }
                                                type="button"
                                                onClick={() =>
                                                    changeLevel(
                                                        item,
                                                    )
                                                }
                                                className={`
                                                    h-10
                                                    shrink-0
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    text-xs
                                                    transition-colors
                                                    ${
                                                        level ===
                                                        item
                                                            ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                                                            : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                                    }
                                                `}
                                            >
                                                {
                                                    item
                                                }
                                            </button>
                                        ),
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowFilters(
                                                (
                                                    current,
                                                ) =>
                                                    !current,
                                            )
                                        }
                                        className={`
                                            flex h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            border
                                            transition-colors
                                            ${
                                                showFilters
                                                    ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                                                    : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-300"
                                            }
                                        `}
                                        aria-label="Toggle filters"
                                    >
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Service filters */}

                            <div className="mt-3 flex gap-2 overflow-x-auto border-t border-zinc-900 pt-3">
                                {sourcesLoading ? (
                                    <span className="px-2.5 py-1.5 text-[10px] text-zinc-800">
                                        Loading services...
                                    </span>
                                ) : (
                                    services.map(
                                        (
                                            item,
                                        ) => (
                                            <button
                                                key={
                                                    item
                                                }
                                                type="button"
                                                onClick={() =>
                                                    changeService(
                                                        item,
                                                    )
                                                }
                                                className={`
                                                    shrink-0
                                                    rounded-md
                                                    px-2.5 py-1.5
                                                    text-[10px]
                                                    transition-colors
                                                    ${
                                                        service ===
                                                        item
                                                            ? "bg-zinc-800 text-zinc-300"
                                                            : "text-zinc-700 hover:bg-zinc-900 hover:text-zinc-500"
                                                    }
                                                `}
                                            >
                                                {
                                                    item
                                                }
                                            </button>
                                        ),
                                    )
                                )}
                            </div>

                            {/* Extra filters */}

                            {showFilters && (
                                <div className="mt-3 flex flex-col gap-3 border-t border-zinc-900 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-700">
                                            Active filters:
                                        </span>

                                        <span className="rounded-md border border-zinc-900 bg-black px-2 py-1 text-[10px] text-zinc-600">
                                            {hasFilters
                                                ? "Applied"
                                                : "None"}
                                        </span>

                                        {hasFilters && (
                                            <button
                                                type="button"
                                                onClick={
                                                    resetFilters
                                                }
                                                className="rounded-md px-2 py-1 text-[10px] text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>

                                    <span className="text-[10px] text-zinc-800">
                                        Filters are applied on the server.
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ====================================================== */}
                    {/* Log Stream                                                */}
                    {/* ====================================================== */}

                    <section className="mt-4 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-900 bg-black">
                                    <Terminal className="h-3.5 w-3.5 text-zinc-700" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-zinc-400">
                                        Log stream
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-zinc-800">
                                        {total}{" "}
                                        results
                                    </p>
                                </div>
                            </div>

                            <span className="hidden text-[10px] text-zinc-800 sm:block">
                                {loading
                                    ? "Loading logs..."
                                    : "Showing latest logs"}
                            </span>
                        </div>

                        {loading ? (
                            <LoadingState />
                        ) : uiLogs.length >
                          0 ? (
                            <ResponsiveDataTable
                                data={uiLogs}
                                columns={columns}
                                rowKey={(log) =>
                                    log.id
                                }
                                onRowClick={
                                    openLog
                                }
                            />
                        ) : (
                            <EmptyState
                                hasFilters={
                                    hasFilters
                                }
                                onReset={
                                    resetFilters
                                }
                            />
                        )}

                        {/* Pagination */}

                        {total > 0 && (
                            <div className="flex flex-col gap-3 border-t border-zinc-900 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-[10px] text-zinc-700">
                                    Showing{" "}
                                    <span className="text-zinc-500">
                                        {firstItem}–
                                        {lastItem}
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-zinc-500">
                                        {total}
                                    </span>{" "}
                                    logs
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                                1 ||
                                            loading
                                        }
                                        onClick={() => {
                                            setPage(
                                                (
                                                    current,
                                                ) =>
                                                    Math.max(
                                                        1,
                                                        current -
                                                            1,
                                                    ),
                                            );
                                        }}
                                        className="
                                            rounded-lg
                                            border
                                            border-zinc-900
                                            px-3 py-1.5
                                            text-xs
                                            text-zinc-600
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-300
                                            disabled:cursor-not-allowed
                                            disabled:text-zinc-800
                                        "
                                    >
                                        Previous
                                    </button>

                                    <span className="min-w-20 text-center text-[10px] text-zinc-700">
                                        Page{" "}
                                        <span className="text-zinc-500">
                                            {
                                                currentPage
                                            }
                                        </span>{" "}
                                        /{" "}
                                        <span className="text-zinc-500">
                                            {
                                                totalPages
                                            }
                                        </span>
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                                totalPages ||
                                            loading
                                        }
                                        onClick={() => {
                                            setPage(
                                                (
                                                    current,
                                                ) =>
                                                    Math.min(
                                                        totalPages,
                                                        current +
                                                            1,
                                                    ),
                                            );
                                        }}
                                        className="
                                            rounded-lg
                                            border
                                            border-zinc-900
                                            px-3 py-1.5
                                            text-xs
                                            text-zinc-600
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-300
                                            disabled:cursor-not-allowed
                                            disabled:text-zinc-800
                                        "
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ====================================================== */}
                    {/* Bottom status                                            */}
                    {/* ====================================================== */}

                    <div className="mt-4 flex flex-col justify-between gap-3 text-[10px] text-zinc-800 sm:flex-row sm:items-center">
                        <span>
                            Showing{" "}
                            <span className="text-zinc-600">
                                {uiLogs.length}
                            </span>{" "}
                            of{" "}
                            <span className="text-zinc-600">
                                {total}
                            </span>{" "}
                            logs
                        </span>

                        <div className="flex items-center gap-2">
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    loading
                                        ? "animate-pulse bg-amber-500"
                                        : "bg-emerald-500"
                                }`}
                            />

                            <span>
                                {loading
                                    ? "Loading logs"
                                    : "Receiving telemetry"}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ========================================================== */}
            {/* Detail Drawer                                              */}
            {/* ========================================================== */}

            {selectedLog && (
                <LogDetail
                    log={selectedLog}
                    loading={detailLoading}
                    onClose={
                        clearSelectedLog
                    }
                />
            )}
        </div>
    );
}

/* ==========================================================================
 * Summary Card
 * ========================================================================== */

function SummaryCard({
    icon: Icon,
    label,
    value,
    detail,
}: {
    icon: typeof Terminal;
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 transition-colors hover:border-zinc-800">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">
                    {label}
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                    <Icon className="h-4 w-4 text-zinc-700" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">
                {value}
            </p>

            <p className="mt-1 text-[10px] text-zinc-700">
                {detail}
            </p>
        </div>
    );
}

/* ==========================================================================
 * Level Badge
 * ========================================================================== */

function LevelBadge({
    level,
}: {
    level: LogLevel;
}) {
    const styles: Record<
        LogLevel,
        string
    > = {
        INFO: "border-zinc-800 bg-zinc-900/50 text-zinc-500",
        WARN: "border-amber-500/10 bg-amber-500/5 text-amber-500",
        ERROR: "border-red-500/10 bg-red-500/5 text-red-400",
        DEBUG: "border-cyan-500/10 bg-cyan-500/5 text-cyan-600",
        UNKNOWN:
            "border-zinc-800 bg-zinc-900/50 text-zinc-600",
    };

    return (
        <span
            className={`
                inline-flex
                min-w-[46px]
                justify-center
                rounded
                border
                px-1.5 py-1
                font-mono
                text-[8px]
                font-medium
                ${styles[level]}
            `}
        >
            {level}
        </span>
    );
}

/* ==========================================================================
 * Loading State
 * ========================================================================== */

function LoadingState() {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                <RefreshCw className="h-4 w-4 animate-spin text-zinc-700" />
            </div>

            <h3 className="mt-4 text-sm font-medium text-zinc-400">
                Loading logs
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-700">
                Fetching telemetry from the selected project.
            </p>
        </div>
    );
}

/* ==========================================================================
 * Empty State
 * ========================================================================== */

function EmptyState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                <Search className="h-4 w-4 text-zinc-700" />
            </div>

            <h3 className="mt-4 text-sm font-medium text-zinc-400">
                {hasFilters
                    ? "No logs found"
                    : "No logs yet"}
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-700">
                {hasFilters
                    ? "Try changing your search or filters."
                    : "Logs will appear here once your application starts sending telemetry."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="
                        mt-5
                        rounded-lg
                        border border-zinc-800
                        bg-zinc-950
                        px-3 py-2
                        text-xs
                        text-zinc-500
                        transition-colors
                        hover:bg-zinc-900
                        hover:text-zinc-300
                    "
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

/* ==========================================================================
 * Log Detail Drawer
 * ========================================================================== */

function LogDetail({
    log,
    loading,
    onClose,
}: {
    log: ApiLog;
    loading: boolean;
    onClose: () => void;
}) {
    const level = normalizeLevel(
        log.severityText,
        log.severityNumber,
    );

    const service =
        log.serviceName ??
        "Unknown service";

    const message =
        log.body ??
        "(empty log body)";

    return (
        <div className="fixed inset-0 z-[100]">
            <button
                type="button"
                aria-label="Close log details"
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-zinc-900 bg-zinc-950 shadow-2xl">
                {/* Header */}

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/95 px-5 py-4 backdrop-blur">
                    <div>
                        <p className="text-xs font-medium text-zinc-300">
                            Log details
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-700">
                            {formatDateTime(
                                log.timestamp,
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-6 p-5">
                    {/* Loading indicator */}

                    {loading && (
                        <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-black px-3 py-2">
                            <RefreshCw className="h-3 w-3 animate-spin text-zinc-700" />

                            <span className="text-[10px] text-zinc-600">
                                Loading latest log details...
                            </span>
                        </div>
                    )}

                    {/* Level */}

                    <div>
                        <LevelBadge
                            level={level}
                        />
                    </div>

                    {/* Message */}

                    <div>
                        <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-700">
                            Message
                        </p>

                        <div className="rounded-lg border border-zinc-900 bg-black p-4">
                            <p className="break-words font-mono text-xs leading-6 text-zinc-400">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Metadata */}

                    <div>
                        <p className="mb-3 text-[10px] uppercase tracking-wider text-zinc-700">
                            Metadata
                        </p>

                        <div className="overflow-hidden rounded-lg border border-zinc-900">
                            <MetadataRow
                                label="Service"
                                value={service}
                            />

                            <MetadataRow
                                label="Timestamp"
                                value={formatDateTime(
                                    log.timestamp,
                                )}
                            />

                            {log.observedTimestamp && (
                                <MetadataRow
                                    label="Observed timestamp"
                                    value={formatDateTime(
                                        log.observedTimestamp,
                                    )}
                                />
                            )}

                            <MetadataRow
                                label="Level"
                                value={
                                    log.severityText ??
                                    level
                                }
                            />

                            <MetadataRow
                                label="Severity number"
                                value={
                                    log.severityNumber !==
                                    null
                                        ? String(
                                              log.severityNumber,
                                          )
                                        : "—"
                                }
                            />

                            {log.traceId && (
                                <MetadataRow
                                    label="Trace ID"
                                    value={
                                        log.traceId
                                    }
                                    copyable
                                />
                            )}

                            {log.spanId && (
                                <MetadataRow
                                    label="Span ID"
                                    value={
                                        log.spanId
                                    }
                                    copyable
                                />
                            )}

                            <MetadataRow
                                label="Environment"
                                value={
                                    log.environment ??
                                    "—"
                                }
                            />

                            <MetadataRow
                                label="Scope"
                                value={
                                    log.scopeName ??
                                    "—"
                                }
                            />

                            <MetadataRow
                                label="Scope version"
                                value={
                                    log.scopeVersion ??
                                    "—"
                                }
                            />
                        </div>
                    </div>

                    {/* Attributes */}

                    <AttributeSection
                        title="Attributes"
                        attributes={
                            log.attributes
                        }
                    />

                    {/* Resource attributes */}

                    <AttributeSection
                        title="Resource attributes"
                        attributes={
                            log.resourceAttributes
                        }
                    />

                    {/* Trace */}

                    {log.traceId && (
                        <div>
                            <p className="mb-3 text-[10px] uppercase tracking-wider text-zinc-700">
                                Trace
                            </p>

                            <Link
                                href={`/dashboard/traces?trace=${encodeURIComponent(
                                    log.traceId,
                                )}`}
                                className="flex w-full items-center justify-between rounded-lg border border-zinc-900 bg-black p-4 text-left transition-colors hover:border-zinc-800"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-mono text-xs text-zinc-400">
                                        {
                                            log.traceId
                                        }
                                    </p>

                                    <p className="mt-1 text-[10px] text-zinc-800">
                                        View related trace
                                    </p>
                                </div>

                                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700" />
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

/* ==========================================================================
 * Attribute Section
 * ========================================================================== */

function AttributeSection({
    title,
    attributes,
}: {
    title: string;
    attributes:
        | Record<string, unknown>
        | null;
}) {
    const entries = attributes
        ? Object.entries(attributes)
        : [];

    if (entries.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="mb-3 text-[10px] uppercase tracking-wider text-zinc-700">
                {title}
            </p>

            <div className="space-y-2 rounded-lg border border-zinc-900 bg-black p-4">
                {entries.map(
                    ([key, value]) => (
                        <ContextRow
                            key={key}
                            label={key}
                            value={formatAttributeValue(
                                value,
                            )}
                        />
                    ),
                )}
            </div>
        </div>
    );
}

/* ==========================================================================
 * Metadata Row
 * ========================================================================== */

function MetadataRow({
    label,
    value,
    copyable,
}: {
    label: string;
    value: string;
    copyable?: boolean;
}) {
    const copyValue = async () => {
        if (
            typeof navigator !==
            "undefined"
        ) {
            try {
                await navigator.clipboard.writeText(
                    value,
                );
            } catch (error) {
                console.error(
                    "Failed to copy value:",
                    error,
                );
            }
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-900 px-4 py-3 last:border-0">
            <span className="shrink-0 text-[10px] text-zinc-700">
                {label}
            </span>

            <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-right font-mono text-[10px] text-zinc-500">
                    {value}
                </span>

                {copyable && (
                    <button
                        type="button"
                        onClick={
                            copyValue
                        }
                        className="shrink-0 text-zinc-800 transition-colors hover:text-zinc-400"
                        aria-label={`Copy ${label}`}
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

/* ==========================================================================
 * Context Row
 * ========================================================================== */

function ContextRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="min-w-0 truncate font-mono text-[10px] text-zinc-700">
                {label}
            </span>

            <span className="max-w-[60%] break-all text-right font-mono text-[10px] text-zinc-500">
                {value}
            </span>
        </div>
    );
}

/* ==========================================================================
 * Helpers
 * ========================================================================== */

const TIME_RANGES: Array<{
    value: "15m" | "1h" | "6h" | "24h" | "7d";
    label: string;
    milliseconds: number;
}> = [
    {
        value: "15m",
        label: "Last 15 minutes",
        milliseconds: 15 * 60 * 1000,
    },
    {
        value: "1h",
        label: "Last 1 hour",
        milliseconds: 60 * 60 * 1000,
    },
    {
        value: "6h",
        label: "Last 6 hours",
        milliseconds: 6 * 60 * 60 * 1000,
    },
    {
        value: "24h",
        label: "Last 24 hours",
        milliseconds: 24 * 60 * 60 * 1000,
    },
    {
        value: "7d",
        label: "Last 7 days",
        milliseconds: 7 * 24 * 60 * 60 * 1000,
    },
];

function getTimeRangeBounds(
    range: "15m" | "1h" | "6h" | "24h" | "7d",
) {
    const selected = TIME_RANGES.find(
        (item) => item.value === range,
    );

    const milliseconds =
        selected?.milliseconds ??
        24 * 60 * 60 * 1000;

    const end = new Date();
    const start = new Date(
        end.getTime() - milliseconds,
    );

    return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
    };
}

function getTimeRangeLabel(
    range: "15m" | "1h" | "6h" | "24h" | "7d",
) {
    return (
        TIME_RANGES.find(
            (item) => item.value === range,
        )?.label ?? "Last 24 hours"
    );
}

function csvEscape(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
}

function normalizeLevel(
    severityText: string | null,
    severityNumber: number | null,
): LogLevel {
    const text =
        severityText
            ?.trim()
            .toUpperCase();

    if (
        text === "INFO" ||
        text === "INFORMATION" ||
        text === "NOTICE"
    ) {
        return "INFO";
    }

    if (
        text === "WARN" ||
        text === "WARNING"
    ) {
        return "WARN";
    }

    if (
        text === "ERROR" ||
        text === "ERR"
    ) {
        return "ERROR";
    }

    if (
        text === "DEBUG" ||
        text === "TRACE"
    ) {
        return "DEBUG";
    }

    /*
     * OpenTelemetry severity numbers:
     *
     * 1-4   TRACE
     * 5-8   DEBUG
     * 9-12  INFO
     * 13-16 WARN
     * 17-20 ERROR
     * 21-24 FATAL
     */

    if (
        severityNumber !== null
    ) {
        if (
            severityNumber >= 17
        ) {
            return "ERROR";
        }

        if (
            severityNumber >= 13
        ) {
            return "WARN";
        }

        if (
            severityNumber >= 9
        ) {
            return "INFO";
        }

        if (
            severityNumber >= 5
        ) {
            return "DEBUG";
        }
    }

    return "UNKNOWN";
}

function formatDateTime(
    value: string,
): string {
    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        },
    ).format(date);
}

function formatCount(
    value: number,
): string {
    if (!Number.isFinite(value)) {
        return "0";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            notation: "compact",
            maximumFractionDigits: 1,
        },
    ).format(value);
}

function formatPercentage(
    value: number,
    total: number,
): string {
    if (
        !total ||
        !Number.isFinite(value) ||
        !Number.isFinite(total)
    ) {
        return "0%";
    }

    const percentage =
        (value / total) * 100;

    return `${percentage.toFixed(
        percentage >= 10 ? 0 : 1,
    )}%`;
}

function formatAttributeValue(
    value: unknown,
): string {
    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    if (
        typeof value === "string"
    ) {
        return value;
    }

    if (
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    try {
        return JSON.stringify(
            value,
        );
    } catch {
        return String(value);
    }
}