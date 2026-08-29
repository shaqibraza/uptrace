"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
} from "lucide-react";

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

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

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            /*
             * Connect this to your existing API when the
             * frontend auth service is wired.
             */

            await new Promise((resolve) =>
                setTimeout(resolve, 700),
            );

            console.log("Register payload:", {
                name: form.name,
                email: form.email,
                password: form.password,
            });
        } catch {
            setError(
                "Something went wrong. Please try again.",
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
            {/* Name */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Name
                </label>

                <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={(event) =>
                            updateField(
                                "name",
                                event.target.value,
                            )
                        }
                        placeholder="Your name"
                        className="
                            h-11 w-full rounded-xl
                            border border-zinc-800
                            bg-zinc-950
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

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Email
                </label>

                <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

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
                            h-11 w-full rounded-xl
                            border border-zinc-800
                            bg-zinc-950
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
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Password
                </label>

                <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                    <input
                        id="password"
                        name="password"
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete="new-password"
                        required
                        value={form.password}
                        onChange={(event) =>
                            updateField(
                                "password",
                                event.target.value,
                            )
                        }
                        placeholder="At least 8 characters"
                        className="
                            h-11 w-full rounded-xl
                            border border-zinc-800
                            bg-zinc-950
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

            {/* Confirm Password */}
            <div>
                <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                >
                    Confirm password
                </label>

                <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                            showConfirmPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete="new-password"
                        required
                        value={form.confirmPassword}
                        onChange={(event) =>
                            updateField(
                                "confirmPassword",
                                event.target.value,
                            )
                        }
                        placeholder="Repeat your password"
                        className="
                            h-11 w-full rounded-xl
                            border border-zinc-800
                            bg-zinc-950
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
                            setShowConfirmPassword(
                                (current) => !current,
                            )
                        }
                        aria-label={
                            showConfirmPassword
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
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
                <input
                    type="checkbox"
                    required
                    className="
                        mt-0.5
                        h-4 w-4
                        rounded
                        border-zinc-700
                        bg-zinc-950
                        accent-zinc-100
                    "
                />

                <span className="text-xs leading-5 text-zinc-600">
                    I agree to the{" "}
                    <Link
                        href="#"
                        className="text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="#"
                        className="text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    .
                </span>
            </label>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="
                    group flex h-11 w-full
                    items-center justify-center gap-2
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
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-950" />
                        Creating account...
                    </>
                ) : (
                    <>
                        Create account
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </button>
        </form>
    );
}