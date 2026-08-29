"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    CircleAlert,
    Database,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Server,
    ShieldCheck,
    Wifi,
} from "lucide-react";

import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";

export default function NewConnectionPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState<
        "success" | "error" | null
    >(null);

    const [form, setForm] = useState({
        name: "",
        host: "",
        port: "5432",
        database: "",
        username: "",
        password: "",
        ssl: true,
    });

    function updateField(
        field: keyof typeof form,
        value: string | boolean,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setTestResult(null);
    }

    async function handleTestConnection() {
        setTesting(true);
        setTestResult(null);

        /*
         * TODO:
         * Connect this to your existing backend connection API.
         *
         * Example:
         *
         * await fetch(`${API_URL}/connections/test`, {
         *     method: "POST",
         *     headers: {
         *         "Content-Type": "application/json",
         *         Authorization: `Bearer ${token}`,
         *     },
         *     body: JSON.stringify(form),
         * });
         */

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setTesting(false);
        setTestResult("success");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);

        /*
         * TODO:
         * Replace this with your actual connection creation API.
         */

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSaving(false);
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Sidebar />

            <Topbar />

            <main className="lg:ml-64">
                <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

                    {/* Back */}
                    <Link
                        href="/dashboard/connections"
                        className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to connections
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950">
                            <Database className="h-4 w-4 text-zinc-500" />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                            Add PostgreSQL connection
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                            Connect a PostgreSQL database to your Uptrace
                            workspace. We will verify the connection before
                            saving it.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

                            {/* Form */}
                            <div className="space-y-6">

                                {/* General */}
                                <section className="rounded-xl border border-zinc-900 bg-zinc-950">
                                    <div className="border-b border-zinc-900 px-5 py-4">
                                        <h2 className="text-sm font-semibold text-zinc-200">
                                            Connection details
                                        </h2>

                                        <p className="mt-1 text-xs text-zinc-700">
                                            Basic information about this
                                            connection.
                                        </p>
                                    </div>

                                    <div className="space-y-5 p-5">
                                        <Field
                                            label="Connection name"
                                            required
                                        >
                                            <input
                                                value={form.name}
                                                onChange={(event) =>
                                                    updateField(
                                                        "name",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Production PostgreSQL"
                                                className={inputClass}
                                            />
                                        </Field>

                                        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                                            <Field
                                                label="Host"
                                                required
                                            >
                                                <div className="relative">
                                                    <Server className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                                                    <input
                                                        value={form.host}
                                                        onChange={(event) =>
                                                            updateField(
                                                                "host",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="db.example.com"
                                                        className={`${inputClass} pl-10`}
                                                    />
                                                </div>
                                            </Field>

                                            <Field
                                                label="Port"
                                                required
                                            >
                                                <input
                                                    value={form.port}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "port",
                                                            event.target.value,
                                                        )
                                                    }
                                                    inputMode="numeric"
                                                    placeholder="5432"
                                                    className={inputClass}
                                                />
                                            </Field>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <Field
                                                label="Database"
                                                required
                                            >
                                                <input
                                                    value={form.database}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "database",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="uptrace"
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <Field
                                                label="Username"
                                                required
                                            >
                                                <input
                                                    value={form.username}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "username",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="postgres"
                                                    className={inputClass}
                                                />
                                            </Field>
                                        </div>

                                        <Field
                                            label="Password"
                                            required
                                        >
                                            <div className="relative">
                                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700" />

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={form.password}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "password",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="••••••••••••"
                                                    className={`${inputClass} pl-10 pr-10`}
                                                />

                                                <button
                                                    type="button"
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (current) =>
                                                                !current,
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </Field>

                                        {/* SSL */}
                                        <div className="flex items-start justify-between gap-4 rounded-lg border border-zinc-900 bg-black p-4">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-300">
                                                    SSL / TLS
                                                </p>

                                                <p className="mt-1 text-[11px] leading-5 text-zinc-700">
                                                    Encrypt the connection to
                                                    your PostgreSQL server.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={form.ssl}
                                                onClick={() =>
                                                    updateField(
                                                        "ssl",
                                                        !form.ssl,
                                                    )
                                                }
                                                className={`
                                                    relative h-5 w-9 shrink-0
                                                    rounded-full
                                                    transition-colors
                                                    ${
                                                        form.ssl
                                                            ? "bg-zinc-300"
                                                            : "bg-zinc-800"
                                                    }
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        absolute top-0.5
                                                        h-4 w-4 rounded-full
                                                        transition-transform
                                                        ${
                                                            form.ssl
                                                                ? "translate-x-4 bg-black"
                                                                : "translate-x-0.5 bg-zinc-500"
                                                        }
                                                    `}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {/* Connection string */}
                                <section className="rounded-xl border border-zinc-900 bg-zinc-950">
                                    <div className="border-b border-zinc-900 px-5 py-4">
                                        <h2 className="text-sm font-semibold text-zinc-200">
                                            Connection string
                                        </h2>

                                        <p className="mt-1 text-xs text-zinc-700">
                                            Alternatively, you can use a
                                            PostgreSQL connection URI.
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <input
                                            placeholder="postgresql://user:password@host:5432/database"
                                            className={inputClass}
                                        />

                                        <p className="mt-2 text-[10px] leading-5 text-zinc-800">
                                            Credentials are transmitted
                                            securely and are never displayed
                                            after the connection is saved.
                                        </p>
                                    </div>
                                </section>

                                {/* Result */}
                                {testResult && (
                                    <div
                                        className={`
                                            flex items-start gap-3 rounded-xl
                                            border p-4
                                            ${
                                                testResult === "success"
                                                    ? "border-emerald-500/10 bg-emerald-500/5"
                                                    : "border-red-500/10 bg-red-500/5"
                                            }
                                        `}
                                    >
                                        {testResult === "success" ? (
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                        ) : (
                                            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                        )}

                                        <div>
                                            <p
                                                className={`text-xs font-medium ${
                                                    testResult === "success"
                                                        ? "text-emerald-500"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {testResult === "success"
                                                    ? "Connection successful"
                                                    : "Connection failed"}
                                            </p>

                                            <p className="mt-1 text-[11px] text-zinc-600">
                                                {testResult === "success"
                                                    ? "The PostgreSQL server accepted the connection."
                                                    : "Unable to connect to the PostgreSQL server. Check your credentials and network settings."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Link
                                        href="/dashboard/connections"
                                        className="flex h-10 items-center justify-center rounded-lg border border-zinc-900 px-4 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-950 hover:text-zinc-300"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleTestConnection}
                                        disabled={testing}
                                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {testing ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Testing...
                                            </>
                                        ) : (
                                            <>
                                                <Wifi className="h-3.5 w-3.5" />
                                                Test connection
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 text-xs font-medium text-zinc-950 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save connection"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Side information */}
                            <aside className="space-y-4">
                                <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                        <ShieldCheck className="h-4 w-4 text-zinc-500" />
                                    </div>

                                    <h3 className="mt-4 text-sm font-medium text-zinc-300">
                                        Secure by default
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-zinc-700">
                                        Your database credentials are only used
                                        by the backend connection service.
                                    </p>

                                    <div className="mt-5 space-y-3">
                                        <SecurityRow text="TLS encrypted connection" />
                                        <SecurityRow text="Credentials never exposed in UI" />
                                        <SecurityRow text="Connection verified before saving" />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                        PostgreSQL
                                    </p>

                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900 bg-black">
                                            <Database className="h-4 w-4 text-zinc-600" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-zinc-400">
                                                PostgreSQL 14+
                                            </p>

                                            <p className="mt-1 text-[10px] text-zinc-700">
                                                Recommended
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-medium text-zinc-500">
                {label}
                {required && (
                    <span className="ml-1 text-zinc-700">*</span>
                )}
            </span>

            {children}
        </label>
    );
}

function SecurityRow({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="text-[11px] leading-4 text-zinc-600">
                {text}
            </span>
        </div>
    );
}

const inputClass = `
    h-10 w-full
    rounded-lg
    border border-zinc-900
    bg-black
    px-3
    text-sm text-zinc-300
    outline-none
    placeholder:text-zinc-800
    transition-colors
    focus:border-zinc-700
    focus:ring-1
    focus:ring-zinc-800
`;