"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Home,
    Search,
} from "lucide-react";

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-zinc-100">
            {/* Background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
            >
                <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900/30 blur-[120px]" />

                <div
                    className="
                        absolute inset-0
                        bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]
                        bg-[size:48px_48px]
                        [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]
                    "
                />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                {/* Logo */}
                <Link
                    href="/"
                    className="mx-auto flex w-fit items-center gap-2.5"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-black">
                        U
                    </div>

                    <span className="text-lg font-semibold tracking-tight">
                        Uptrace
                    </span>
                </Link>

                {/* Error */}
                <div className="mt-16">
                    <p className="font-mono text-7xl font-semibold tracking-tighter text-zinc-800 sm:text-8xl">
                        404
                    </p>

                    <h1 className="mt-6 text-xl font-semibold tracking-tight text-zinc-200">
                        Page not found
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-600">
                        The page you're looking for doesn't
                        exist or may have been moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
                    <Link
                        href="/"
                        className="
                            inline-flex h-9
                            items-center justify-center
                            gap-2 rounded-lg
                            bg-zinc-100 px-4
                            text-xs font-medium
                            text-black
                            transition-colors
                            hover:bg-white
                        "
                    >
                        <Home className="h-3.5 w-3.5" />
                        Go home
                    </Link>

                    <Link
                        href="/dashboard"
                        className="
                            inline-flex h-9
                            items-center justify-center
                            gap-2 rounded-lg
                            border border-zinc-900
                            bg-zinc-950 px-4
                            text-xs font-medium
                            text-zinc-500
                            transition-colors
                            hover:border-zinc-800
                            hover:text-zinc-300
                        "
                    >
                        <Search className="h-3.5 w-3.5" />
                        Dashboard
                    </Link>
                </div>

                {/* Back */}
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="
                        mt-6
                        inline-flex items-center gap-1.5
                        text-[10px] text-zinc-700
                        transition-colors
                        hover:text-zinc-400
                    "
                >
                    <ArrowLeft className="h-3 w-3" />
                    Go back
                </button>
            </div>
        </main>
    );
}