"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    Activity,
    ChevronDown,
    Filter,
    RefreshCw,
    Search,
    SlidersHorizontal,
    TriangleAlert,
    Waypoints,
} from "lucide-react";

import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../components/ResponsiveDataTable";

type TraceStatus = "OK" | "Error";

type Trace = {
    id: string;
    service: string;
    operation: string;
    spans: number;
    duration: string;
    durationMs: number;
    status: TraceStatus;
    time: string;
};

const traces: Trace[] = [
    {
        id: "f93274a4f5cf9e4b9e5d93259a190be3",
        service: "uptrace-api",
        operation: "POST /v1/traces",
        spans: 12,
        duration: "111ms",
        durationMs: 111,
        status: "OK",
        time: "12 sec ago",
    },
    {
        id: "a82bc193d7f34b6c91e2a841c5d19f72",
        service: "api",
        operation: "GET /projects",
        spans: 8,
        duration: "84ms",
        durationMs: 84,
        status: "OK",
        time: "28 sec ago",
    },
    {
        id: "73d91ea2bc841f7a6e193d52c8a04b91",
        service: "web",
        operation: "GET /dashboard",
        spans: 15,
        duration: "242ms",
        durationMs: 242,
        status: "OK",
        time: "1 min ago",
    },
    {
        id: "c52a9f01e7b438d92a614f85b3d29c61",
        service: "api",
        operation: "POST /auth/login",
        spans: 19,
        duration: "391ms",
        durationMs: 391,
        status: "Error",
        time: "2 min ago",
    },
    {
        id: "9a21dc84f6e218b73c049d51a7f32e86",
        service: "worker",
        operation: "process.telemetry",
        spans: 6,
        duration: "67ms",
        durationMs: 67,
        status: "OK",
        time: "3 min ago",
    },
    {
        id: "d71c4e92a83f61b05e27d943c8a12f64",
        service: "uptrace-api",
        operation: "GET /health",
        spans: 4,
        duration: "23ms",
        durationMs: 23,
        status: "OK",
        time: "4 min ago",
    },
    {
        id: "b48e92c17f63a05d2841e9c73a61f520",
        service: "api",
        operation: "GET /organizations",
        spans: 9,
        duration: "126ms",
        durationMs: 126,
        status: "OK",
        time: "5 min ago",
    },
    {
        id: "e31a7f82c649d05b1738c2e94f61a528",
        service: "worker",
        operation: "telemetry.batch",
        spans: 11,
        duration: "204ms",
        durationMs: 204,
        status: "OK",
        time: "6 min ago",
    },
    {
        id: "8b72a1c94f613d05e27a943c8a91f624",
        service: "api",
        operation: "GET /users",
        spans: 13,
        duration: "173ms",
        durationMs: 173,
        status: "OK",
        time: "8 min ago",
    },
    {
        id: "71d82c4e93a16b05e27d943c8a12f653",
        service: "web",
        operation: "GET /settings",
        spans: 7,
        duration: "298ms",
        durationMs: 298,
        status: "Error",
        time: "9 min ago",
    },
    {
        id: "42c91e7a83f61b05e27d943c8a12f784",
        service: "uptrace-api",
        operation: "POST /events",
        spans: 10,
        duration: "96ms",
        durationMs: 96,
        status: "OK",
        time: "11 min ago",
    },
    {
        id: "19d82c4e73a16b05e27d943c8a12f695",
        service: "worker",
        operation: "process.events",
        spans: 5,
        duration: "54ms",
        durationMs: 54,
        status: "OK",
        time: "13 min ago",
    },
];

const PAGE_SIZE = 8;

export default function TracesPage() {
    const [search, setSearch] = useState("");
    const [service, setService] = useState("All services");
    const [status, setStatus] = useState("All statuses");
    const [durationFilter, setDurationFilter] =
        useState("All durations");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);

    const services = useMemo(
        () => [
            "All services",
            ...Array.from(
                new Set(
                    traces.map(
                        (trace) => trace.service,
                    ),
                ),
            ),
        ],
        [],
    );

    const filteredTraces = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return traces.filter((trace) => {
            const matchesSearch =
                !query ||
                trace.id
                    .toLowerCase()
                    .includes(query) ||
                trace.service
                    .toLowerCase()
                    .includes(query) ||
                trace.operation
                    .toLowerCase()
                    .includes(query);

            const matchesService =
                service === "All services" ||
                trace.service === service;

            const matchesStatus =
                status === "All statuses" ||
                trace.status === status;

            const matchesDuration =
                durationFilter ===
                    "All durations" ||
                (durationFilter === "Fast" &&
                    trace.durationMs < 100) ||
                (durationFilter === "Slow" &&
                    trace.durationMs >= 100);

            return (
                matchesSearch &&
                matchesService &&
                matchesStatus &&
                matchesDuration
            );
        });
    }, [
        search,
        service,
        status,
        durationFilter,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredTraces.length /
                PAGE_SIZE,
        ),
    );

    const currentPage = Math.min(
        page,
        totalPages,
    );

    const paginatedTraces = useMemo(() => {
        const start =
            (currentPage - 1) *
            PAGE_SIZE;

        return filteredTraces.slice(
            start,
            start + PAGE_SIZE,
        );
    }, [
        filteredTraces,
        currentPage,
    ]);

    const firstItem =
        filteredTraces.length === 0
            ? 0
            : (currentPage - 1) *
                    PAGE_SIZE +
                1;

    const lastItem = Math.min(
        currentPage * PAGE_SIZE,
        filteredTraces.length,
    );

    const columns: ResponsiveColumn<Trace>[] =
        [
            {
                key: "id",
                header: "Trace",
                mobileLabel: "Trace ID",
                render: (trace) => (
                    <Link
                        href={`/dashboard/traces/${trace.id}`}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        className="
                            group
                            font-mono
                            text-xs
                            text-zinc-400
                            transition-colors
                            hover:text-zinc-100
                        "
                    >
                        {trace.id.slice(
                            0,
                            16,
                        )}

                        <span className="ml-1 text-zinc-700 group-hover:text-zinc-500">
                            ...
                        </span>
                    </Link>
                ),
            },
            {
                key: "service",
                header: "Service",
                render: (trace) => (
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/70" />

                        <span className="text-xs text-zinc-400">
                            {trace.service}
                        </span>
                    </div>
                ),
            },
            {
                key: "operation",
                header: "Operation",
                render: (trace) => (
                    <span className="font-mono text-xs text-zinc-500">
                        {trace.operation}
                    </span>
                ),
            },
            {
                key: "spans",
                header: "Spans",
                render: (trace) => (
                    <span className="text-xs text-zinc-600">
                        {trace.spans}
                    </span>
                ),
            },
            {
                key: "duration",
                header: "Duration",
                render: (trace) => (
                    <span
                        className={`font-mono text-xs ${
                            trace.durationMs >=
                            300
                                ? "text-amber-500"
                                : "text-zinc-500"
                        }`}
                    >
                        {trace.duration}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                render: (trace) =>
                    trace.status ===
                    "OK" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            OK
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            Error
                        </span>
                    ),
            },
            {
                key: "time",
                header: "Time",
                render: (trace) => (
                    <span className="text-xs text-zinc-700">
                        {trace.time}
                    </span>
                ),
            },
        ];

    const hasActiveFilters =
        search.trim().length > 0 ||
        service !== "All services" ||
        status !== "All statuses" ||
        durationFilter !==
            "All durations";

    const resetFilters = () => {
        setSearch("");
        setService("All services");
        setStatus("All statuses");
        setDurationFilter(
            "All durations",
        );
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* ================================================== */}
                    {/* Header                                             */}
                    {/* ================================================== */}

                    <div className="mb-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                                    <Waypoints className="h-3.5 w-3.5" />

                                    <span>
                                        Monitoring
                                    </span>

                                    <span>/</span>

                                    <span>
                                        Traces
                                    </span>
                                </div>

                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    Traces
                                </h1>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Explore requests and
                                    distributed traces
                                    across your services.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(1)
                                }
                                className="
                                    flex h-9
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-zinc-800
                                    bg-zinc-950
                                    px-3
                                    text-xs
                                    font-medium
                                    text-zinc-400
                                    transition-colors
                                    hover:bg-zinc-900
                                    hover:text-zinc-200
                                "
                            >
                                <RefreshCw className="h-3.5 w-3.5" />

                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* Filters                                             */}
                    {/* ================================================== */}

                    <div className="mb-5 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 p-3 lg:flex-row">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                                <input
                                    type="search"
                                    value={search}
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
                                    placeholder="Search traces, services, operations..."
                                    className="
                                        h-10 w-full
                                        rounded-lg
                                        border border-zinc-900
                                        bg-black
                                        pl-9 pr-4
                                        text-sm
                                        text-zinc-300
                                        outline-none
                                        placeholder:text-zinc-700
                                        focus:border-zinc-700
                                    "
                                />
                            </div>

                            {/* Service */}
                            <SelectButton
                                value={
                                    service
                                }
                                options={
                                    services
                                }
                                onChange={(
                                    value,
                                ) => {
                                    setService(
                                        value,
                                    );
                                    setPage(
                                        1,
                                    );
                                }}
                            />

                            {/* Status */}
                            <SelectButton
                                value={status}
                                options={[
                                    "All statuses",
                                    "OK",
                                    "Error",
                                ]}
                                onChange={(
                                    value,
                                ) => {
                                    setStatus(
                                        value,
                                    );
                                    setPage(
                                        1,
                                    );
                                }}
                            />

                            {/* Filters */}
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
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    px-3
                                    text-xs
                                    transition-colors
                                    ${
                                        showFilters ||
                                        hasActiveFilters
                                            ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                                            : "border-zinc-900 bg-black text-zinc-500 hover:border-zinc-800 hover:text-zinc-300"
                                    }
                                `}
                            >
                                <Filter className="h-3.5 w-3.5" />

                                Filters

                                {hasActiveFilters && (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-800 px-1 text-[8px] text-zinc-400">
                                        !
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                aria-label="View settings"
                                className="
                                    flex h-10 w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-zinc-900
                                    bg-black
                                    text-zinc-600
                                    transition-colors
                                    hover:border-zinc-800
                                    hover:text-zinc-300
                                "
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="border-t border-zinc-900 px-3 py-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <FilterChip
                                            label="Duration"
                                            value={
                                                durationFilter
                                            }
                                            options={[
                                                "All durations",
                                                "Fast",
                                                "Slow",
                                            ]}
                                            onChange={(
                                                value,
                                            ) => {
                                                setDurationFilter(
                                                    value,
                                                );
                                                setPage(
                                                    1,
                                                );
                                            }}
                                        />

                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={
                                                    resetFilters
                                                }
                                                className="
                                                    rounded-lg
                                                    px-3 py-2
                                                    text-[10px]
                                                    text-zinc-700
                                                    transition-colors
                                                    hover:bg-zinc-900
                                                    hover:text-zinc-400
                                                "
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-zinc-700">
                                        <TriangleAlert className="h-3 w-3" />

                                        <span>
                                            Filters are
                                            currently
                                            applied
                                            locally.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ================================================== */}
                    {/* Results                                             */}
                    {/* ================================================== */}

                    <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-300">
                                    Recent traces
                                </p>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {
                                        filteredTraces.length
                                    }{" "}
                                    {filteredTraces.length ===
                                    1
                                        ? "trace"
                                        : "traces"}{" "}
                                    matched
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-700">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />

                                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                </span>

                                <span>
                                    Live ingestion
                                </span>
                            </div>
                        </div>

                        {paginatedTraces.length >
                        0 ? (
                            <ResponsiveDataTable
                                data={
                                    paginatedTraces
                                }
                                columns={
                                    columns
                                }
                                rowKey={(
                                    trace,
                                ) =>
                                    trace.id
                                }
                                onRowClick={(
                                    trace,
                                ) => {
                                    window.location.href =
                                        `/dashboard/traces/${trace.id}`;
                                }}
                            />
                        ) : (
                            <EmptyTraceState
                                hasFilters={
                                    hasActiveFilters
                                }
                                onReset={
                                    resetFilters
                                }
                            />
                        )}

                        {/* Pagination */}
                        {filteredTraces.length >
                            0 && (
                            <div className="flex flex-col gap-3 border-t border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-zinc-700">
                                    Showing{" "}
                                    <span className="text-zinc-500">
                                        {
                                            firstItem
                                        }
                                        –
                                        {
                                            lastItem
                                        }
                                    </span>{" "}
                                    of{" "}
                                    <span className="text-zinc-500">
                                        {
                                            filteredTraces.length
                                        }
                                    </span>
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setPage(
                                                (
                                                    current,
                                                ) =>
                                                    Math.max(
                                                        1,
                                                        current -
                                                            1,
                                                    ),
                                            )
                                        }
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
                                            disabled:hover:bg-transparent
                                        "
                                    >
                                        Previous
                                    </button>

                                    {Array.from(
                                        {
                                            length: totalPages,
                                        },
                                        (
                                            _,
                                            index,
                                        ) =>
                                            index +
                                            1,
                                    ).map(
                                        (
                                            pageNumber,
                                        ) => (
                                            <button
                                                key={
                                                    pageNumber
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setPage(
                                                        pageNumber,
                                                    )
                                                }
                                                className={`
                                                    min-w-8
                                                    rounded-lg
                                                    border
                                                    px-2.5 py-1.5
                                                    text-xs
                                                    transition-colors
                                                    ${
                                                        currentPage ===
                                                        pageNumber
                                                            ? "border-zinc-800 bg-zinc-900 text-zinc-300"
                                                            : "border-zinc-900 text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300"
                                                    }
                                                `}
                                            >
                                                {
                                                    pageNumber
                                                }
                                            </button>
                                        ),
                                    )}

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setPage(
                                                (
                                                    current,
                                                ) =>
                                                    Math.min(
                                                        totalPages,
                                                        current +
                                                            1,
                                                    ),
                                            )
                                        }
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
                                            disabled:hover:bg-transparent
                                        "
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ================================================== */}
                    {/* Bottom Info                                         */}
                    {/* ================================================== */}

                    <div className="mt-4 flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3" />

                            <span>
                                Trace data updates
                                automatically when
                                live ingestion is
                                enabled.
                            </span>
                        </div>

                        <Link
                            href="/dashboard/services"
                            className="transition-colors hover:text-zinc-500"
                        >
                            View service health →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ========================================================================== */
/* Select Button                                                              */
/* ========================================================================== */

function SelectButton({
    value,
    options,
    onChange,
}: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="relative">
            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="
                    h-10
                    w-full
                    appearance-none
                    rounded-lg
                    border border-zinc-900
                    bg-black
                    px-3
                    pr-9
                    text-left
                    text-xs
                    text-zinc-500
                    outline-none
                    transition-colors
                    hover:border-zinc-800
                    focus:border-zinc-700
                    sm:w-auto
                    sm:min-w-[145px]
                "
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                        className="bg-zinc-950 text-zinc-400"
                    >
                        {option}
                    </option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-700" />
        </label>
    );
}

/* ========================================================================== */
/* Filter Chip                                                                */
/* ========================================================================== */

function FilterChip({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="relative flex items-center">
            <span className="mr-2 text-[10px] text-zinc-700">
                {label}
            </span>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="
                    h-8
                    appearance-none
                    rounded-lg
                    border border-zinc-900
                    bg-black
                    px-2.5
                    pr-7
                    text-[10px]
                    text-zinc-500
                    outline-none
                    hover:border-zinc-800
                    focus:border-zinc-700
                "
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                        className="bg-zinc-950"
                    >
                        {option}
                    </option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-zinc-700" />
        </label>
    );
}

/* ========================================================================== */
/* Empty State                                                                */
/* ========================================================================== */

function EmptyTraceState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                <Search className="h-4 w-4 text-zinc-700" />
            </div>

            <h3 className="mt-4 text-sm font-medium text-zinc-400">
                {hasFilters
                    ? "No matching traces"
                    : "No traces yet"}
            </h3>

            <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-700">
                {hasFilters
                    ? "Try adjusting your search or filters to find the traces you're looking for."
                    : "Once your application starts sending telemetry, captured traces will appear here."}
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