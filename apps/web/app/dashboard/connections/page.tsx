"use client";

import Link from "next/link";
import { useState } from "react";
import {
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Database,
    KeyRound,
    Lock,
    MoreHorizontal,
    Plus,
    Server,
    Settings2,
    ShieldCheck,
    Wifi,
} from "lucide-react";

import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from "../components/ResponsiveDataTable";

type ConnectionStatus =
    | "Connected"
    | "Disconnected"
    | "Checking";

type Connection = {
    id: string;
    name: string;
    type: string;
    host: string;
    database: string;
    status: ConnectionStatus;
    lastChecked: string;
};

const connections: Connection[] = [
    {
        id: "production-postgresql",
        name: "Production PostgreSQL",
        type: "PostgreSQL",
        host: "ep-example.neon.tech",
        database: "uptrace",
        status: "Connected",
        lastChecked: "2 min ago",
    },
    {
        id: "local-development",
        name: "Local Development",
        type: "PostgreSQL",
        host: "localhost:5432",
        database: "uptrace_dev",
        status: "Connected",
        lastChecked: "8 min ago",
    },
];

export default function ConnectionsPage() {
    const [selectedConnection, setSelectedConnection] =
        useState<Connection | null>(null);

    const columns: ResponsiveColumn<Connection>[] = [
        {
            key: "connection",
            header: "Connection",
            mobileLabel: "Connection",
            render: (connection) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                        <Database className="h-4 w-4 text-zinc-600" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-300">
                            {connection.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-700">
                                {connection.host}
                            </span>

                            <span className="rounded-md border border-zinc-900 bg-black px-1.5 py-0.5 text-[8px] text-zinc-700">
                                {connection.type}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "database",
            header: "Database",
            render: (connection) => (
                <span className="font-mono text-[11px] text-zinc-600">
                    {connection.database}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (connection) => (
                <ConnectionStatusBadge
                    status={connection.status}
                />
            ),
        },
        {
            key: "checked",
            header: "Last checked",
            render: (connection) => (
                <span className="text-[10px] text-zinc-700">
                    {connection.lastChecked}
                </span>
            ),
        },
        {
            key: "action",
            header: "",
            mobileLabel: "Actions",
            render: (connection) => (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        setSelectedConnection(
                            connection,
                        );
                    }}
                    aria-label={`Configure ${connection.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* ================================================== */}
                    {/* Header                                             */}
                    {/* ================================================== */}

                    <div className="mb-8">
                        <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600">
                            <Database className="h-3.5 w-3.5" />

                            <span>Configuration</span>

                            <span>/</span>

                            <span>Connections</span>
                        </div>

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                                    Connections
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
                                    Manage the databases connected to your
                                    Uptrace workspace.
                                </p>
                            </div>

                            <Link
                                href="/dashboard/connections/new"
                                className="
                                    inline-flex h-9
                                    items-center justify-center
                                    gap-2
                                    rounded-lg
                                    bg-zinc-100
                                    px-4
                                    text-xs font-medium
                                    text-zinc-950
                                    transition-colors
                                    hover:bg-white
                                "
                            >
                                <Plus className="h-3.5 w-3.5" />

                                Add connection
                            </Link>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* Overview                                            */}
                    {/* ================================================== */}

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <OverviewCard
                            icon={Database}
                            label="Connections"
                            value={String(
                                connections.length,
                            )}
                            detail="configured"
                        />

                        <OverviewCard
                            icon={CheckCircle2}
                            label="Connected"
                            value={String(
                                connections.filter(
                                    (item) =>
                                        item.status ===
                                        "Connected",
                                ).length,
                            )}
                            detail="healthy"
                            positive
                        />

                        <OverviewCard
                            icon={ShieldCheck}
                            label="Security"
                            value="Encrypted"
                            detail="credentials protected"
                        />
                    </div>

                    {/* ================================================== */}
                    {/* Connection list                                     */}
                    {/* ================================================== */}

                    <section className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
                        <div className="border-b border-zinc-900 px-5 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-200">
                                        Database connections
                                    </h2>

                                    <p className="mt-1 text-xs text-zinc-700">
                                        {connections.length} connections
                                        configured
                                    </p>
                                </div>

                                <Database className="h-4 w-4 text-zinc-700" />
                            </div>
                        </div>

                        <ResponsiveDataTable
                            data={connections}
                            columns={columns}
                            rowKey={(connection) =>
                                connection.id
                            }
                            onRowClick={(connection) =>
                                setSelectedConnection(
                                    connection,
                                )
                            }
                        />
                    </section>

                    {/* ================================================== */}
                    {/* Add connection                                     */}
                    {/* ================================================== */}

                    <section className="mt-6">
                        <Link
                            href="/dashboard/connections/new"
                            className="
                                group block
                                rounded-xl
                                border border-dashed
                                border-zinc-800
                                bg-zinc-950/50
                                p-6
                                transition-colors
                                hover:border-zinc-700
                                hover:bg-zinc-950
                            "
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <div
                                    className="
                                        flex h-10 w-10
                                        items-center justify-center
                                        rounded-xl
                                        border border-zinc-800
                                        bg-black
                                        text-zinc-600
                                        transition-colors
                                        group-hover:text-zinc-300
                                    "
                                >
                                    <Plus className="h-5 w-5" />
                                </div>

                                <h3 className="mt-4 text-sm font-medium text-zinc-300">
                                    Connect another database
                                </h3>

                                <p className="mt-1 max-w-md text-xs leading-5 text-zinc-700">
                                    Add a PostgreSQL connection to start
                                    exploring its telemetry and application
                                    data.
                                </p>
                            </div>
                        </Link>
                    </section>

                    {/* ================================================== */}
                    {/* Security                                            */}
                    {/* ================================================== */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                <ShieldCheck className="h-4 w-4 text-zinc-500" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-sm font-medium text-zinc-300">
                                    Connection security
                                </h3>

                                <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-700">
                                    Connection credentials are handled
                                    securely and are never exposed in the
                                    dashboard interface.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-4">
                                    <SecurityItem
                                        icon={Lock}
                                        label="Encrypted credentials"
                                    />

                                    <SecurityItem
                                        icon={KeyRound}
                                        label="Credential isolation"
                                    />

                                    <SecurityItem
                                        icon={Wifi}
                                        label="Connection verification"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================================================== */}
                    {/* OTel setup                                         */}
                    {/* ================================================== */}

                    <section className="mt-6 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                                <Server className="h-4 w-4 text-zinc-500" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-zinc-300">
                                    Need help sending telemetry?
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    Configure OpenTelemetry in your application
                                    and send traces to your Uptrace endpoint.
                                </p>
                            </div>

                            <Link
                                href="/dashboard/connections/instrumentation"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-medium
                                    text-zinc-500
                                    transition-colors
                                    hover:text-zinc-200
                                "
                            >
                                Setup instrumentation

                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </section>

                    {/* ================================================== */}
                    {/* Help                                                 */}
                    {/* ================================================== */}

                    <div className="mt-5 flex items-center gap-2 text-xs text-zinc-700">
                        <CircleHelp className="h-3.5 w-3.5" />

                        Need help connecting PostgreSQL?
                    </div>
                </div>
            </main>

            {/* ========================================================== */}
            {/* Connection action panel                                    */}
            {/* ========================================================== */}

            {selectedConnection && (
                <ConnectionPanel
                    connection={selectedConnection}
                    onClose={() =>
                        setSelectedConnection(null)
                    }
                />
            )}
        </div>
    );
}

/* ========================================================================== */
/* Overview Card                                                              */
/* ========================================================================== */

function OverviewCard({
    icon: Icon,
    label,
    value,
    detail,
    positive,
}: {
    icon: typeof Database;
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

            <p
                className={`mt-1 text-[10px] ${
                    positive
                        ? "text-emerald-500"
                        : "text-zinc-700"
                }`}
            >
                {detail}
            </p>
        </div>
    );
}

/* ========================================================================== */
/* Status Badge                                                               */
/* ========================================================================== */

function ConnectionStatusBadge({
    status,
}: {
    status: ConnectionStatus;
}) {
    const config: Record<
        ConnectionStatus,
        {
            text: string;
            dot: string;
            border: string;
        }
    > = {
        Connected: {
            text: "text-emerald-500",
            dot: "bg-emerald-500",
            border:
                "border-emerald-500/10 bg-emerald-500/5",
        },
        Disconnected: {
            text: "text-red-400",
            dot: "bg-red-400",
            border:
                "border-red-500/10 bg-red-500/5",
        },
        Checking: {
            text: "text-amber-500",
            dot: "bg-amber-500",
            border:
                "border-amber-500/10 bg-amber-500/5",
        },
    };

    const current = config[status];

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
                ${current.border}
                ${current.text}
            `}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${current.dot}`}
            />

            {status}
        </span>
    );
}

/* ========================================================================== */
/* Security Item                                                              */
/* ========================================================================== */

function SecurityItem({
    icon: Icon,
    label,
}: {
    icon: typeof Lock;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <Icon className="h-3.5 w-3.5 text-zinc-700" />

            {label}
        </div>
    );
}

/* ========================================================================== */
/* Connection Panel                                                           */
/* ========================================================================== */

function ConnectionPanel({
    connection,
    onClose,
}: {
    connection: Connection;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100]">
            <button
                type="button"
                aria-label="Close connection panel"
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-zinc-900 bg-zinc-950 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/95 px-5 py-4 backdrop-blur">
                    <div>
                        <p className="text-xs font-medium text-zinc-300">
                            Connection
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-700">
                            {connection.name}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="rounded-xl border border-zinc-900 bg-black p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950">
                                <Database className="h-4 w-4 text-zinc-500" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-zinc-300">
                                    {connection.name}
                                </p>

                                <p className="mt-1 text-[10px] text-zinc-700">
                                    {connection.type}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <ConnectionStatusBadge
                                status={
                                    connection.status
                                }
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-zinc-900">
                        <DetailRow
                            label="Host"
                            value={connection.host}
                        />

                        <DetailRow
                            label="Database"
                            value={connection.database}
                        />

                        <DetailRow
                            label="Type"
                            value={connection.type}
                        />

                        <DetailRow
                            label="Last checked"
                            value={connection.lastChecked}
                        />
                    </div>

                    <Link
                        href="/dashboard/connections/new"
                        className="
                            flex h-10
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            border border-zinc-800
                            bg-zinc-950
                            text-xs
                            font-medium
                            text-zinc-400
                            transition-colors
                            hover:bg-zinc-900
                            hover:text-zinc-200
                        "
                    >
                        <Settings2 className="h-3.5 w-3.5" />

                        Configure connection
                    </Link>

                    <div className="rounded-xl border border-zinc-900 bg-black p-4">
                        <div className="flex gap-3">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />

                            <div>
                                <p className="text-xs font-medium text-zinc-400">
                                    Secure connection
                                </p>

                                <p className="mt-1 text-[10px] leading-5 text-zinc-700">
                                    Credentials are isolated from the
                                    dashboard UI and handled securely.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

/* ========================================================================== */
/* Detail Row                                                                 */
/* ========================================================================== */

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-zinc-900 px-4 py-3 last:border-0">
            <span className="text-[10px] text-zinc-700">
                {label}
            </span>

            <span className="max-w-[220px] truncate text-right font-mono text-[10px] text-zinc-500">
                {value}
            </span>
        </div>
    );
}