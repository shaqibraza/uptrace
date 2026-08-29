import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Copy,
    Database,
    ExternalLink,
    Globe,
    Server,
    TriangleAlert,
} from "lucide-react";

import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";

const spans = [
    {
        id: "span-01",
        service: "web",
        operation: "GET /dashboard",
        duration: 242,
        start: 0,
        width: 100,
        depth: 0,
        status: "OK",
        type: "http",
    },
    {
        id: "span-02",
        service: "uptrace-api",
        operation: "GET /projects",
        duration: 178,
        start: 12,
        width: 73,
        depth: 1,
        status: "OK",
        type: "http",
    },
    {
        id: "span-03",
        service: "database",
        operation: "SELECT projects",
        duration: 92,
        start: 31,
        width: 38,
        depth: 2,
        status: "OK",
        type: "database",
    },
    {
        id: "span-04",
        service: "uptrace-api",
        operation: "GET /projects/:id/traces",
        duration: 142,
        start: 92,
        width: 59,
        depth: 1,
        status: "OK",
        type: "http",
    },
    {
        id: "span-05",
        service: "database",
        operation: "SELECT traces",
        duration: 81,
        start: 108,
        width: 34,
        depth: 2,
        status: "OK",
        type: "database",
    },
    {
        id: "span-06",
        service: "uptrace-api",
        operation: "serialize.response",
        duration: 38,
        start: 178,
        width: 16,
        depth: 1,
        status: "OK",
        type: "internal",
    },
];

function SpanIcon({
    type,
}: {
    type: string;
}) {
    if (type === "database") {
        return <Database className="h-3.5 w-3.5" />;
    }

    if (type === "http") {
        return <Globe className="h-3.5 w-3.5" />;
    }

    return <Server className="h-3.5 w-3.5" />;
}

export default async function TraceDetailPage({
    params,
}: {
    params: Promise<{ traceId: string }>;
}) {
    const { traceId } = await params;

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <div className="mb-5 flex items-center gap-2 text-xs text-zinc-700">
                        <Link
                            href="/dashboard"
                            className="transition-colors hover:text-zinc-300"
                        >
                            Dashboard
                        </Link>

                        <span>/</span>

                        <Link
                            href="/dashboard/traces"
                            className="transition-colors hover:text-zinc-300"
                        >
                            Traces
                        </Link>

                        <span>/</span>

                        <span className="font-mono text-zinc-500">
                            {traceId.slice(0, 12)}...
                        </span>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <Link
                                href="/dashboard/traces"
                                className="mb-3 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to traces
                            </Link>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                                    GET /dashboard
                                </h1>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                    OK
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600">
                                <span className="flex items-center gap-1.5">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    242ms
                                </span>

                                <span>
                                    6 spans
                                </span>

                                <span>
                                    service:{" "}
                                    <span className="text-zinc-400">
                                        web
                                    </span>
                                </span>

                                <button
                                    type="button"
                                    className="group flex items-center gap-1.5 font-mono transition-colors hover:text-zinc-300"
                                >
                                    {traceId.slice(0, 24)}...
                                    <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Share
                            </button>

                            <button
                                type="button"
                                className="flex h-9 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-zinc-500 transition-colors hover:border-zinc-800 hover:text-zinc-300"
                            >
                                More
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            label="Duration"
                            value="242ms"
                            detail="Total trace duration"
                        />

                        <SummaryCard
                            label="Spans"
                            value="6"
                            detail="Across 3 services"
                        />

                        <SummaryCard
                            label="Root service"
                            value="web"
                            detail="GET /dashboard"
                        />

                        <SummaryCard
                            label="Status"
                            value="Success"
                            detail="No errors detected"
                            success
                        />
                    </div>

                    {/* Waterfall */}
                    <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="flex flex-col gap-3 border-b border-zinc-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-200">
                                    Trace waterfall
                                </h2>

                                <p className="mt-1 text-xs text-zinc-700">
                                    Span execution timeline
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] text-zinc-700">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Success
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    Error
                                </span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[850px]">

                                {/* Time scale */}
                                <div className="grid grid-cols-[320px_1fr] border-b border-zinc-900">
                                    <div className="px-5 py-3 text-[10px] uppercase tracking-wider text-zinc-700">
                                        Span
                                    </div>

                                    <div className="relative py-3">
                                        <div className="absolute inset-y-0 left-[12%] border-l border-zinc-900" />
                                        <div className="absolute inset-y-0 left-[37%] border-l border-zinc-900" />
                                        <div className="absolute inset-y-0 left-[62%] border-l border-zinc-900" />
                                        <div className="absolute inset-y-0 left-[87%] border-l border-zinc-900" />

                                        <div className="relative flex justify-between pr-5 text-[10px] font-mono text-zinc-700">
                                            <span>0ms</span>
                                            <span>60ms</span>
                                            <span>120ms</span>
                                            <span>180ms</span>
                                            <span>242ms</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Spans */}
                                {spans.map((span) => (
                                    <div
                                        key={span.id}
                                        className="grid grid-cols-[320px_1fr] border-b border-zinc-900/70 last:border-0 hover:bg-zinc-900/20"
                                    >
                                        {/* Span info */}
                                        <div
                                            className="flex min-w-0 items-center gap-2 px-5 py-4"
                                            style={{
                                                paddingLeft: `${20 + span.depth * 20}px`,
                                            }}
                                        >
                                            <SpanIcon type={span.type} />

                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-medium text-zinc-300">
                                                    {span.operation}
                                                </p>

                                                <p className="mt-1 text-[10px] text-zinc-700">
                                                    {span.service}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="relative flex items-center py-4">
                                            <div className="absolute inset-0">
                                                <div className="absolute inset-y-0 left-[12%] border-l border-zinc-900" />
                                                <div className="absolute inset-y-0 left-[37%] border-l border-zinc-900" />
                                                <div className="absolute inset-y-0 left-[62%] border-l border-zinc-900" />
                                                <div className="absolute inset-y-0 left-[87%] border-l border-zinc-900" />
                                            </div>

                                            <div
                                                className={`
                                                    relative z-10
                                                    h-6
                                                    rounded-md
                                                    border
                                                    ${
                                                        span.status === "OK"
                                                            ? "border-emerald-500/20 bg-emerald-500/10"
                                                            : "border-red-500/20 bg-red-500/10"
                                                    }
                                                `}
                                                style={{
                                                    marginLeft: `${span.start / 2.42}%`,
                                                    width: `${span.width}%`,
                                                }}
                                            >
                                                <div className="flex h-full items-center px-2">
                                                    <span className="truncate text-[9px] font-mono text-zinc-500">
                                                        {span.duration}ms
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Span details */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <h2 className="text-sm font-semibold text-zinc-200">
                                Trace information
                            </h2>

                            <p className="mt-1 text-xs text-zinc-700">
                                Metadata and attributes for this trace
                            </p>
                        </div>

                        <div className="grid divide-y divide-zinc-900/70 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div className="p-5">
                                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                    Trace metadata
                                </p>

                                <div className="space-y-4">
                                    <InfoRow
                                        label="Trace ID"
                                        value={traceId}
                                        mono
                                    />

                                    <InfoRow
                                        label="Service"
                                        value="web"
                                    />

                                    <InfoRow
                                        label="Operation"
                                        value="GET /dashboard"
                                        mono
                                    />

                                    <InfoRow
                                        label="Environment"
                                        value="production"
                                    />
                                </div>
                            </div>

                            <div className="p-5">
                                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                    HTTP attributes
                                </p>

                                <div className="space-y-4">
                                    <InfoRow
                                        label="HTTP method"
                                        value="GET"
                                        mono
                                    />

                                    <InfoRow
                                        label="Status code"
                                        value="200"
                                        mono
                                    />

                                    <InfoRow
                                        label="Route"
                                        value="/dashboard"
                                        mono
                                    />

                                    <InfoRow
                                        label="User agent"
                                        value="Chrome"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    detail,
    success = false,
}: {
    label: string;
    value: string;
    detail: string;
    success?: boolean;
}) {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                {label}
            </p>

            <p
                className={`mt-3 text-lg font-semibold ${
                    success ? "text-emerald-500" : "text-zinc-200"
                }`}
            >
                {value}
            </p>

            <p className="mt-1 text-[11px] text-zinc-700">
                {detail}
            </p>
        </div>
    );
}

function InfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-5">
            <span className="shrink-0 text-xs text-zinc-600">
                {label}
            </span>

            <span
                className={`
                    max-w-[70%]
                    truncate
                    text-right
                    text-xs
                    text-zinc-400
                    ${mono ? "font-mono" : ""}
                `}
            >
                {value}
            </span>
        </div>
    );
}