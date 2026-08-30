"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "../../stores/auth.store";

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const initializeAuth = useAuthStore(
        (state) => state.initializeAuth,
    );

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) {
            return;
        }

        initialized.current = true;

        void initializeAuth();
    }, [initializeAuth]);

    return children;
}