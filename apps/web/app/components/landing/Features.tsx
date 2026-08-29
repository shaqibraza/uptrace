"use client";

import {
    Activity,
    BarChart3,
    Database,
    GitBranch,
    Gauge,
    Radio,
} from "lucide-react";
import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";

const features = [
    {
        icon: Activity,
        title: "Distributed Tracing",
        description:
            "Follow requests across services, inspect individual spans, and find exactly where latency or failures originate.",
    },
    {
        icon: Gauge,
        title: "Performance Insights",
        description:
            "Understand response times, execution duration, and service performance without digging through raw telemetry.",
    },
    {
        icon: GitBranch,
        title: "Trace Relationships",
        description:
            "Explore parent and child spans to reconstruct the complete request path across your application.",
    },
    {
        icon: Database,
        title: "Structured Telemetry",
        description:
            "Keep resource attributes, span attributes, events, and status information attached to every trace.",
    },
    {
        icon: Radio,
        title: "OTLP Ingestion",
        description:
            "Send OpenTelemetry traces directly to Uptrace through the standard OTLP protocol and project API keys.",
    },
    {
        icon: BarChart3,
        title: "Project Observability",
        description:
            "Keep telemetry isolated by project and get a clean foundation for monitoring multiple applications.",
    },
];

export function Features() {
    return (
        <section
            id="features"
            className="
                relative overflow-hidden
                bg-zinc-950
                py-28 sm:py-36
            "
        >
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="
                        absolute left-1/2 top-0
                        h-[500px] w-[700px]
                        -translate-x-1/2
                        rounded-full
                        bg-cyan-500/[0.035]
                        blur-[140px]
                    "
                />

                <div
                    className="
                        absolute inset-0
                        bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]
                        bg-[size:64px_64px]
                        [mask-image:linear-gradient(to_bottom,black,transparent_85%)]
                    "
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    {/* Eyebrow */}
                    <div
                        className="
                            mb-5 inline-flex items-center gap-2
                            rounded-full
                            border border-zinc-800
                            bg-zinc-900/70
                            px-3 py-1.5
                            text-xs font-medium
                            text-zinc-400
                            backdrop-blur-md
                        "
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

                        Built for observability
                    </div>

                    <h2
                        className="
                            text-3xl font-semibold
                            tracking-tight
                            text-zinc-100
                            sm:text-4xl
                            lg:text-5xl
                        "
                    >
                        Understand what your
                        <br />
                        <span className="text-zinc-600">
                            systems are doing.
                        </span>
                    </h2>

                    <p className="mt-5 text-base leading-7 text-zinc-500 sm:text-lg">
                        Collect, explore, and understand telemetry from your
                        applications without getting buried in noise.
                    </p>
                </motion.div>

                {/* Feature cards */}
                <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            {...feature}
                            index={index}
                        />
                    ))}
                </div>

                {/* Telemetry strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.6,
                        delay: 0.2,
                    }}
                    className="
                        relative mt-4
                        overflow-hidden
                        rounded-2xl
                        border border-zinc-800
                        bg-black
                        p-6
                    "
                >
                    {/* Glow */}
                    <div
                        className="
                            pointer-events-none absolute
                            left-1/2 top-0
                            h-32 w-96
                            -translate-x-1/2
                            rounded-full
                            bg-cyan-500/[0.04]
                            blur-3xl
                        "
                    />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="
                                        h-2 w-2 rounded-full
                                        bg-emerald-400
                                        shadow-[0_0_10px_rgba(52,211,153,0.7)]
                                    "
                                />

                                <span className="font-mono text-[10px] font-medium tracking-[0.18em] text-zinc-600">
                                    TELEMETRY STREAM
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-zinc-400">
                                OpenTelemetry data flowing into your project.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="text-zinc-600">
                                traces
                            </span>

                            <span className="text-zinc-800">
                                /
                            </span>

                            <span className="text-zinc-400">
                                spans
                            </span>

                            <span className="text-zinc-800">
                                /
                            </span>

                            <span className="text-zinc-600">
                                events
                            </span>
                        </div>
                    </div>

                    {/* Animated telemetry line */}
                    <div className="relative mt-6 h-px overflow-hidden bg-zinc-900">
                        <motion.div
                            className="
                                absolute
                                h-px
                                w-1/4
                                bg-gradient-to-r
                                from-transparent
                                via-cyan-400/60
                                to-transparent
                            "
                            animate={{
                                x: ["-100%", "500%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}