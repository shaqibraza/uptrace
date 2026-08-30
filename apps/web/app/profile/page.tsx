"use client";

import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Mail,
    User,
} from "lucide-react";

import { Navbar } from "../components/landing/Navbar";
import { useAuthStore } from "../../stores/auth.store";
import { Footer } from "../components/landing/Footer";

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const status = useAuthStore((state) => state.status);
    const isInitializing = useAuthStore(
        (state) => state.isInitializing,
    );

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-black text-zinc-100">
                <Navbar />

                <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                        Loading profile...
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    if (status !== "authenticated" || !user) {
        return (
            <div className="min-h-screen bg-black text-zinc-100">
                <Navbar />

                <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4">
                    <div className="text-center">
                        <h1 className="text-xl font-semibold">
                            Sign in required
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            Please sign in to view your profile.
                        </p>

                        <Link
                            href="/login"
                            className="
                                mt-6 inline-flex
                                items-center
                                rounded-lg
                                bg-zinc-100
                                px-4 py-2
                                text-sm font-medium
                                text-zinc-950
                                transition-colors
                                hover:bg-white
                            "
                        >
                            Sign in
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const initials =
        user.name
            ?.trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "";

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <Navbar />

            <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href="/dashboard"
                    className="
                        inline-flex items-center gap-2
                        text-sm text-zinc-500
                        transition-colors
                        hover:text-zinc-200
                    "
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                </Link>

                <div className="mt-8">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                            Account
                        </p>

                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                            Profile
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            View your account information.
                        </p>
                    </div>

                    <div
                        className="
                            mt-8 overflow-hidden
                            rounded-2xl
                            border border-zinc-800
                            bg-zinc-950
                        "
                    >
                        {/* Profile header */}
                        <div
                            className="
                                flex flex-col gap-5
                                border-b border-zinc-800
                                px-6 py-6
                                sm:flex-row
                                sm:items-center
                            "
                        >
                            <div
                                className="
                                    flex h-16 w-16
                                    shrink-0
                                    items-center justify-center
                                    rounded-full
                                    bg-zinc-800
                                    text-lg font-semibold
                                    text-zinc-300
                                "
                            >
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-semibold text-zinc-100">
                                    {user.name}
                                </h2>

                                <p className="mt-1 truncate text-sm text-zinc-500">
                                    {user.email}
                                </p>

                                <div className="mt-2 flex items-center gap-1.5">
                                    {user.emailVerifiedAt ? (
                                        <>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />

                                            <span className="text-xs text-zinc-500">
                                                Email verified
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-zinc-600">
                                            Email not verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account information */}
                        <div className="divide-y divide-zinc-900">
                            <div className="flex items-center gap-4 px-6 py-5">
                                <div
                                    className="
                                        flex h-9 w-9
                                        shrink-0
                                        items-center justify-center
                                        rounded-lg
                                        bg-zinc-900
                                    "
                                >
                                    <User className="h-4 w-4 text-zinc-500" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-zinc-600">
                                        Full name
                                    </p>

                                    <p className="mt-1 truncate text-sm text-zinc-200">
                                        {user.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 px-6 py-5">
                                <div
                                    className="
                                        flex h-9 w-9
                                        shrink-0
                                        items-center justify-center
                                        rounded-lg
                                        bg-zinc-900
                                    "
                                >
                                    <Mail className="h-4 w-4 text-zinc-500" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-zinc-600">
                                        Email address
                                    </p>

                                    <p className="mt-1 truncate text-sm text-zinc-200">
                                        {user.email}
                                    </p>
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