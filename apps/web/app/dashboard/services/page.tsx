"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Clock3,
    Search,
    Server,
    SlidersHorizontal,
    TriangleAlert,
    X,
} from "lucide-react";

import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../components/ResponsiveDataTable";

import { useServicesStore } from "../../../stores/services.store";
import { useProjectStore } from "../../../stores/project.store";
import { useAuthStore } from "../../../stores/auth.store";

type ServiceStatus = "Healthy" | "Degraded" | "Down";

type Service = {
    name: string;
    status: ServiceStatus;
    requests: string;
    requestRate: string;
    latency: string;
    p95: string;
    errorRate: string;
    uptime: string;
    trend: "up" | "down" | "flat";
    trendValue: string;
    instances: number;
};

type TimeRange = "1h" | "6h" | "24h" | "7d";

const TIME_RANGES: Record<TimeRange, { label: string; durationMs: number }> = {
    "1h": { label: "Last 1 hour", durationMs: 60 * 60 * 1000 },
    "6h": { label: "Last 6 hours", durationMs: 6 * 60 * 60 * 1000 },
    "24h": { label: "Last 24 hours", durationMs: 24 * 60 * 60 * 1000 },
    "7d": { label: "Last 7 days", durationMs: 7 * 24 * 60 * 60 * 1000 },
};

export default function ServicesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<"All" | ServiceStatus>("All");
    const [showFilters, setShowFilters] =
        useState(false);
    const [timeRange, setTimeRange] =
        useState<TimeRange>("24h");
    const [showTimeRangeMenu, setShowTimeRangeMenu] =
        useState(false);

    const authStatus = useAuthStore(
        (state) => state.status,
    );

    const selectedProject = useProjectStore(
        (state) => state.selectedProject,
    );

    const {
        services: serviceData,
        isLoading,
        error,
        fetchServices,
    } = useServicesStore();

    useEffect(() => {
        const projectId = selectedProject?.id;

        if (
            authStatus !== "authenticated" ||
            !projectId
        ) {
            return;
        }

        const endTime = new Date();
        const startTime = new Date(
            endTime.getTime() -
                TIME_RANGES[timeRange].durationMs,
        );

        fetchServices(projectId, {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        });
    }, [
        authStatus,
        selectedProject?.id,
        timeRange,
        fetchServices,
    ]);

    // Real overview data
    const totalServices = serviceData.length;

    const totalRequests = serviceData.reduce(
        (total, service) =>
            total + service.requestCount,
        0,
    );

    const totalErrors = serviceData.reduce(
        (total, service) =>
            total + service.errorCount,
        0,
    );

    const healthyServices = serviceData.filter(
        (service) => service.errorRate < 1,
    ).length;

    const overallErrorRate =
        totalRequests > 0
            ? (totalErrors / totalRequests) * 100
            : 0;

    const overallP95Latency =
        serviceData.length > 0
            ? Math.max(
                ...serviceData.map(
                    (service) =>
                        service.p95LatencyMs,
                ),
            )
            : 0;

    const services: Service[] = serviceData.map(
        (service) => ({
            name: service.name,

            status:
                service.errorRate >= 5
                    ? "Down"
                    : service.errorRate >= 1
                        ? "Degraded"
                        : "Healthy",

            requests:
                service.requestCount.toLocaleString(),

            requestRate: "—",

            latency: `${service.averageLatencyMs}ms`,

            p95: `${service.p95LatencyMs}ms`,

            errorRate:
                `${service.errorRate.toFixed(2)}%`,

            uptime: `${service.uptime.toFixed(2)}%`,

            trend: service.trend,

            trendValue: `${service.trendValue >= 0 ? "+" : ""}${service.trendValue.toFixed(2)}%`,

            instances: 0,
        }),
    );

    const filteredServices = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return services.filter((service) => {
            const matchesSearch =
                !query ||
                service.name
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                service.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        services,
        search,
        statusFilter,
    ]);

    const columns: ResponsiveColumn<Service>[] =
        [
            {
                key: "service",
                header: "Service",
                mobileLabel: "Service",

                render: (service) => (
                    <Link
                        href={`/dashboard/services/${encodeURIComponent(
                            service.name,
                        )}`}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        className="group flex items-center gap-3"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                            <Server className="h-3.5 w-3.5 text-zinc-600" />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-zinc-400 transition-colors group-hover:text-zinc-200">
                                {service.name}
                            </p>

                            <p className="mt-1 text-[10px] text-zinc-800">
                                {service.instances > 0
                                    ? `${service.instances} ${service.instances ===
                                        1
                                        ? "instance"
                                        : "instances"
                                    }`
                                    : "Instance data unavailable"}
                            </p>
                        </div>
                    </Link>
                ),
            },

            {
                key: "status",
                header: "Status",

                render: (service) => (
                    <StatusBadge
                        status={
                            service.status
                        }
                    />
                ),
            },

            {
                key: "requests",
                header: "Requests",

                render: (service) => (
                    <div>
                        <p className="font-mono text-xs text-zinc-500">
                            {service.requests}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-800">
                            {service.requestRate}
                        </p>
                    </div>
                ),
            },

            {
                key: "latency",
                header: "Latency",

                render: (service) => (
                    <div>
                        <p className="font-mono text-xs text-zinc-500">
                            {service.latency}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-800">
                            P95 {service.p95}
                        </p>
                    </div>
                ),
            },

            {
                key: "errors",
                header: "Errors",

                render: (service) => (
                    <span
                        className={`font-mono text-xs ${service.errorRate ===
                            "0.00%"
                            ? "text-emerald-600"
                            : service.status ===
                                "Down"
                                ? "text-red-400"
                                : service.status ===
                                    "Degraded"
                                    ? "text-amber-500"
                                    : "text-zinc-500"
                            }`}
                    >
                        {service.errorRate}
                    </span>
                ),
            },

            {
                key: "uptime",
                header: "Uptime",

                render: (service) => (
                    <span className="font-mono text-xs text-zinc-500">
                        {service.uptime}
                    </span>
                ),
            },

            {
                key: "trend",
                header: "Trend",

                render: (service) => (
                    <div className="flex items-center gap-1.5">
                        {service.trend === "up" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                        ) : service.trend === "down" ? (
                            <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                        ) : (
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
                        )}

                        <span
                            className={`text-[11px] ${service.trend === "up"
                                    ? "text-emerald-500"
                                    : service.trend === "down"
                                        ? "text-red-400"
                                        : "text-zinc-600"
                                }`}
                        >
                            {service.trendValue}
                        </span>
                    </div>
                ),
            },

            {
                key: "action",
                header: "",
                mobileLabel: "Open",

                render: (service) => (
                    <Link
                        href={`/dashboard/services/${encodeURIComponent(
                            service.name,
                        )}`}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        aria-label={`Open ${service.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                    >
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                ),
            },
        ];

    const hasActiveFilters =
        search.trim().length > 0 ||
        statusFilter !== "All";

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("All");
    };

    return (
        <div>
            <main>
                <div>
                    {/* Header */}

                    <div className="mb-7">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <Server className="h-3.5 w-3.5" />

                            <span>
                                Monitoring
                            </span>

                            <span>/</span>

                            <span>
                                Services
                            </span>
                        </div>

                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    Services
                                </h1>

                                <p className="mt-1 text-sm text-zinc-600">
                                    Monitor the health and
                                    performance of your services.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                                    <span className="text-xs text-zinc-500">
                                        Live
                                    </span>
                                </div>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTimeRangeMenu(
                                                (current) => !current,
                                            )
                                        }
                                        aria-haspopup="menu"
                                        aria-expanded={showTimeRangeMenu}
                                        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                    >
                                        <Clock3 className="h-3.5 w-3.5" />
                                        <span>{TIME_RANGES[timeRange].label}</span>
                                        <ArrowDownRight
                                            className={`h-3 w-3 transition-transform ${
                                                showTimeRangeMenu ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {showTimeRangeMenu && (
                                        <div
                                            role="menu"
                                            className="absolute right-0 top-11 z-30 min-w-[170px] overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 p-1 shadow-2xl shadow-black/40"
                                        >
                                            {(Object.entries(TIME_RANGES) as [
                                                TimeRange,
                                                { label: string; durationMs: number },
                                            ][]).map(([value, range]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setTimeRange(value);
                                                        setShowTimeRangeMenu(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                                                        timeRange === value
                                                            ? "bg-zinc-900 text-zinc-200"
                                                            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                                                    }`}
                                                >
                                                    <span>{range.label}</span>
                                                    {timeRange === value && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overview */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <OverviewCard
                            icon={Server}
                            label="Total services"
                            value={totalServices.toLocaleString()}
                            detail={`${healthyServices} healthy`}
                        />

                        <OverviewCard
                            icon={Activity}
                            label="Requests"
                            value={totalRequests.toLocaleString()}
                            detail="total requests"
                        />

                        <OverviewCard
                            icon={Clock3}
                            label="P95 latency"
                            value={`${Math.round(
                                overallP95Latency,
                            )}ms`}
                            detail="highest service P95"
                        />

                        <OverviewCard
                            icon={TriangleAlert}
                            label="Error rate"
                            value={`${overallErrorRate.toFixed(
                                2,
                            )}%`}
                            detail={`${totalErrors.toLocaleString()} errors`}
                            positive={
                                overallErrorRate < 1
                            }
                        />
                    </div>

                    {/* Toolbar */}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                            <input
                                value={search}
                                onChange={(
                                    event,
                                ) =>
                                    setSearch(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Search services..."
                                className="
                                    h-10 w-full
                                    rounded-lg
                                    border border-zinc-900
                                    bg-zinc-950
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
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto">
                            <FilterButton
                                active={
                                    statusFilter ===
                                    "All"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "All",
                                    )
                                }
                            >
                                All
                            </FilterButton>

                            <FilterButton
                                active={
                                    statusFilter ===
                                    "Healthy"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "Healthy",
                                    )
                                }
                            >
                                Healthy
                            </FilterButton>

                            <FilterButton
                                active={
                                    statusFilter ===
                                    "Degraded"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "Degraded",
                                    )
                                }
                            >
                                Degraded
                            </FilterButton>

                            <FilterButton
                                active={
                                    statusFilter ===
                                    "Down"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        "Down",
                                    )
                                }
                            >
                                Down
                            </FilterButton>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowFilters(
                                        (current) =>
                                            !current,
                                    )
                                }
                                className={`
                                    flex h-10 w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    transition-colors
                                    ${showFilters
                                        ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                                        : "border-zinc-900 bg-zinc-950 text-zinc-600 hover:border-zinc-800 hover:text-zinc-300"
                                    }
                                `}
                                aria-label="More filters"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Extra filters */}

                    {showFilters && (
                        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-700">
                                    Current filter
                                </span>

                                <span className="rounded-md border border-zinc-900 bg-black px-2.5 py-1.5 text-[10px] text-zinc-500">
                                    {statusFilter ===
                                        "All"
                                        ? "All services"
                                        : statusFilter}
                                </span>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="rounded-md px-2.5 py-1.5 text-[10px] text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            <span className="text-[10px] text-zinc-800">
                                {
                                    filteredServices.length
                                }{" "}
                                matching services
                            </span>
                        </div>
                    )}

                    {/* Services table */}

                    <section className="mt-4 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    All services
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {
                                        filteredServices.length
                                    }{" "}
                                    services matching current
                                    filters
                                </p>
                            </div>

                            <span className="text-[10px] text-zinc-800">
                                {isLoading
                                    ? "Updating..."
                                    : "Updated just now"}
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <Activity className="h-4 w-4 animate-pulse text-zinc-700" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    Loading services
                                </h3>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Fetching service telemetry...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <TriangleAlert className="h-4 w-4 text-red-400" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    Failed to load services
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const projectId =
                                            selectedProject?.id;

                                        if (
                                            projectId &&
                                            authStatus ===
                                            "authenticated"
                                        ) {
                                            const endTime =
                                                new Date();
                                            const startTime =
                                                new Date(
                                                    endTime.getTime() -
                                                        TIME_RANGES[
                                                            timeRange
                                                        ].durationMs,
                                                );

                                            fetchServices(
                                                projectId,
                                                {
                                                    startTime:
                                                        startTime.toISOString(),
                                                    endTime:
                                                        endTime.toISOString(),
                                                },
                                            );
                                        }
                                    }}
                                    className="
                                        mt-5
                                        rounded-lg
                                        border border-zinc-800
                                        bg-zinc-950
                                        px-3 py-2
                                        text-xs text-zinc-500
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-300
                                    "
                                >
                                    Try again
                                </button>
                            </div>
                        ) : filteredServices.length >
                            0 ? (
                            <ResponsiveDataTable
                                data={
                                    filteredServices
                                }
                                columns={
                                    columns
                                }
                                rowKey={(
                                    service,
                                ) =>
                                    service.name
                                }
                                onRowClick={(
                                    service,
                                ) => {
                                    window.location.href =
                                        `/dashboard/services/${encodeURIComponent(
                                            service.name,
                                        )}`;
                                }}
                            />
                        ) : (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                    <Search className="h-4 w-4 text-zinc-700" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                                    No services found
                                </h3>

                                <p className="mt-1 text-xs text-zinc-700">
                                    {serviceData.length ===
                                        0
                                        ? "No OpenTelemetry service data has been received yet."
                                        : "Try changing your search or status filter."}
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="
                                            mt-5
                                            rounded-lg
                                            border border-zinc-800
                                            bg-zinc-950
                                            px-3 py-2
                                            text-xs text-zinc-500
                                            transition-colors
                                            hover:bg-zinc-900
                                            hover:text-zinc-300
                                        "
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Bottom information */}

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <InfoCard
                            icon={Activity}
                            title="Service monitoring"
                            description="Services are automatically discovered from incoming OpenTelemetry telemetry."
                        />

                        <InfoCard
                            icon={TriangleAlert}
                            title="Health alerts"
                            description="Configure alerts when latency or error rates exceed your thresholds."
                        />
                    </div>

                    <div className="mt-4 flex flex-col gap-2 text-[10px] text-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Service data is displayed from
                            incoming OpenTelemetry telemetry.
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            <span>
                                Monitoring healthy
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Overview Card
function OverviewCard({
    icon: Icon,
    label,
    value,
    detail,
    positive,
}: {
    icon: typeof Server;
    label: string;
    value: string;
    detail: string;
    positive?: boolean;
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

            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                {positive && (
                    <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                )}

                <span
                    className={
                        positive
                            ? "text-emerald-500"
                            : "text-zinc-700"
                    }
                >
                    {detail}
                </span>
            </div>
        </div>
    );
}

// Status Badge
function StatusBadge({
    status,
}: {
    status: ServiceStatus;
}) {
    const styles: Record<
        ServiceStatus,
        string
    > = {
        Healthy:
            "border-emerald-500/10 bg-emerald-500/5 text-emerald-500",

        Degraded:
            "border-amber-500/10 bg-amber-500/5 text-amber-500",

        Down:
            "border-red-500/10 bg-red-500/5 text-red-400",
    };

    const dots: Record<
        ServiceStatus,
        string
    > = {
        Healthy: "bg-emerald-500",
        Degraded: "bg-amber-500",
        Down: "bg-red-400",
    };

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-md
                border
                px-2 py-1
                text-[10px]
                ${styles[status]}
            `}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${dots[status]}`}
            />

            {status}
        </span>
    );
}

// Filter Button
function FilterButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                h-10
                shrink-0
                rounded-lg
                border
                px-3
                text-xs
                transition-colors
                ${active
                    ? "border-zinc-700 bg-zinc-900 text-zinc-200"
                    : "border-zinc-900 bg-zinc-950 text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                }
            `}
        >
            {children}
        </button>
    );
}

// Info Card
function InfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Activity;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                    <Icon className="h-4 w-4 text-zinc-600" />
                </div>

                <div>
                    <p className="text-xs font-medium text-zinc-300">
                        {title}
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-zinc-700">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}