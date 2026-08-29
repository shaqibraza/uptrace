"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

type FeatureCardProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    index: number;
};

export function FeatureCard({
    icon: Icon,
    title,
    description,
    index,
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: "easeOut",
            }}
            whileHover={{ y: -6 }}
            className="
                group relative overflow-hidden
                rounded-2xl
                border border-zinc-800/80
                bg-zinc-950/80
                p-6
                shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
                backdrop-blur-xl
                transition-all duration-300
                hover:border-zinc-700
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            "
        >
            {/* Subtle hover glow */}
            <div
                className="
                    pointer-events-none absolute
                    -right-20 -top-20
                    h-40 w-40
                    rounded-full
                    bg-cyan-500/[0.07]
                    blur-3xl
                    opacity-0
                    transition-opacity duration-500
                    group-hover:opacity-100
                "
            />

            {/* Subtle grid */}
            <div
                className="
                    pointer-events-none absolute inset-0
                    bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]
                    bg-[size:28px_28px]
                    [mask-image:linear-gradient(to_bottom,black,transparent_75%)]
                    opacity-0
                    transition-opacity duration-500
                    group-hover:opacity-100
                "
            />

            <div className="relative">
                {/* Icon + arrow */}
                <div className="mb-8 flex items-start justify-between">
                    <div
                        className="
                            flex h-11 w-11 items-center justify-center
                            rounded-xl
                            border border-zinc-800
                            bg-zinc-900
                            text-zinc-300
                            transition-all duration-300
                            group-hover:border-zinc-700
                            group-hover:bg-zinc-800
                            group-hover:text-white
                        "
                    >
                        <Icon
                            className="h-5 w-5"
                            strokeWidth={1.7}
                        />
                    </div>

                    <ArrowUpRight
                        className="
                            h-4 w-4
                            text-zinc-600
                            opacity-0
                            transition-all duration-300
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:text-zinc-300
                            group-hover:opacity-100
                        "
                    />
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                    {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}