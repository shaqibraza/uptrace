import Link from "next/link";
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Database,
    Gauge,
    Sparkles,
    Zap,
} from "lucide-react";
import { HeroBackground } from "./HeroBackground";

const highlights = [
    "OpenTelemetry native",
    "Distributed tracing",
    "Production ready",
];

export function Hero() {
    return (
        <section className="relative isolate overflow-hidden bg-white dark:bg-zinc-950">
            {/* Ambient background */}
            <HeroBackground />
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-40 dark:opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                        maskImage:
                            "linear-gradient(to bottom, black 0%, transparent 75%)",
                    }}
                />

                {/* Main glow */}
                <div className="absolute left-1/2 top-[-180px] h-[550px] w-[850px] -translate-x-1/2 rounded-full bg-zinc-200/60 blur-[120px] dark:bg-zinc-800/30" />

                {/* Side glows */}
                <div className="absolute left-[-250px] top-[300px] h-[400px] w-[400px] rounded-full bg-zinc-100 blur-[100px] dark:bg-zinc-900/40" />

                <div className="absolute right-[-250px] top-[350px] h-[400px] w-[400px] rounded-full bg-zinc-100 blur-[100px] dark:bg-zinc-900/40" />
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-32">
                {/* Hero copy */}
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="animate-fade-in-up mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>

                        Built for OpenTelemetry
                    </div>

                    {/* Heading */}
                    <h1 className="animate-fade-in-up-delay-1 text-balance text-5xl font-semibold tracking-[-0.055em] text-zinc-950 sm:text-6xl lg:text-[76px] lg:leading-[0.98] dark:text-zinc-50">
                        See what your
                        <span className="relative block">
                            <span className="relative z-10 bg-gradient-to-r from-zinc-950 via-zinc-600 to-zinc-950 bg-clip-text text-transparent dark:from-white dark:via-zinc-400 dark:to-white">
                                applications are really doing.
                            </span>

                            {/* subtle glow */}
                            <span className="absolute inset-0 -z-10 bg-zinc-400/20 blur-2xl dark:bg-zinc-500/10" />
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="animate-fade-in-up-delay-2 mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400">
                        Uptrace gives engineering teams a clear view of
                        application traces, services, and errors. Connect
                        your application with OpenTelemetry and investigate
                        production issues from one place.
                    </p>

                    {/* Actions */}
                    <div className="animate-fade-in-up-delay-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-950 px-6 text-sm font-medium text-white shadow-lg shadow-zinc-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl sm:w-auto dark:bg-white dark:text-zinc-950 dark:shadow-white/5 dark:hover:bg-zinc-200"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                            <span className="relative">
                                Start monitoring
                            </span>

                            <ArrowRight className="relative ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>

                        <Link
                            href="#how-it-works"
                            className="flex h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white/70 px-6 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:w-auto dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                            See how it works
                        </Link>
                    </div>

                    {/* Highlights */}
                    <div className="animate-fade-in-up-delay-4 mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                        {highlights.map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product scene */}
                <div className="relative mx-auto mt-20 max-w-6xl [perspective:1800px] sm:mt-24">
                    {/* Floating metric - left */}
                    <div className="animate-float-slow absolute -left-2 top-16 z-20 hidden w-48 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-2xl shadow-zinc-300/30 backdrop-blur-2xl sm:block lg:-left-10 lg:top-24 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:shadow-black/30">
                        <div className="flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                <Gauge className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                            </div>

                            <span className="text-[10px] font-medium text-emerald-500">
                                +12.4%
                            </span>
                        </div>

                        <div className="mt-3 text-xs text-zinc-500">
                            Request rate
                        </div>

                        <div className="mt-1 text-xl font-semibold tracking-tight">
                            2.8k
                            <span className="ml-1 text-xs font-normal text-zinc-400">
                                rpm
                            </span>
                        </div>

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div className="h-full w-[76%] rounded-full bg-zinc-700 dark:bg-zinc-300" />
                        </div>
                    </div>

                    {/* Floating status - right */}
                    <div className="animate-float absolute -right-2 top-28 z-20 hidden w-48 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-2xl shadow-zinc-300/30 backdrop-blur-2xl sm:block lg:-right-10 lg:top-40 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:shadow-black/30">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Activity className="h-4 w-4 text-emerald-500" />
                            </div>

                            <div>
                                <div className="text-xs font-medium">
                                    All systems
                                </div>

                                <div className="text-[10px] text-emerald-500">
                                    Operational
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-end gap-1">
                            {[35, 52, 42, 68, 55, 74, 61, 82, 69, 88].map(
                                (height, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 rounded-sm bg-zinc-300 dark:bg-zinc-700"
                                        style={{
                                            height: `${height / 2}px`,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    </div>

                    {/* Main 3D dashboard */}
                    <div className="animate-dashboard relative transform-gpu [transform:rotateX(5deg)_rotateY(-1deg)_rotateZ(0deg)] transition-transform duration-700 hover:[transform:rotateX(2deg)_rotateY(0deg)]">
                        {/* Outer glow */}
                        <div className="absolute -inset-6 rounded-[30px] bg-zinc-400/10 blur-3xl dark:bg-zinc-500/10" />

                        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
                            {/* Browser bar */}
                            <div className="flex h-11 items-center gap-2 border-b border-zinc-200/80 px-4 dark:border-zinc-800">
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />

                                <div className="ml-4 flex h-6 flex-1 items-center rounded-md border border-zinc-200/60 bg-zinc-100/80 px-3 dark:border-zinc-800 dark:bg-zinc-800/60">
                                    <span className="text-[10px] text-zinc-400">
                                        app.uptrace.local/dashboard
                                    </span>
                                </div>
                            </div>

                            {/* Dashboard */}
                            <div className="grid min-h-[420px] grid-cols-[170px_1fr] sm:grid-cols-[190px_1fr]">
                                {/* Sidebar */}
                                <div className="border-r border-zinc-200/80 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/30">
                                    <div className="mb-8 flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-950">
                                            U
                                        </div>

                                        <span className="text-xs font-semibold">
                                            Uptrace
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <DashboardNav
                                            icon={<Activity />}
                                            label="Overview"
                                            active
                                        />

                                        <DashboardNav
                                            icon={<Zap />}
                                            label="Traces"
                                        />

                                        <DashboardNav
                                            icon={<Database />}
                                            label="Services"
                                        />

                                        <DashboardNav
                                            icon={<Sparkles />}
                                            label="Errors"
                                        />
                                    </div>

                                    <div className="mt-10">
                                        <div className="mb-3 px-2 text-[9px] font-medium uppercase tracking-wider text-zinc-400">
                                            Project
                                        </div>

                                        <div className="h-8 rounded-md bg-zinc-100 dark:bg-zinc-900" />
                                    </div>
                                </div>

                                {/* Main dashboard */}
                                <div className="p-5 sm:p-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm font-semibold">
                                                Application overview
                                            </div>

                                            <div className="mt-1 text-[10px] text-zinc-400">
                                                Last 24 hours
                                            </div>
                                        </div>

                                        <div className="hidden rounded-md border border-zinc-200 px-3 py-1.5 text-[9px] text-zinc-500 sm:block dark:border-zinc-800">
                                            Last 24h
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        <DashboardStat
                                            icon={<Activity />}
                                            value="32"
                                            label="Traces"
                                        />

                                        <DashboardStat
                                            icon={<Zap />}
                                            value="336"
                                            label="Spans"
                                        />

                                        <DashboardStat
                                            icon={<Database />}
                                            value="4"
                                            label="Services"
                                        />

                                        <DashboardStat
                                            icon={<Clock3 />}
                                            value="128ms"
                                            label="P95 latency"
                                        />
                                    </div>

                                    {/* Chart */}
                                    <div className="mt-5 rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-medium">
                                                    Request performance
                                                </div>

                                                <div className="mt-1 text-[9px] text-zinc-400">
                                                    Requests per minute
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[9px] text-emerald-500">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Healthy
                                            </div>
                                        </div>

                                        <div className="mt-6 flex h-28 items-end gap-1">
                                            {[
                                                35,
                                                48,
                                                42,
                                                62,
                                                55,
                                                72,
                                                64,
                                                82,
                                                70,
                                                88,
                                                76,
                                                94,
                                                80,
                                                87,
                                                72,
                                                90,
                                                84,
                                                96,
                                                78,
                                                92,
                                            ].map((height, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative flex-1"
                                                >
                                                    <div
                                                        className="absolute bottom-0 w-full rounded-t-sm bg-zinc-200 transition-all duration-300 group-hover:bg-zinc-500 dark:bg-zinc-800 dark:group-hover:bg-zinc-500"
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trace list */}
                                    <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                                        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                                            <span className="text-xs font-medium">
                                                Recent traces
                                            </span>
                                        </div>

                                        <TraceRow
                                            service="api"
                                            endpoint="POST /v1/traces"
                                            duration="111ms"
                                        />

                                        <TraceRow
                                            service="web"
                                            endpoint="GET /dashboard"
                                            duration="84ms"
                                        />

                                        <TraceRow
                                            service="api"
                                            endpoint="GET /projects"
                                            duration="62ms"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom reflection */}
                    <div className="pointer-events-none absolute -bottom-16 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-full bg-zinc-300/20 blur-3xl dark:bg-zinc-700/10" />
                </div>
            </div>
        </section>
    );
}

function DashboardNav({
    icon,
    label,
    active = false,
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}) {
    return (
        <div
            className={`flex h-8 items-center gap-2 rounded-md px-2 text-[10px] ${
                active
                    ? "bg-white font-medium text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400"
            }`}
        >
            <span className="h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5">
                {icon}
            </span>

            {label}
        </div>
    );
}

function DashboardStat({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
                <span className="text-zinc-400 [&>svg]:h-3.5 [&>svg]:w-3.5">
                    {icon}
                </span>
            </div>

            <div className="mt-3 text-base font-semibold tracking-tight">
                {value}
            </div>

            <div className="mt-0.5 text-[9px] text-zinc-400">
                {label}
            </div>
        </div>
    );
}

function TraceRow({
    service,
    endpoint,
    duration,
}: {
    service: string;
    endpoint: string;
    duration: string;
}) {
    return (
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="w-12 text-[9px] font-medium text-zinc-500">
                {service}
            </span>

            <span className="flex-1 truncate text-[9px] text-zinc-600 dark:text-zinc-400">
                {endpoint}
            </span>

            <span className="text-[9px] text-zinc-400">
                {duration}
            </span>
        </div>
    );
}