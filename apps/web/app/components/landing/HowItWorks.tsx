"use client";

import {
    ArrowRight,
    Code2,
    Radio,
    Search,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        icon: Code2,
        title: "Instrument your application",
        description:
            "Add OpenTelemetry to your application and configure the Uptrace OTLP endpoint with your project API key.",
    },
    {
        number: "02",
        icon: Radio,
        title: "Send telemetry",
        description:
            "Your application sends traces and spans through the standard OpenTelemetry protocol directly to Uptrace.",
    },
    {
        number: "03",
        icon: Search,
        title: "Explore what happened",
        description:
            "Open your project, inspect traces and spans, and quickly find slow requests, errors, and service bottlenecks.",
    },
];

export function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="relative overflow-hidden bg-zinc-950 py-28 sm:py-36"
        >
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.025] blur-[140px]" />

                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                        Simple by design
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                        From request to insight
                        <br />
                        <span className="text-zinc-600">
                            in three steps.
                        </span>
                    </h2>

                    <p className="mt-5 text-base leading-7 text-zinc-500 sm:text-lg">
                        Connect your application, start sending telemetry,
                        and see what is happening inside your system.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="relative mt-20">
                    {/* Connecting line */}
                    <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent lg:block" />

                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="absolute left-[16.66%] right-[16.66%] top-12 hidden h-px origin-left bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-cyan-500/0 lg:block"
                    />

                    <div className="grid gap-6 lg:grid-cols-3">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{
                                        opacity: 0,
                                        y: 30,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                        margin: "-80px",
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                    }}
                                    className="group relative"
                                >
                                    {/* Number / icon */}
                                    <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_0_0_8px_rgba(9,9,11,1)] transition-all duration-300 group-hover:border-zinc-700">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition-all duration-300 group-hover:border-cyan-400/30 group-hover:bg-zinc-800 group-hover:text-cyan-300">
                                            <Icon className="h-5 w-5" strokeWidth={1.7} />
                                        </div>

                                        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-1.5 font-mono text-[9px] text-zinc-500">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="mt-8 text-center">
                                        <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                                            {step.title}
                                        </h3>

                                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom code-like panel */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mx-auto mt-20 max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl"
                >
                    <div className="flex items-center gap-2 border-b border-zinc-900 px-4 py-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />

                        <span className="ml-3 font-mono text-[10px] text-zinc-600">
                            otel.config.ts
                        </span>
                    </div>

                    <div className="overflow-x-auto p-5 font-mono text-xs leading-7 sm:p-7">
                        <div className="text-zinc-700">
                            <span className="text-zinc-500">const</span>{" "}
                            <span className="text-zinc-300">
                                telemetry
                            </span>{" "}
                            = {"{"}
                        </div>

                        <div className="pl-5">
                            <span className="text-zinc-600">
                                endpoint:
                            </span>{" "}
                            <span className="text-cyan-400/80">
                                &quot;http://localhost:4000/v1/traces&quot;
                            </span>
                            ,
                        </div>

                        <div className="pl-5">
                            <span className="text-zinc-600">
                                protocol:
                            </span>{" "}
                            <span className="text-emerald-400/80">
                                &quot;otlp&quot;
                            </span>
                            ,
                        </div>

                        <div className="pl-5">
                            <span className="text-zinc-600">
                                service:
                            </span>{" "}
                            <span className="text-zinc-400">
                                &quot;your-app&quot;
                            </span>
                        </div>

                        <div className="text-zinc-700">{"};"}</div>

                        {/* Moving cursor */}
                        <motion.div
                            className="mt-3 h-px w-20 bg-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            animate={{
                                opacity: [0.2, 1, 0.2],
                            }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                            }}
                        />
                    </div>
                </motion.div>

                {/* Bottom hint */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
                    <span>Ready to see your telemetry?</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </section>
    );
}