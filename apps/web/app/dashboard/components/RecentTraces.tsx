import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const traces = [
    {
        id: "f93274a4",
        service: "uptrace-api",
        operation: "POST /v1/traces",
        duration: "111ms",
        status: "OK",
        time: "12 sec ago",
    },
    {
        id: "a82bc193",
        service: "api",
        operation: "GET /projects",
        duration: "84ms",
        status: "OK",
        time: "28 sec ago",
    },
    {
        id: "73d91ea2",
        service: "web",
        operation: "GET /dashboard",
        duration: "242ms",
        status: "OK",
        time: "1 min ago",
    },
    {
        id: "c52a9f01",
        service: "api",
        operation: "POST /auth/login",
        duration: "391ms",
        status: "Error",
        time: "2 min ago",
    },
    {
        id: "9a21dc84",
        service: "worker",
        operation: "process.telemetry",
        duration: "67ms",
        status: "OK",
        time: "3 min ago",
    },
];

export function RecentTraces() {
    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-200">
                        Recent traces
                    </h2>

                    <p className="mt-1 text-xs text-zinc-700">
                        Latest telemetry received by Uptrace
                    </p>
                </div>

                <Link
                    href="/dashboard/traces"
                    className="group flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
                >
                    View all

                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                    <thead>
                        <tr className="border-b border-zinc-900 text-left">
                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                Trace
                            </th>

                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                Service
                            </th>

                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                Duration
                            </th>

                            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                Status
                            </th>

                            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                Time
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {traces.map((trace) => (
                            <tr
                                key={trace.id}
                                className="border-b border-zinc-900/70 transition-colors last:border-0 hover:bg-zinc-900/30"
                            >
                                <td className="px-5 py-4">
                                    <div>
                                        <p className="font-mono text-xs text-zinc-300">
                                            {trace.id}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-600">
                                            {trace.operation}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-xs text-zinc-500">
                                    {trace.service}
                                </td>

                                <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                                    {trace.duration}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`
                                            inline-flex items-center gap-1.5
                                            text-xs
                                            ${
                                                trace.status === "OK"
                                                    ? "text-emerald-500"
                                                    : "text-red-400"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                h-1.5 w-1.5 rounded-full
                                                ${
                                                    trace.status === "OK"
                                                        ? "bg-emerald-500"
                                                        : "bg-red-400"
                                                }
                                            `}
                                        />

                                        {trace.status}
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-right text-xs text-zinc-700">
                                    {trace.time}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}