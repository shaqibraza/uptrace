"use client";

import Link from "next/link";
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Database,
    ExternalLink,
    GitBranch,
    Server,
    Timer,
    TriangleAlert,
} from "lucide-react";

import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../../components/ResponsiveDataTable";

type Endpoint = {
    name: string;
    requests: string;
    latency: string;
    errors: string;
    trend: string;
};

type Trace = {
    id: string;
    operation: string;
    duration: string;
    status: "OK" | "Error";
    time: string;
};

type Dependency = {
    name: string;
    type: "Database" | "Cache" | "Service";
    latency: string;
    requests: string;
    status: "Healthy" | "Degraded";
};

const requestData = [
    42, 48, 45, 52, 49, 58, 63, 59, 67, 61,
    72, 68, 76, 71, 82, 78, 88, 81, 91, 86,
    95, 89, 101, 96, 108, 102, 111, 106, 116, 109,
];

const latencyData = [
    82, 91, 87, 96, 104, 92, 111, 105, 119, 108,
    127, 116, 134, 122, 141, 131, 148, 136, 153, 143,
    161, 149, 171, 158, 176, 164, 182, 169, 177, 162,
];

const errorData = [
    2, 3, 2, 4, 3, 5, 4, 3, 6, 5,
    4, 7, 5, 6, 8, 5, 7, 6, 9, 7,
    6, 8, 5, 7, 6, 5, 4, 5, 3, 4,
];

const endpoints: Endpoint[] = [
    {
        name: "GET /projects",
        requests: "342K",
        latency: "84ms",
        errors: "0.08%",
        trend: "+4.2%",
    },
    {
        name: "GET /projects/:id",
        requests: "281K",
        latency: "112ms",
        errors: "0.14%",
        trend: "+8.1%",
    },
    {
        name: "POST /v1/traces",
        requests: "192K",
        latency: "391ms",
        errors: "0.82%",
        trend: "-3.4%",
    },
    {
        name: "GET /dashboard",
        requests: "143K",
        latency: "76ms",
        errors: "0.04%",
        trend: "+2.7%",
    },
    {
        name: "GET /organizations",
        requests: "91K",
        latency: "64ms",
        errors: "0.02%",
        trend: "+1.3%",
    },
];

const traces: Trace[] = [
    {
        id: "trace-001",
        operation: "GET /projects",
        duration: "84ms",
        status: "OK",
        time: "12 sec ago",
    },
    {
        id: "trace-002",
        operation: "POST /v1/traces",
        duration: "391ms",
        status: "OK",
        time: "28 sec ago",
    },
    {
        id: "trace-003",
        operation: "GET /projects/:id",
        duration: "112ms",
        status: "OK",
        time: "41 sec ago",
    },
    {
        id: "trace-004",
        operation: "POST /v1/traces",
        duration: "642ms",
        status: "Error",
        time: "1 min ago",
    },
    {
        id: "trace-005",
        operation: "GET /dashboard",
        duration: "76ms",
        status: "OK",
        time: "2 min ago",
    },
];

const dependencies: Dependency[] = [
    {
        name: "postgres",
        type: "Database",
        latency: "18ms",
        requests: "1.2K/s",
        status: "Healthy",
    },
    {
        name: "redis",
        type: "Cache",
        latency: "4ms",
        requests: "846/s",
        status: "Healthy",
    },
    {
        name: "auth-service",
        type: "Service",
        latency: "218ms",
        requests: "3.1/s",
        status: "Degraded",
    },
];

const endpointColumns: ResponsiveColumn<Endpoint>[] = [
    {
        key: "endpoint",
        header: "Endpoint",
        mobileLabel: "Endpoint",
        render: (endpoint) => (
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                    <GitBranch className="h-3.5 w-3.5 text-zinc-700" />
                </div>

                <span className="truncate font-mono text-xs text-zinc-400">
                    {endpoint.name}
                </span>
            </div>
        ),
    },
    {
        key: "requests",
        header: "Requests",
        render: (endpoint) => (
            <span className="font-mono text-xs text-zinc-600">
                {endpoint.requests}
            </span>
        ),
    },
    {
        key: "latency",
        header: "Latency",
        render: (endpoint) => (
            <span className="font-mono text-xs text-zinc-600">
                {endpoint.latency}
            </span>
        ),
    },
    {
        key: "errors",
        header: "Errors",
        render: (endpoint) => (
            <span
                className={`font-mono text-xs ${
                    endpoint.errors === "0.82%"
                        ? "text-amber-500"
                        : "text-zinc-600"
                }`}
            >
                {endpoint.errors}
            </span>
        ),
    },
    {
        key: "trend",
        header: "Trend",
        render: (endpoint) => {
            const positive =
                endpoint.trend.startsWith("+");

            return (
                <span
                    className={`flex items-center gap-1 text-[11px] ${
                        positive
                            ? "text-emerald-500"
                            : "text-red-400"
                    }`}
                >
                    {positive ? (
                        <ArrowUpRight className="h-3 w-3" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3" />
                    )}

                    {endpoint.trend}
                </span>
            );
        },
    },
];

export default function ServiceDetailPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* Back */}
                    <Link
                        href="/dashboard/services"
                        className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />

                        Back to services
                    </Link>

                    {/* Service header */}
                    <div className="mb-7">
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950">
                                    <Server className="h-5 w-5 text-zinc-500" />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                            uptrace-api
                                        </h1>

                                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/10 bg-emerald-500/5 px-2 py-1 text-[10px] text-emerald-500">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                            Healthy
                                        </span>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-700">
                                        <span>production</span>
                                        <span>3 instances</span>
                                        <span>Node.js</span>
                                        <span>v20.11.0</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                >
                                    Last 24 hours

                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>

                                <Link
                                    href="/dashboard/traces"
                                    className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />

                                    Open traces
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Metrics */}
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
                            icon={TriangleAlert}
                            label="Error rate"
                            value="0.12%"
                            change="-18.2%"
                            positive
                        />

                        <MetricCard
                            icon={Server}
                            label="Instances"
                            value="3"
                            change="All healthy"
                            positive
                        />
                    </div>

                    {/* Main charts */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <ChartCard
                            title="Request rate"
                            subtitle="Requests per second"
                            value="28.6 req/s"
                            data={requestData}
                        />

                        <ChartCard
                            title="Latency"
                            subtitle="P95 response time"
                            value="384ms"
                            data={latencyData}
                        />
                    </div>

                    {/* Error chart */}
                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Error rate
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Errors over the selected period
                                </p>
                            </div>

                            <span className="font-mono text-xs text-zinc-500">
                                0.12%
                            </span>
                        </div>

                        <div className="p-5">
                            <MiniLineChart data={errorData} />

                            <ChartLabels />
                        </div>
                    </section>

                    {/* Endpoints + dependencies */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
                        {/* Endpoints */}
                        <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Endpoints
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        Top operations for this service
                                    </p>
                                </div>

                                <GitBranch className="h-4 w-4 text-zinc-700" />
                            </div>

                            <ResponsiveDataTable
                                data={endpoints}
                                columns={endpointColumns}
                                rowKey={(endpoint) =>
                                    endpoint.name
                                }
                            />
                        </section>

                        {/* Dependencies */}
                        <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                            <div className="border-b border-zinc-900 px-5 py-4">
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Dependencies
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Services and resources this service calls
                                </p>
                            </div>

                            <div className="divide-y divide-zinc-900/70">
                                {dependencies.map(
                                    (dependency) => (
                                        <DependencyItem
                                            key={
                                                dependency.name
                                            }
                                            dependency={
                                                dependency
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Recent traces */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Recent traces
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Latest traces generated by this service
                                </p>
                            </div>

                            <Link
                                href="/dashboard/traces"
                                className="flex items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-300"
                            >
                                View all

                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="divide-y divide-zinc-900/70">
                            {traces.map((trace) => (
                                <Link
                                    key={trace.id}
                                    href="/dashboard/traces"
                                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-zinc-900/20 sm:flex-row sm:items-center"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                        {trace.status ===
                                        "OK" ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-mono text-xs text-zinc-400">
                                            {trace.operation}
                                        </p>

                                        <p className="mt-1 text-[10px] text-zinc-800">
                                            Trace captured by uptrace-api
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                        <span className="font-mono text-xs text-zinc-600">
                                            {trace.duration}
                                        </span>

                                        <span
                                            className={`text-[10px] ${
                                                trace.status ===
                                                "OK"
                                                    ? "text-emerald-600"
                                                    : "text-red-400"
                                            }`}
                                        >
                                            {trace.status}
                                        </span>

                                        <span className="text-[10px] text-zinc-800">
                                            {trace.time}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Instances */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Instances
                            </h2>

                            <p className="mt-1 text-xs text-zinc-700">
                                Active instances running this service
                            </p>
                        </div>

                        <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 xl:grid-cols-3">
                            <Instance
                                id="uptrace-api-7f8c9"
                                region="ap-south-1"
                                uptime="14d 8h"
                                cpu="21%"
                                memory="384MB"
                            />

                            <Instance
                                id="uptrace-api-4a2d1"
                                region="ap-south-1"
                                uptime="9d 17h"
                                cpu="18%"
                                memory="361MB"
                            />

                            <Instance
                                id="uptrace-api-91bc4"
                                region="ap-south-1"
                                uptime="6d 3h"
                                cpu="24%"
                                memory="412MB"
                            />
                        </div>
                    </section>

                    <div className="mt-6 flex items-center gap-2 text-[10px] text-zinc-800">
                        <Timer className="h-3 w-3" />

                        Data shown for the selected 24-hour period
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

            <div className="mt-1 flex items-center gap-1 text-[10px]">
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
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Chart Card                                                                 */
/* ========================================================================== */

function ChartCard({
    title,
    subtitle,
    value,
    data,
}: {
    title: string;
    subtitle: string;
    value: string;
    data: number[];
}) {
    const max = Math.max(...data);

    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex flex-col gap-2 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-200">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-700">
                        {subtitle}
                    </p>
                </div>

                <span className="font-mono text-xs text-zinc-500">
                    {value}
                </span>
            </div>

            <div className="p-5">
                <div className="relative h-56">
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {[0, 1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="border-t border-zinc-900"
                                />
                            ),
                        )}
                    </div>

                    <div className="absolute inset-0 flex items-end gap-[3px] px-1">
                        {data.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="group relative flex h-full flex-1 items-end"
                                >
                                    <div
                                        className="w-full rounded-t-[2px] bg-zinc-800 transition-colors group-hover:bg-zinc-600"
                                        style={{
                                            height: `${
                                                (item /
                                                    max) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <ChartLabels />
            </div>
        </section>
    );
}

/* ========================================================================== */
/* Mini Chart                                                                 */
/* ========================================================================== */

function MiniLineChart({
    data,
}: {
    data: number[];
}) {
    const max = Math.max(...data);

    return (
        <div className="relative h-52">
            <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map(
                    (item) => (
                        <div
                            key={item}
                            className="border-t border-zinc-900"
                        />
                    ),
                )}
            </div>

            <div className="absolute inset-0 flex items-end gap-[3px] px-1">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex h-full flex-1 items-end"
                    >
                        <div
                            className="w-full rounded-t-[2px] bg-zinc-800"
                            style={{
                                height: `${
                                    (item / max) *
                                    100
                                }%`,
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Chart Labels                                                               */
/* ========================================================================== */

function ChartLabels() {
    return (
        <div className="mt-3 flex justify-between text-[10px] text-zinc-800">
            <span>24h ago</span>
            <span>18h</span>
            <span>12h</span>
            <span>6h</span>
            <span>Now</span>
        </div>
    );
}

/* ========================================================================== */
/* Dependency Item                                                            */
/* ========================================================================== */

function DependencyItem({
    dependency,
}: {
    dependency: Dependency;
}) {
    const isHealthy =
        dependency.status === "Healthy";

    return (
        <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                {dependency.type === "Database" ? (
                    <Database className="h-3.5 w-3.5 text-zinc-600" />
                ) : (
                    <Server className="h-3.5 w-3.5 text-zinc-600" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-400">
                    {dependency.name}
                </p>

                <p className="mt-1 text-[10px] text-zinc-800">
                    {dependency.requests}
                </p>
            </div>

            <div className="text-right">
                <p className="font-mono text-[11px] text-zinc-600">
                    {dependency.latency}
                </p>

                <p
                    className={`mt-1 text-[10px] ${
                        isHealthy
                            ? "text-emerald-600"
                            : "text-amber-500"
                    }`}
                >
                    {dependency.status}
                </p>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Instance                                                                   */
/* ========================================================================== */

function Instance({
    id,
    region,
    uptime,
    cpu,
    memory,
}: {
    id: string;
    region: string;
    uptime: string;
    cpu: string;
    memory: string;
}) {
    return (
        <div className="bg-zinc-950 p-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                    <span className="truncate font-mono text-[11px] text-zinc-500">
                        {id}
                    </span>
                </div>

                <span className="shrink-0 text-[10px] text-emerald-600">
                    Healthy
                </span>
            </div>

            <div className="mt-4 space-y-2">
                <InfoRow
                    label="Region"
                    value={region}
                />

                <InfoRow
                    label="Uptime"
                    value={uptime}
                />

                <InfoRow
                    label="CPU"
                    value={cpu}
                />

                <InfoRow
                    label="Memory"
                    value={memory}
                />
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Info Row                                                                   */
/* ========================================================================== */

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-zinc-800">
                {label}
            </span>

            <span className="font-mono text-right text-[10px] text-zinc-600">
                {value}
            </span>
        </div>
    );
}