"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const points = [
    "OpenTelemetry native",
    "Project-based telemetry",
    "Fast trace exploration",
];

export function CTA() {
    return (
        <section className="relative overflow-hidden bg-zinc-950 py-28 sm:py-36">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.035] blur-[140px]" />

                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
            </div>

            <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-black px-6 py-16 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:px-12 sm:py-20"
                >
                    {/* Top glow */}
                    <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                    {/* Decorative orb */}
                    <motion.div
                        className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full border border-zinc-800/80"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    <motion.div
                        className="pointer-events-none absolute -left-20 bottom-[-5rem] h-40 w-40 rounded-full border border-zinc-900"
                        animate={{
                            rotate: -360,
                        }}
                        transition={{
                            duration: 24,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    <div className="relative">
                        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
                        </div>

                        <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
                            Know what&apos;s happening
                            <br />
                            <span className="text-zinc-600">
                                inside your application.
                            </span>
                        </h2>

                        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-500 sm:text-lg">
                            Start collecting OpenTelemetry data and turn
                            traces into actionable insights.
                        </p>

                        {/* Points */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                            {points.map((point) => (
                                <div
                                    key={point}
                                    className="flex items-center gap-2 text-xs text-zinc-500"
                                >
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/10">
                                        <Check className="h-2.5 w-2.5 text-emerald-400" />
                                    </span>

                                    {point}
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                            >
                                Get started

                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-800 px-6 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}