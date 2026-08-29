import { ArrowUpRight } from "lucide-react";

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

export function ServiceHealth() {
    return (
        <section className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold text-zinc-200">
                        Service health
                    </h2>

                    <p className="mt-1 text-xs text-zinc-700">
                        Current service performance
                    </p>
                </div>

                <ArrowUpRight className="h-4 w-4 text-zinc-700" />
            </div>

            <div className="divide-y divide-zinc-900/70">
                {services.map((service) => (
                    <div
                        key={service.name}
                        className="flex items-center gap-4 px-5 py-4"
                    >
                        <span
                            className={`
                                h-2 w-2 shrink-0 rounded-full
                                ${
                                    service.status === "Healthy"
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                }
                            `}
                        />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-zinc-300">
                                {service.name}
                            </p>

                            <p className="mt-1 text-[11px] text-zinc-700">
                                {service.status}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="font-mono text-xs text-zinc-500">
                                {service.latency}
                            </p>

                            <p className="mt-1 text-[10px] text-zinc-700">
                                {service.requests} requests
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}