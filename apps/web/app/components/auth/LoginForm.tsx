"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const updateField = (
        field: keyof typeof form,
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            setIsLoading(true);
            setError("");

            /*
             * Backend authentication will be connected here.
             *
             * Expected payload:
             * {
             *   email,
             *   password
             * }
             */

            await new Promise((resolve) =>
                setTimeout(resolve, 700),
            );

            console.log("Login payload:", {
                email: form.email,
                password: form.password,
            });
        } catch {
            setError(
                "Unable to sign in. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Email
                </label>

                <div className="relative">
                    <Mail
                        className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            h-4 w-4
                            -translate-y-1/2
                            text-zinc-600
                        "
                    />

                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={(event) =>
                            updateField(
                                "email",
                                event.target.value,
                            )
                        }
                        placeholder="you@example.com"
                        className="
                            h-11 w-full
                            rounded-xl
                            border border-zinc-800
                            bg-black
                            pl-10 pr-4
                            text-sm text-zinc-100
                            outline-none
                            placeholder:text-zinc-700
                            transition-colors
                            focus:border-zinc-600
                            focus:ring-1
                            focus:ring-zinc-700
                        "
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-zinc-300"
                    >
                        Password
                    </label>

                    <Link
                        href="/forgot-password"
                        className="
                            text-xs
                            text-zinc-600
                            transition-colors
                            hover:text-zinc-300
                        "
                    >
                        Forgot password?
                    </Link>
                </div>

                <div className="relative">
                    <LockKeyhole
                        className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            h-4 w-4
                            -translate-y-1/2
                            text-zinc-600
                        "
                    />

                    <input
                        id="password"
                        name="password"
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete="current-password"
                        required
                        value={form.password}
                        onChange={(event) =>
                            updateField(
                                "password",
                                event.target.value,
                            )
                        }
                        placeholder="Enter your password"
                        className="
                            h-11 w-full
                            rounded-xl
                            border border-zinc-800
                            bg-black
                            pl-10 pr-11
                            text-sm text-zinc-100
                            outline-none
                            placeholder:text-zinc-700
                            transition-colors
                            focus:border-zinc-600
                            focus:ring-1
                            focus:ring-zinc-700
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(
                                (current) => !current,
                            )
                        }
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                        className="
                            absolute right-3
                            top-1/2
                            -translate-y-1/2
                            text-zinc-600
                            transition-colors
                            hover:text-zinc-300
                        "
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    role="alert"
                    className="
                        rounded-xl
                        border border-red-900/60
                        bg-red-950/30
                        px-4 py-3
                        text-sm text-red-400
                    "
                >
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="
                    group
                    flex h-11 w-full
                    items-center justify-center
                    gap-2
                    rounded-xl
                    bg-zinc-100
                    text-sm font-medium
                    text-zinc-950
                    transition-all
                    hover:bg-white
                    hover:shadow-[0_0_30px_rgba(255,255,255,0.07)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                {isLoading ? (
                    <>
                        <span
                            className="
                                h-4 w-4
                                animate-spin
                                rounded-full
                                border-2
                                border-zinc-400
                                border-t-zinc-950
                            "
                        />
                        Signing in...
                    </>
                ) : (
                    <>
                        Sign in

                        <ArrowRight
                            className="
                                h-4 w-4
                                transition-transform
                                group-hover:translate-x-1
                            "
                        />
                    </>
                )}
            </button>
        </form>
    );
}