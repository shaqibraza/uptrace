"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
    X,
} from "lucide-react";

import { useAuthStore } from "../../../stores/auth.store";

const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(3, "Name must be at least 3 characters.")
            .max(
                100,
                "Name must be less than 100 characters.",
            ),

        email: z
            .string()
            .trim()
            .email("Please enter a valid email address.")
            .max(
                255,
                "Email must be less than 255 characters.",
            ),

        password: z
            .string()
            .min(
                8,
                "Password must be at least 8 characters.",
            )
            .max(
                128,
                "Password must be less than 128 characters.",
            )
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter.",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter.",
            )
            .regex(
                /[0-9]/,
                "Password must contain at least one number.",
            )
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character.",
            ),

        confirmPassword: z.string(),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        },
    );

type RegisterFormValues = z.infer<
    typeof registerSchema
>;

export function RegisterForm() {
    const router = useRouter();

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const register = useAuthStore(
        (state) => state.register,
    );

    const isRegistering = useAuthStore(
        (state) => state.isRegistering,
    );

    const storeError = useAuthStore(
        (state) => state.error,
    );

    const clearError = useAuthStore(
        (state) => state.clearError,
    );

    const {
        register: registerField,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const name = watch("name", "");
    const email = watch("email", "");
    const password = watch("password", "");
    const confirmPassword = watch(
        "confirmPassword",
        "",
    );

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const isNameValid =
        trimmedName.length >= 3 &&
        trimmedName.length <= 100;

    const isEmailValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            trimmedEmail,
        ) && trimmedEmail.length <= 255;

    const isConfirmPasswordValid =
        confirmPassword.length > 0 &&
        password === confirmPassword;

    const passwordRequirements = [
        {
            label: "At least 8 characters",
            valid: password.length >= 8,
        },
        {
            label: "One uppercase letter",
            valid: /[A-Z]/.test(password),
        },
        {
            label: "One lowercase letter",
            valid: /[a-z]/.test(password),
        },
        {
            label: "One number",
            valid: /[0-9]/.test(password),
        },
        {
            label: "One special character",
            valid: /[^A-Za-z0-9]/.test(password),
        },
    ];

    const onSubmit = async (
        values: RegisterFormValues,
    ) => {
        clearError();

        const normalizedEmail = values.email
            .trim()
            .toLowerCase();

        const success = await register({
            name: values.name.trim(),
            email: normalizedEmail,
            password: values.password,
        });

        if (success) {
            router.push(
                `/verify-email?email=${encodeURIComponent(
                    normalizedEmail,
                )}`,
            );
        }
    };

    const handleFieldChange = () => {
        if (storeError) {
            clearError();
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
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
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        disabled={isRegistering}
                        {...registerField("name", {
                            onChange: handleFieldChange,
                        })}
                        className={`
                            h-11 w-full rounded-xl
                            border
                            bg-zinc-950
                            pl-10 pr-10
                            text-sm text-zinc-100
                            outline-none
                            placeholder:text-zinc-700
                            transition-colors
                            focus:border-zinc-600
                            focus:ring-1
                            focus:ring-zinc-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            ${
                                errors.name
                                    ? "border-red-900/70"
                                    : isNameValid
                                      ? "border-emerald-500/40"
                                      : "border-zinc-800"
                            }
                        `}
                    />

                    {isNameValid && (
                        <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                    )}
                </div>

                {isNameValid && !errors.name && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check className="h-3 w-3" />
                        Valid name
                    </p>
                )}

                {errors.name && (
                    <p className="mt-2 text-xs text-red-400">
                        {errors.name.message}
                    </p>
                )}
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
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isRegistering}
                        {...registerField("email", {
                            onChange: handleFieldChange,
                        })}
                        className={`
                            h-11 w-full rounded-xl
                            border
                            bg-zinc-950
                            pl-10 pr-10
                            text-sm text-zinc-100
                            outline-none
                            placeholder:text-zinc-700
                            transition-colors
                            focus:border-zinc-600
                            focus:ring-1
                            focus:ring-zinc-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            ${
                                errors.email
                                    ? "border-red-900/70"
                                    : isEmailValid
                                      ? "border-emerald-500/40"
                                      : "border-zinc-800"
                            }
                        `}
                    />

                    {isEmailValid && (
                        <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                    )}
                </div>

                {isEmailValid && !errors.email && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check className="h-3 w-3" />
                        Valid email address
                    </p>
                )}

                {errors.email && (
                    <p className="mt-2 text-xs text-red-400">
                        {errors.email.message}
                    </p>
                )}
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
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        disabled={isRegistering}
                        {...registerField("password", {
                            onChange: handleFieldChange,
                        })}
                        className={`
                            h-11 w-full rounded-xl
                            border
                            bg-zinc-950
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
                            ${
                                errors.password
                                    ? "border-red-900/70"
                                    : "border-zinc-800"
                            }
                        `}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(
                                (current) => !current,
                            )
                        }
                        disabled={isRegistering}
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
                            disabled:opacity-50
                        "
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-3">
                    <p className="mb-2 text-xs font-medium text-zinc-500">
                        Password must contain:
                    </p>

                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {passwordRequirements.map(
                            (requirement) => (
                                <div
                                    key={requirement.label}
                                    className={`flex items-center gap-2 text-xs transition-colors ${
                                        requirement.valid
                                            ? "text-emerald-400"
                                            : "text-zinc-600"
                                    }`}
                                >
                                    <span
                                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                                            requirement.valid
                                                ? "border-emerald-500/60 bg-emerald-500/10"
                                                : "border-zinc-700"
                                        }`}
                                    >
                                        {requirement.valid ? (
                                            <Check className="h-2.5 w-2.5" />
                                        ) : (
                                            <X className="h-2.5 w-2.5 opacity-40" />
                                        )}
                                    </span>

                                    {requirement.label}
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {errors.password && (
                    <p className="mt-2 text-xs text-red-400">
                        {errors.password.message}
                    </p>
                )}
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
                        type={
                            showConfirmPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        disabled={isRegistering}
                        {...registerField(
                            "confirmPassword",
                            {
                                onChange:
                                    handleFieldChange,
                            },
                        )}
                        className={`
                            h-11 w-full rounded-xl
                            border
                            bg-zinc-950
                            pl-10 pr-10
                            text-sm text-zinc-100
                            outline-none
                            placeholder:text-zinc-700
                            transition-colors
                            focus:border-zinc-600
                            focus:ring-1
                            focus:ring-zinc-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            ${
                                errors.confirmPassword
                                    ? "border-red-900/70"
                                    : isConfirmPasswordValid
                                      ? "border-emerald-500/40"
                                      : "border-zinc-800"
                            }
                        `}
                    />

                    {isConfirmPasswordValid && (
                        <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                    )}

                    {!isConfirmPasswordValid && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    (current) =>
                                        !current,
                                )
                            }
                            disabled={isRegistering}
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
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    )}

                    {isConfirmPasswordValid && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    (current) =>
                                        !current,
                                )
                            }
                            disabled={isRegistering}
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
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>

                {isConfirmPasswordValid && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check className="h-3 w-3" />
                        Passwords match
                    </p>
                )}

                {errors.confirmPassword && (
                    <p className="mt-2 text-xs text-red-400">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {/* Server Error */}
            {storeError && (
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
                    {storeError}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isRegistering}
                className="
                    group
                    flex h-11 w-full
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
                {isRegistering ? (
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