"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    Loader2,
    Mail,
    XCircle,
} from "lucide-react";

import { useAuthStore } from "../../stores/auth.store";

type VerificationState =
    | "waiting"
    | "verifying"
    | "success"
    | "error"
    | "missing-token";

export function VerifyEmailContent() {
    const searchParams = useSearchParams();

    const verifyEmail = useAuthStore(
        (state) => state.verifyEmail,
    );

    const resendVerificationEmail =
        useAuthStore(
            (state) =>
                state.resendVerificationEmail,
        );

    const storeError = useAuthStore(
        (state) => state.error,
    );

    const isVerifyingEmail = useAuthStore(
        (state) => state.isVerifyingEmail,
    );

    const isResendingVerificationEmail =
        useAuthStore(
            (state) =>
                state.isResendingVerificationEmail,
        );

    const [verificationState, setVerificationState] =
        useState<VerificationState>("waiting");

    const [resendSuccess, setResendSuccess] =
        useState(false);

    const [cooldown, setCooldown] =
        useState(0);

    const hasVerified = useRef(false);

    const email =
        searchParams.get("email") ?? "";

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setVerificationState("waiting");
            return;
        }

        if (hasVerified.current) {
            return;
        }

        hasVerified.current = true;

        setVerificationState("verifying");

        const verify = async () => {
            const success =
                await verifyEmail(token);

            if (success) {
                setVerificationState("success");
            } else {
                setVerificationState("error");
            }
        };

        void verify();
    }, [searchParams, verifyEmail]);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setCooldown((current) =>
                current > 0 ? current - 1 : 0,
            );
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [cooldown]);

    const handleResend = async () => {
        if (
            !email ||
            isResendingVerificationEmail ||
            cooldown > 0
        ) {
            return;
        }

        setResendSuccess(false);

        const success =
            await resendVerificationEmail(email);

        if (success) {
            setResendSuccess(true);
            setCooldown(60);
        }
    };

    const isLoading =
        verificationState === "verifying" ||
        isVerifyingEmail;

    /*
     * Waiting state
     * User reached this page after registration.
     */
    if (verificationState === "waiting") {
        return (
            <>
                <div
                    className="
                        mx-auto mb-6
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        border border-zinc-800
                        bg-zinc-900
                    "
                >
                    <Mail className="h-7 w-7 text-zinc-300" />
                </div>

                <h1
                    className="
                        text-2xl
                        font-semibold
                        tracking-tight
                        text-zinc-100
                    "
                >
                    Check your email
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                    We&apos;ve sent a verification link
                    to your email address. Click the link
                    in the email to verify your account.
                </p>

                {email && (
                    <div
                        className="
                            mx-auto mt-5
                            max-w-sm
                            rounded-xl
                            border border-zinc-800
                            bg-black/60
                            px-4 py-3
                            text-sm text-zinc-300
                        "
                    >
                        {email}
                    </div>
                )}

                <div className="mt-7">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={
                            !email ||
                            isResendingVerificationEmail ||
                            cooldown > 0
                        }
                        className="
                            text-sm
                            font-medium
                            text-zinc-400
                            underline-offset-4
                            transition-colors
                            hover:text-zinc-100
                            hover:underline
                            disabled:cursor-not-allowed
                            disabled:text-zinc-700
                            disabled:no-underline
                        "
                    >
                        {isResendingVerificationEmail
                            ? "Sending..."
                            : cooldown > 0
                                ? `Resend available in ${cooldown}s`
                                : "Didn't receive it? Resend email"}
                    </button>

                    {resendSuccess && (
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verification email sent
                        </p>
                    )}

                    {storeError && (
                        <p
                            role="alert"
                            className="mt-3 text-xs text-red-400"
                        >
                            {storeError}
                        </p>
                    )}
                </div>
            </>
        );
    }

    /*
     * Verifying state
     */
    if (verificationState === "verifying") {
        return (
            <>
                <div
                    className="
                        mx-auto mb-6
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        border border-zinc-800
                        bg-zinc-900
                    "
                >
                    <Loader2 className="h-7 w-7 animate-spin text-zinc-300" />
                </div>

                <h1
                    className="
                        text-2xl
                        font-semibold
                        tracking-tight
                        text-zinc-100
                    "
                >
                    Verifying your email
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                    Please wait while we verify your
                    email address.
                </p>

                <div
                    className="
                        mx-auto mt-6
                        flex max-w-sm
                        items-center justify-center
                        gap-2
                        rounded-xl
                        border border-zinc-800
                        bg-black/60
                        px-4 py-3
                        text-sm text-zinc-400
                    "
                >
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                    Verifying verification token...
                </div>
            </>
        );
    }

    /*
     * Success state
     */
    if (verificationState === "success") {
        return (
            <>
                <div
                    className="
                        mx-auto mb-6
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        border border-emerald-500/20
                        bg-emerald-500/[0.04]
                    "
                >
                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>

                <h1
                    className="
                        text-2xl
                        font-semibold
                        tracking-tight
                        text-zinc-100
                    "
                >
                    Email verified
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                    Your email address has been verified
                    successfully. Your account is ready.
                </p>

                <div
                    className="
                        mx-auto mt-6
                        flex max-w-sm
                        items-center justify-center
                        gap-2
                        rounded-xl
                        border border-emerald-500/20
                        bg-emerald-500/[0.04]
                        px-4 py-3
                        text-sm text-emerald-400
                    "
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Email verification successful
                </div>

                <Link
                    href="/login"
                    className="
                        mt-7
                        flex h-11 w-full
                        items-center justify-center
                        rounded-xl
                        bg-zinc-100
                        text-sm font-medium
                        text-zinc-950
                        transition-all
                        hover:bg-white
                    "
                >
                    Continue to login
                </Link>
            </>
        );
    }

    /*
     * Error / invalid token
     */
    return (
        <>
            <div
                className="
                    mx-auto mb-6
                    flex h-16 w-16
                    items-center justify-center
                    rounded-2xl
                    border border-red-500/20
                    bg-red-500/[0.04]
                "
            >
                <XCircle className="h-7 w-7 text-red-400" />
            </div>

            <h1
                className="
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-zinc-100
                "
            >
                Verification failed
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                {storeError ||
                    "This verification link is invalid or has expired."}
            </p>

            <div
                className="
                    mx-auto mt-6
                    flex max-w-sm
                    items-center justify-center
                    gap-2
                    rounded-xl
                    border border-red-500/20
                    bg-red-500/[0.04]
                    px-4 py-3
                    text-sm text-red-400
                "
            >
                <XCircle className="h-4 w-4" />
                Unable to verify your email
            </div>

            {email && (
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={
                        isResendingVerificationEmail ||
                        cooldown > 0
                    }
                    className="
                        mt-6
                        text-sm
                        font-medium
                        text-zinc-400
                        underline-offset-4
                        transition-colors
                        hover:text-zinc-100
                        hover:underline
                        disabled:cursor-not-allowed
                        disabled:text-zinc-700
                        disabled:no-underline
                    "
                >
                    {isResendingVerificationEmail
                        ? "Sending..."
                        : cooldown > 0
                            ? `Resend available in ${cooldown}s`
                            : "Resend verification email"}
                </button>
            )}

            {resendSuccess && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verification email sent
                </p>
            )}

            <Link
                href="/login"
                className="
                    mt-7
                    flex h-11 w-full
                    items-center justify-center
                    rounded-xl
                    border border-zinc-800
                    bg-zinc-900
                    text-sm font-medium
                    text-zinc-300
                    transition-colors
                    hover:bg-zinc-800
                    hover:text-white
                "
            >
                Go to login
            </Link>
        </>
    );
}