import Link from "next/link";
import {
    Mail,
} from "lucide-react";

import { Navbar } from "../components/landing/Navbar";
import { Footer } from "../components/landing/Footer";
import { VerifyEmailContent } from "./VerifyEmailContent";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />

            <main className="relative overflow-hidden">
                {/* Background */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    {/* Ambient glow */}
                    <div
                        className="
                            absolute left-1/2 top-[-12rem]
                            h-[34rem] w-[50rem]
                            -translate-x-1/2
                            rounded-full
                            bg-cyan-500/[0.035]
                            blur-[130px]
                        "
                    />

                    <div
                        className="
                            absolute -left-40 top-[35%]
                            h-80 w-80
                            rounded-full
                            bg-blue-500/[0.02]
                            blur-[110px]
                        "
                    />

                    <div
                        className="
                            absolute -right-40 top-[45%]
                            h-80 w-80
                            rounded-full
                            bg-cyan-500/[0.02]
                            blur-[110px]
                        "
                    />

                    {/* Grid */}
                    <div
                        className="
                            absolute
                            left-1/2
                            top-[30%]
                            h-[45rem]
                            w-[100rem]
                            -translate-x-1/2
                            rotate-x-[65deg]
                            opacity-40
                            [transform-style:preserve-3d]
                        "
                    >
                        <div
                            className="
                                h-full w-full
                                bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]
                                bg-[size:44px_44px]
                                [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]
                            "
                        />
                    </div>

                    {/* Floating elements */}
                    <div
                        className="
                            absolute left-[8%] top-[25%]
                            h-16 w-16
                            rounded-full
                            border border-white/[0.06]
                            bg-white/[0.015]
                            shadow-[inset_-8px_-8px_20px_rgba(34,211,238,0.03)]
                            backdrop-blur-md
                            animate-bounce
                            [animation-duration:7s]
                        "
                    />

                    <div
                        className="
                            absolute right-[10%] top-[32%]
                            h-10 w-10
                            rounded-full
                            border border-white/[0.06]
                            bg-white/[0.015]
                            backdrop-blur-md
                            animate-bounce
                            [animation-duration:9s]
                            [animation-direction:reverse]
                        "
                    />

                    <div
                        className="
                            absolute bottom-[20%] left-[13%]
                            h-6 w-6
                            rounded-full
                            border border-cyan-400/10
                            bg-cyan-400/[0.02]
                            shadow-[0_0_25px_rgba(34,211,238,0.06)]
                            animate-bounce
                            [animation-duration:6s]
                        "
                    />

                    <div
                        className="
                            absolute bottom-[25%] right-[16%]
                            h-20 w-20
                            rounded-full
                            border border-white/[0.04]
                            bg-white/[0.01]
                            backdrop-blur-sm
                            animate-bounce
                            [animation-duration:11s]
                            [animation-direction:reverse]
                        "
                    />

                    {/* Nodes */}
                    <span
                        className="
                            absolute left-[18%] top-[20%]
                            h-1 w-1 rounded-full
                            bg-cyan-400/40
                            shadow-[0_0_10px_rgba(34,211,238,0.5)]
                        "
                    />

                    <span
                        className="
                            absolute left-[78%] top-[22%]
                            h-1 w-1 rounded-full
                            bg-cyan-400/30
                            shadow-[0_0_10px_rgba(34,211,238,0.5)]
                        "
                    />

                    <span
                        className="
                            absolute left-[26%] top-[70%]
                            h-1 w-1 rounded-full
                            bg-zinc-400/30
                        "
                    />

                    <span
                        className="
                            absolute right-[25%] top-[68%]
                            h-1 w-1 rounded-full
                            bg-zinc-400/30
                        "
                    />

                    {/* Telemetry lines */}
                    <div
                        className="
                            absolute left-1/2 top-[28%]
                            h-px w-[70%]
                            -translate-x-1/2
                            bg-gradient-to-r
                            from-transparent
                            via-cyan-400/[0.08]
                            to-transparent
                        "
                    />

                    <div
                        className="
                            absolute bottom-[28%] left-1/2
                            h-px w-[60%]
                            -translate-x-1/2
                            bg-gradient-to-r
                            from-transparent
                            via-zinc-700/30
                            to-transparent
                        "
                    />
                </div>

                {/* Content */}
                <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16 sm:py-20">
                    <div className="w-full max-w-md">
                        {/* Card */}
                        <div
                            className="
                                relative
                                overflow-hidden
                                rounded-2xl
                                border border-zinc-800/90
                                bg-zinc-950/80
                                p-7
                                text-center
                                shadow-[0_30px_100px_rgba(0,0,0,0.5)]
                                backdrop-blur-2xl
                                sm:p-10
                            "
                        >
                            {/* Top glow */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute left-1/2 top-0
                                    h-px w-2/3
                                    -translate-x-1/2
                                    bg-gradient-to-r
                                    from-transparent
                                    via-cyan-400/30
                                    to-transparent
                                "
                            />

                            {/* Grid */}
                            <div
                                className="
                                    pointer-events-none
                                    absolute inset-0
                                    bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]
                                    bg-[size:32px_32px]
                                    [mask-image:linear-gradient(to_bottom,black,transparent_65%)]
                                "
                            />

                            <div className="relative">
                                <VerifyEmailContent />

                                <div className="mt-8 border-t border-zinc-900 pt-6">
                                    <p className="text-sm text-zinc-600">
                                        Already verified?
                                    </p>

                                    <Link
                                        href="/login"
                                        className="
                                            mt-2
                                            inline-block
                                            text-sm
                                            font-medium
                                            text-zinc-300
                                            transition-colors
                                            hover:text-white
                                        "
                                    >
                                        Go to login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}