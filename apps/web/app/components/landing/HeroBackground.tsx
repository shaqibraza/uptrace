"use client";

import { motion, useReducedMotion } from "framer-motion";

type NodeProps = {
    x: string;
    y: string;
    label: string;
    value: string;
    delay: number;
    type: "success" | "warning";
    reducedMotion: boolean;
};

type AnimatedLineProps = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export function HeroBackground() {
    const shouldReduceMotion = useReducedMotion() ?? false;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
            {/* =========================================================
                AMBIENT LIGHT
            ========================================================= */}

            <motion.div
                className="
                    absolute
                    left-1/2
                    top-[-20rem]
                    h-[45rem]
                    w-[65rem]
                    -translate-x-1/2
                    rounded-full
                    bg-blue-600/[0.07]
                    blur-[140px]
                    dark:bg-blue-600/[0.12]
                "
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                            scale: [1, 1.08, 1],
                            opacity: [0.6, 0.9, 0.6],
                        }
                }
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="
                    absolute
                    left-[-12rem]
                    top-[30%]
                    h-[30rem]
                    w-[30rem]
                    rounded-full
                    bg-blue-500/[0.035]
                    blur-[120px]
                    dark:bg-blue-500/[0.08]
                "
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }
                }
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="
                    absolute
                    right-[-12rem]
                    top-[35%]
                    h-[30rem]
                    w-[30rem]
                    rounded-full
                    bg-purple-500/[0.035]
                    blur-[120px]
                    dark:bg-purple-500/[0.08]
                "
                animate={
                    shouldReduceMotion
                        ? undefined
                        : {
                            x: [0, -40, 0],
                            y: [0, 30, 0],
                        }
                }
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* =========================================================
                PERSPECTIVE GRID
            ========================================================= */}

            <div className="absolute inset-x-0 bottom-[-18rem] h-[42rem] [perspective:1000px]">
                <motion.div
                    className="
                        absolute
                        left-1/2
                        h-full
                        w-[120rem]
                        -translate-x-1/2
                        rotate-x-[62deg]
                        [transform-style:preserve-3d]
                        bg-[linear-gradient(to_right,rgba(113,113,122,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.14)_1px,transparent_1px)]
                        bg-[size:44px_44px]
                        [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_72%)]
                        opacity-50
                        dark:opacity-25
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                backgroundPosition: [
                                    "0px 0px",
                                    "0px 44px",
                                ],
                            }
                    }
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>

            {/* =========================================================
                CENTRAL TELEMETRY NETWORK
            ========================================================= */}

            <div className="absolute left-1/2 top-[46%] hidden h-[460px] w-[1000px] -translate-x-1/2 md:block">
                <svg
                    viewBox="0 0 980 500"
                    className="h-full w-full overflow-visible"
                    fill="none"
                >
                    {/* Network lines */}

                    <AnimatedLine
                        x1={160}
                        y1={210}
                        x2={390}
                        y2={135}
                    />

                    <AnimatedLine
                        x1={390}
                        y1={135}
                        x2={610}
                        y2={235}
                    />

                    <AnimatedLine
                        x1={610}
                        y1={235}
                        x2={820}
                        y2={160}
                    />

                    <AnimatedLine
                        x1={390}
                        y1={135}
                        x2={470}
                        y2={385}
                    />

                    <AnimatedLine
                        x1={470}
                        y1={385}
                        x2={720}
                        y2={440}
                    />

                    <AnimatedLine
                        x1={610}
                        y1={235}
                        x2={720}
                        y2={440}
                    />

                    <AnimatedLine
                        x1={160}
                        y1={210}
                        x2={470}
                        y2={385}
                    />

                    {/* Animated data pulses */}

                    <DataPulse
                        path="M160 210 L390 135 L610 235"
                        delay={0}
                        reducedMotion={shouldReduceMotion}
                    />

                    <DataPulse
                        path="M390 135 L470 385 L720 440"
                        delay={1.2}
                        reducedMotion={shouldReduceMotion}
                    />

                    <DataPulse
                        path="M610 235 L820 160"
                        delay={2}
                        reducedMotion={shouldReduceMotion}
                    />
                </svg>

                {/* =====================================================
                    NETWORK NODES
                ===================================================== */}

                <NetworkNode
                    x="16%"
                    y="42%"
                    label="API"
                    value="200"
                    type="success"
                    delay={0}
                    reducedMotion={shouldReduceMotion}
                />

                <NetworkNode
                    x="40%"
                    y="27%"
                    label="TRACE"
                    value="42ms"
                    type="success"
                    delay={0.5}
                    reducedMotion={shouldReduceMotion}
                />

                <NetworkNode
                    x="62%"
                    y="47%"
                    label="DB"
                    value="18ms"
                    type="success"
                    delay={1}
                    reducedMotion={shouldReduceMotion}
                />

                <NetworkNode
                    x="84%"
                    y="32%"
                    label="CACHE"
                    value="3ms"
                    type="success"
                    delay={1.5}
                    reducedMotion={shouldReduceMotion}
                />

                <NetworkNode
                    x="48%"
                    y="77%"
                    label="WORKER"
                    value="89%"
                    type="warning"
                    delay={2}
                    reducedMotion={shouldReduceMotion}
                />

                <NetworkNode
                    x="73%"
                    y="88%"
                    label="QUEUE"
                    value="12"
                    type="success"
                    delay={2.5}
                    reducedMotion={shouldReduceMotion}
                />
            </div>

            {/* =========================================================
                3D GLASS OBJECTS
            ========================================================= */}

            <div className="absolute inset-0 [perspective:1200px]">
                {/* Large glass orb */}

                <motion.div
                    className="
                        absolute
                        left-[6%]
                        top-[25%]
                        h-20
                        w-20
                        rounded-full
                        border
                        border-white/30
                        bg-gradient-to-br
                        from-white/30
                        via-violet-400/15
                        to-blue-500/5
                        shadow-[inset_-10px_-10px_30px_rgba(139,92,246,0.12),0_0_60px_rgba(139,92,246,0.12)]
                        backdrop-blur-xl
                        dark:border-white/10
                        dark:from-white/10
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                x: [0, 25, 0],
                                y: [0, -18, 0],
                                rotateX: [0, 12, 0],
                                rotateY: [0, 20, 0],
                            }
                    }
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="absolute left-4 top-3 h-5 w-8 rounded-full bg-white/25 blur-md" />
                </motion.div>

                {/* Small glass orb */}

                <motion.div
                    className="
                        absolute
                        right-[8%]
                        top-[28%]
                        h-14
                        w-14
                        rounded-full
                        border
                        border-white/35
                        bg-gradient-to-br
                        from-white/40
                        via-blue-400/15
                        to-violet-500/10
                        shadow-[inset_-6px_-6px_18px_rgba(59,130,246,0.15),0_0_35px_rgba(59,130,246,0.15)]
                        backdrop-blur-xl
                        dark:border-white/10
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                x: [0, -20, 0],
                                y: [0, 20, 0],
                                rotateY: [0, 180, 360],
                            }
                    }
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* =====================================================
                    3D GLASS CUBE
                ===================================================== */}

                <motion.div
                    className="
                        absolute
                        left-[13%]
                        top-[52%]
                        hidden
                        h-16
                        w-16
                        [transform-style:preserve-3d]
                        sm:block
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                rotateX: [0, 360],
                                rotateY: [0, 360],
                            }
                    }
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <CubeFace transform="translateZ(32px)" />
                    <CubeFace transform="rotateY(180deg) translateZ(32px)" />
                    <CubeFace transform="rotateY(90deg) translateZ(32px)" />
                    <CubeFace transform="rotateY(-90deg) translateZ(32px)" />
                    <CubeFace transform="rotateX(90deg) translateZ(32px)" />
                    <CubeFace transform="rotateX(-90deg) translateZ(32px)" />
                </motion.div>

                {/* =====================================================
                    GLASS RINGS
                ===================================================== */}

                <motion.div
                    className="
                        absolute
                        bottom-[22%]
                        left-[9%]
                        hidden
                        h-20
                        w-20
                        rounded-full
                        border
                        border-violet-400/20
                        shadow-[0_0_40px_rgba(139,92,246,0.1)]
                        sm:block
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                rotateX: [65, 85, 65],
                                rotateY: [15, 35, 15],
                            }
                    }
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <motion.div
                    className="
                        absolute
                        right-[15%]
                        top-[15%]
                        hidden
                        h-28
                        w-28
                        rounded-full
                        border
                        border-blue-400/10
                        sm:block
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                rotateX: [65, 95, 65],
                                rotateY: [-25, 10, -25],
                            }
                    }
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Tiny floating sphere */}

                <motion.div
                    className="
                        absolute
                        bottom-[24%]
                        right-[24%]
                        h-7
                        w-7
                        rounded-full
                        border
                        border-white/30
                        bg-white/10
                        shadow-[0_0_30px_rgba(139,92,246,0.2)]
                        backdrop-blur-md
                    "
                    animate={
                        shouldReduceMotion
                            ? undefined
                            : {
                                y: [0, -18, 0],
                                x: [0, 8, 0],
                            }
                    }
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* =========================================================
                FLOATING PARTICLES
            ========================================================= */}

            <TelemetryParticles reducedMotion={shouldReduceMotion} />

            {/* =========================================================
                VIGNETTE
            ========================================================= */}

            <div
                className="
                    absolute
                    inset-0
                    bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_100%)]
                    opacity-70
                "
            />
        </div>
    );
}

/* =============================================================
   ANIMATED SVG LINE
============================================================= */

function AnimatedLine({
    x1,
    y1,
    x2,
    y2,
}: AnimatedLineProps) {
    return (
        <motion.line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            className="text-zinc-300/50 dark:text-zinc-700/60"
            strokeWidth="1"
            strokeDasharray="4 8"
            animate={{
                strokeDashoffset: [0, -24],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
}

/* =============================================================
   DATA PULSE
============================================================= */

function DataPulse({
    path,
    delay,
    reducedMotion,
}: {
    path: string;
    delay: number;
    reducedMotion: boolean;
}) {
    return (
        <motion.circle
            r="3"
            fill="currentColor"
            className="text-violet-400"
            filter="drop-shadow(0 0 6px rgba(139,92,246,0.9))"
            initial={{
                offsetDistance: "0%",
                opacity: 0,
            }}
            animate={
                reducedMotion
                    ? undefined
                    : {
                        offsetDistance: ["0%", "100%"],
                        opacity: [0, 1, 1, 0],
                    }
            }
            transition={{
                duration: 3.5,
                delay,
                repeat: Infinity,
                ease: "linear",
            }}
            style={{
                offsetPath: `path("${path}")`,
            }}
        />
    );
}

/* =============================================================
   NETWORK NODE
============================================================= */

function NetworkNode({
    x,
    y,
    label,
    value,
    type,
    delay,
    reducedMotion,
}: NodeProps) {
    const statusClass =
        type === "success"
            ? "bg-emerald-400"
            : "bg-amber-400";

    return (
        <motion.div
            className="
                absolute
                w-24
                -translate-x-1/2
                -translate-y-1/2
                rounded-xl
                border
                border-white/20
                bg-white/[0.06]
                p-2
                shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                backdrop-blur-xl
                dark:border-white/[0.08]
                dark:bg-white/[0.025]
            "
            style={{
                left: x,
                top: y,
            }}
            initial={{
                opacity: 0,
                scale: 0.8,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                y: reducedMotion ? 0 : [0, -5, 0],
            }}
            transition={{
                opacity: {
                    duration: 0.6,
                    delay,
                },
                scale: {
                    duration: 0.6,
                    delay,
                },
                y: reducedMotion
                    ? undefined
                    : {
                        duration: 4,
                        delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
            }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[8px] font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                    {label}
                </span>

                <span
                    className={`h-1.5 w-1.5 rounded-full ${statusClass} shadow-[0_0_8px_currentColor]`}
                />
            </div>

            <div className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {value}
            </div>
        </motion.div>
    );
}

/* =============================================================
   3D CUBE FACE
============================================================= */

function CubeFace({
    transform,
}: {
    transform: string;
}) {
    return (
        <div
            className="
                absolute
                inset-0
                border
                border-violet-400/20
                bg-gradient-to-br
                from-white/[0.12]
                to-violet-500/[0.04]
                backdrop-blur-sm
            "
            style={{
                transform,
            }}
        />
    );
}

/* =============================================================
   PARTICLES
============================================================= */

function TelemetryParticles({
    reducedMotion,
}: {
    reducedMotion: boolean;
}) {
    const particles: [number, number, number][] = [
        [8, 18, 2],
        [14, 68, 1],
        [25, 15, 3],
        [31, 76, 2],
        [44, 12, 1],
        [52, 72, 3],
        [66, 11, 2],
        [77, 75, 1],
        [88, 28, 3],
        [94, 60, 2],
        [21, 46, 1],
        [57, 41, 2],
        [72, 52, 3],
        [37, 32, 2],
        [83, 42, 1],
    ];

    return (
        <>
            {particles.map(([x, y, depth], index) => (
                <motion.span
                    key={index}
                    className="
                        absolute
                        h-1
                        w-1
                        rounded-full
                        bg-violet-400/50
                        shadow-[0_0_12px_rgba(139,92,246,0.8)]
                    "
                    style={{
                        left: `${x}%`,
                        top: `${y}%`,
                    }}
                    animate={
                        reducedMotion
                            ? undefined
                            : {
                                opacity: [0.15, 0.8, 0.15],
                                y: [0, -8 * depth, 0],
                                x: [0, 4 * depth, 0],
                                scale: [0.8, 1.2, 0.8],
                            }
                    }
                    transition={{
                        duration: 3 + depth,
                        delay: index * 0.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </>
    );
}