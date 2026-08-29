import {
    Activity,
    AlertTriangle,
    Clock3,
    Zap,
} from "lucide-react";

const stats = [
    {
        label: "Total requests",
        value: "24.8K",
        change: "+12.4%",
        description: "vs. last 24 hours",
        icon: Activity,
    },
    {
        label: "Error rate",
        value: "0.42%",
        change: "-8.2%",
        description: "vs. last 24 hours",
        icon: AlertTriangle,
    },
    {
        label: "Avg. latency",
        value: "184ms",
        change: "-14ms",
        description: "vs. last 24 hours",
        icon: Clock3,
    },
    {
        label: "Active services",
        value: "8",
        change: "+2",
        description: "this week",
        icon: Zap,
    },
];

export function OverviewCards() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        className="group rounded-xl border border-zinc-900 bg-zinc-950 p-5 transition-colors hover:border-zinc-800"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-zinc-500">
                                {stat.label}
                            </p>

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black text-zinc-600 transition-colors group-hover:text-zinc-300">
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="mt-4 flex items-end gap-2">
                            <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                                {stat.value}
                            </p>

                            <span className="mb-1 text-xs font-medium text-emerald-500">
                                {stat.change}
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-zinc-700">
                            {stat.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}