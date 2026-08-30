"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../stores/auth.store";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const router = useRouter();

    const status = useAuthStore((state) => state.status);
    const isInitializing = useAuthStore(
        (state) => state.isInitializing,
    );

    useEffect(() => {
        if (
            !isInitializing &&
            status === "unauthenticated"
        ) {
            router.replace("/login");
        }
    }, [isInitializing, status, router]);

    if (isInitializing || status === "unknown") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
                    Loading...
                </div>
            </div>
        );
    }

    if (status !== "authenticated") {
        return null;
    }

    return <>{children}</>;
}