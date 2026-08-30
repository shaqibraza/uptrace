"use client";

import { useToast } from "../../providers/ToastProvider";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";

import { useAuthStore } from "../../../stores/auth.store";

import type { LoginPayload } from "../../../lib/api/auth.api";

export function LoginForm() {
    const router = useRouter();

    const {
        success: showSuccess,
        error: showError,
    } = useToast();

    const [showPassword, setShowPassword] =
        useState(false);

    const login = useAuthStore(
        (state) => state.login,
    );

    const isLoggingIn = useAuthStore(
        (state) => state.isLoggingIn,
    );

    const error = useAuthStore(
        (state) => state.error,
    );

    const clearError = useAuthStore(
        (state) => state.clearError,
    );

    const {
        register,
        handleSubmit,
        formState: {
            errors,
        },
    } = useForm<LoginPayload>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (
        data: LoginPayload,
    ) => {
        clearError();

        const loginSuccess = await login({
            email: data.email
                .trim()
                .toLowerCase(),
            password: data.password,
        });

        if (!loginSuccess) {
            const currentError =
                useAuthStore.getState().error;

            showError(
                "Sign in failed",
                currentError ??
                    "Unable to sign in. Please try again.",
            );

            return;
        }

        showSuccess(
            "Welcome back",
            "You have been signed in successfully.",
        );

        // Give the toast time to render before navigation.
        setTimeout(() => {
            router.push("/dashboard");
        }, 1000);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
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
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isLoggingIn}
                        {...register("email", {
                            required:
                                "Email is required",

                            pattern: {
                                value:
                                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message:
                                    "Please enter a valid email address",
                            },
                        })}
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
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    />
                </div>

                {errors.email && (
                    <p
                        role="alert"
                        className="mt-2 text-xs text-red-400"
                    >
                        {errors.email.message}
                    </p>
                )}
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
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        disabled={isLoggingIn}
                        {...register("password", {
                            required:
                                "Password is required",

                            minLength: {
                                value: 8,
                                message:
                                    "Password must be at least 8 characters",
                            },
                        })}
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
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(
                                (current) =>
                                    !current,
                            )
                        }
                        disabled={isLoggingIn}
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
                            disabled:cursor-not-allowed
                        "
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {errors.password && (
                    <p
                        role="alert"
                        className="mt-2 text-xs text-red-400"
                    >
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* API Error */}
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
                disabled={isLoggingIn}
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
                {isLoggingIn ? (
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