"use client";

import Link from "next/link";
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Database,
    Server,
    TriangleAlert,
} from "lucide-react";

import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "./components/ResponsiveDataTable";

const requestData = [
    34, 42, 38, 51, 46, 58, 63, 55, 68, 61,
    73, 69, 81, 75, 88, 79, 91, 84, 95, 87,
    92, 86, 98, 91, 103, 96, 108, 101, 112, 105,
    116, 110, 121, 115, 124, 119, 128, 122, 134, 129,
];

const latencyData = [
    42, 48, 45, 51, 57, 49, 62, 55, 68, 61,
    73, 66, 78, 72, 83, 76, 89, 81, 94, 87,
    91, 85, 97, 90, 103, 96, 99, 92, 106, 101,
    95, 89, 93, 87, 91, 84, 88, 82, 86, 81,
];

const services = [
    {
        name: "uptrace-api",
        requests: "12.4K",
        latency: "111ms",
        status: "Healthy",
    },
    {
        name: "web",
        requests: "7.8K",
        latency: "184ms",
        status: "Healthy",
    },
    {
        name: "worker",
        requests: "3.2K",
        latency: "67ms",
        status: "Healthy",
    },
    {
        name: "auth-service",
        requests: "1.4K",
        latency: "391ms",
        status: "Degraded",
    },
];

const recentTraces = [
    {
        id: "trace-4f8a12",
        operation: "GET /dashboard",
        service: "web",
        duration: "242ms",
        status: "OK",
        time: "12 sec ago",
    },
    {
        id: "trace-91bc72",
        operation: "GET /projects",
        service: "uptrace-api",
        duration: "111ms",
        status: "OK",
        time: "28 sec ago",
    },
    {
        id: "trace-82ac19",
        operation: "POST /v1/traces",
        service: "uptrace-api",
        duration: "391ms",
        status: "Error",
        time: "1 min ago",
    },
    {
        id: "trace-71de42",
        operation: "SELECT traces",
        service: "postgres",
        duration: "81ms",
        status: "OK",
        time: "2 min ago",
    },
    {
        id: "trace-61ac91",
        operation: "POST /auth/login",
        service: "auth-service",
        duration: "427ms",
        status: "Error",
        time: "3 min ago",
    },
];

type RecentTrace = (typeof recentTraces)[number];

const recentTraceColumns: ResponsiveColumn<RecentTrace>[] = [
    {
        key: "operation",
        header: "Operation",
        mobileLabel: "Operation",
        render: (trace) => (
            <span className="font-mono text-xs text-zinc-400">
                {trace.operation}
            </span>
        ),
    },
    {
        key: "service",
        header: "Service",
        render: (trace) => (
            <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/60" />
                {trace.service}
            </span>
        ),
    },
    {
        key: "duration",
        header: "Duration",
        render: (trace) => (
            <span className="font-mono text-xs text-zinc-600">
                {trace.duration}
            </span>
        ),
    },
    {
        key: "status",
        header: "Status",
        render: (trace) =>
            trace.status === "OK" ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    OK
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <TriangleAlert className="h-3.5 w-3.5" />
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

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                    {/* ================================================== */}
                    {/* Header                                             */}
                    {/* ================================================== */}

                    <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                                <Activity className="h-3.5 w-3.5" />

                                <span>Monitoring</span>

                                <span>/</span>

                                <span>Overview</span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                Overview
                            </h1>

                            <p className="mt-1 text-sm text-zinc-600">
                                Monitor your application's health and
                                performance.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Live */}
                            <div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                </span>

                                <span className="text-xs text-zinc-500">
                                    Live
                                </span>
                            </div>

                            {/* Time range */}
                            <button
                                type="button"
                                className="
                                    flex h-9
                                    items-center gap-2
                                    rounded-lg
                                    border border-zinc-900
                                    bg-zinc-950
                                    px-3
                                    text-xs text-zinc-500
                                    transition-colors
                                    hover:border-zinc-800
                                    hover:text-zinc-300
                                "
                            >
                                Last 24 hours

                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* Stats                                               */}
                    {/* ================================================== */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            icon={Activity}
                            label="Request rate"
                            value="28.6 req/s"
                            change="+12.4%"
                            positive
                        />

                        <MetricCard
                            icon={Clock3}
                            label="P95 latency"
                            value="384ms"
                            change="-8.7%"
                            positive
                        />

                        <MetricCard
                            icon={AlertTriangle}
                            label="Error rate"
                            value="0.42%"
                            change="-14.2%"
                            positive
                        />

                        <MetricCard
                            icon={Server}
                            label="Active services"
                            value="5"
                            change="1 degraded"
                            positive={false}
                        />
                    </div>

                    {/* ================================================== */}
                    {/* Charts                                               */}
                    {/* ================================================== */}

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <ChartCard
                            title="Request volume"
                            description="Requests per second"
                            value="28.6 req/s"
                            data={requestData}
                        />

                        <ChartCard
                            title="Response latency"
                            description="P95 latency"
                            value="384ms"
                            data={latencyData}
                        />
                    </div>

                    {/* ================================================== */}
                    {/* Service Health + Error Summary                       */}
                    {/* ================================================== */}

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

                        {/* Service Health */}
                        <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Service health
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Current status across your services
                                    </p>
                                </div>

                                <Link
                                    href="/dashboard/services"
                                    className="flex items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
                                >
                                    View all

                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="divide-y divide-zinc-900/70">
                                {services.map((service) => (
                                    <Link
                                        key={service.name}
                                        href={`/dashboard/services/${service.name}`}
                                        className="
                                            flex items-center gap-4
                                            px-5 py-4
                                            transition-colors
                                            hover:bg-zinc-900/20
                                        "
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                            <Server className="h-3.5 w-3.5 text-zinc-600" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-xs font-medium text-zinc-400">
                                                    {service.name}
                                                </p>

                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        service.status ===
                                                        "Healthy"
                                                            ? "bg-emerald-500"
                                                            : "bg-amber-500"
                                                    }`}
                                                />
                                            </div>

                                            <p className="mt-1 text-[10px] text-zinc-700">
                                                {service.requests} requests
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-mono text-xs text-zinc-500">
                                                {service.latency}
                                            </p>

                                            <p
                                                className={`mt-1 text-[10px] ${
                                                    service.status ===
                                                    "Healthy"
                                                        ? "text-emerald-600"
                                                        : "text-amber-500"
                                                }`}
                                            >
                                                {service.status}
                                            </p>
                                        </div>

                                        <ArrowRight className="h-3.5 w-3.5 text-zinc-800" />
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Error Summary */}
                        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="border-b border-zinc-900 px-5 py-4">
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Error summary
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Recent application errors
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-semibold tracking-tight text-zinc-100">
                                            0.42%
                                        </p>

                                        <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-500">
                                            <ArrowDownRight className="h-3 w-3" />

                                            14.2% lower
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                        <TriangleAlert className="h-4 w-4 text-zinc-600" />
                                    </div>
                                </div>

                                <div className="mt-7 space-y-4">
                                    <ErrorRow
                                        endpoint="POST /auth/login"
                                        count="42"
                                        percentage="48%"
                                    />

                                    <ErrorRow
                                        endpoint="POST /v1/traces"
                                        count="27"
                                        percentage="31%"
                                    />

                                    <ErrorRow
                                        endpoint="GET /projects/:id"
                                        count="12"
                                        percentage="14%"
                                    />

                                    <ErrorRow
                                        endpoint="Other"
                                        count="6"
                                        percentage="7%"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ================================================== */}
                    {/* Recent Traces                                       */}
                    {/* ================================================== */}

                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Recent traces
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Latest requests captured by OpenTelemetry
                                </p>
                            </div>

                            <Link
                                href="/dashboard/traces"
                                className="
                                    flex items-center gap-1
                                    text-[11px] text-zinc-600
                                    transition-colors
                                    hover:text-zinc-300
                                "
                            >
                                View all

                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        <ResponsiveDataTable
                            data={recentTraces}
                            columns={recentTraceColumns}
                            rowKey={(trace) => trace.id}
                            onRowClick={(trace) => {
                                window.location.href =
                                    `/dashboard/traces?trace=${trace.id}`;
                            }}
                        />
                    </section>

                    {/* ================================================== */}
                    {/* Bottom Cards                                        */}
                    {/* ================================================== */}

                    <div className="mt-6 grid gap-6 md:grid-cols-2">

                        {/* Database */}
                        <Link
                            href="/dashboard/connections"
                            className="
                                group
                                rounded-xl
                                border border-zinc-900
                                bg-zinc-950
                                p-5
                                transition-colors
                                hover:border-zinc-800
                            "
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                    <Database className="h-4 w-4 text-zinc-600" />
                                </div>

                                <ArrowUpRight className="h-4 w-4 text-zinc-800 transition-colors group-hover:text-zinc-500" />
                            </div>

                            <h3 className="mt-5 text-sm font-medium text-zinc-300">
                                Database connections
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-zinc-700">
                                2 PostgreSQL databases connected to your
                                workspace.
                            </p>
                        </Link>

                        {/* Instrumentation */}
                        <Link
                            href="/dashboard/connections/instrumentation"
                            className="
                                group
                                rounded-xl
                                border border-zinc-900
                                bg-zinc-950
                                p-5
                                transition-colors
                                hover:border-zinc-800
                            "
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                    <BarChart3 className="h-4 w-4 text-zinc-600" />
                                </div>

                                <ArrowUpRight className="h-4 w-4 text-zinc-800 transition-colors group-hover:text-zinc-500" />
                            </div>

                            <h3 className="mt-5 text-sm font-medium text-zinc-300">
                                OpenTelemetry setup
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-zinc-700">
                                Configure your application to start sending
                                telemetry to Uptrace.
                            </p>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ========================================================================== */
/* Metric Card                                                                */
/* ========================================================================== */

function MetricCard({
    icon: Icon,
    label,
    value,
    change,
    positive,
}: {
    icon: typeof Activity;
    label: string;
    value: string;
    change: string;
    positive: boolean;
}) {
    return (
        <div
            className="
                group
                rounded-xl
                border border-zinc-900
                bg-zinc-950
                p-5
                transition-colors
                hover:border-zinc-800
            "
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">
                    {label}
                </p>

                <div
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        border border-zinc-900
                        bg-black
                        text-zinc-700
                        transition-colors
                        group-hover:text-zinc-500
                    "
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100">
                {value}
            </p>

            <div className="mt-1 flex items-center gap-1 text-[11px]">
                {positive ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}

                <span
                    className={
                        positive
                            ? "text-emerald-500"
                            : "text-amber-500"
                    }
                >
                    {change}
                </span>

                <span className="text-zinc-800">
                    from previous period
                </span>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Chart Card                                                                 */
/* ========================================================================== */

function ChartCard({
    title,
    description,
    value,
    data,
}: {
    title: string;
    description: string;
    value: string;
    data: number[];
}) {
    const max = Math.max(...data);

    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-200">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-700">
                        {description}
                    </p>
                </div>

                <span className="font-mono text-xs text-zinc-500">
                    {value}
                </span>
            </div>

            <div className="p-5">
                <div className="relative h-56">
                    {/* Grid */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {[0, 1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="border-t border-zinc-900"
                            />
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-[3px] px-1">
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="group relative flex h-full flex-1 items-end"
                            >
                                <div
                                    className="
                                        w-full
                                        rounded-t-[2px]
                                        bg-zinc-800
                                        transition-all
                                        duration-200
                                        group-hover:bg-zinc-600
                                    "
                                    style={{
                                        height: `${(item / max) * 100}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-zinc-800">
                    <span>24h ago</span>
                    <span>18h</span>
                    <span>12h</span>
                    <span>6h</span>
                    <span>Now</span>
                </div>
            </div>
        </section>
    );
}

/* ========================================================================== */
/* Error Row                                                                  */
/* ========================================================================== */

function ErrorRow({
    endpoint,
    count,
    percentage,
}: {
    endpoint: string;
    count: string;
    percentage: string;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="truncate font-mono text-[11px] text-zinc-600">
                    {endpoint}
                </span>

                <span className="shrink-0 font-mono text-[10px] text-zinc-700">
                    {count} · {percentage}
                </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                    className="h-full rounded-full bg-zinc-700 transition-all"
                    style={{
                        width: percentage,
                    }}
                />
            </div>
        </div>
    );
}