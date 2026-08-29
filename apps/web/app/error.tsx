"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    Home,
    RefreshCw,
} from "lucide-react";

type ErrorPageProps = {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
};

export default function ErrorPage({
    error,
    reset,
}: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-zinc-100">
            {/* Background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
            >
                <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/[0.025] blur-[120px]" />

                <div
                    className="
                        absolute inset-0
                        bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]
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

                {/* Icon */}
                <div className="mx-auto mt-16 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>

                <h1 className="mt-6 text-xl font-semibold tracking-tight text-zinc-200">
                    Something went wrong
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-600">
                    An unexpected error occurred while
                    loading this page. Try again or return
                    to the dashboard.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={reset}
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
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try again
                    </button>

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
                        <Home className="h-3.5 w-3.5" />
                        Dashboard
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-8 font-mono text-[9px] text-zinc-800">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </main>
    );
}