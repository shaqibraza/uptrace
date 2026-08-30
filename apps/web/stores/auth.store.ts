import { create } from "zustand";

import {
    register as registerApi,
    verifyEmail as verifyEmailApi,
    type RegisterPayload,
} from "../lib/api/auth.api";

type AuthStatus =
    | "unknown"
    | "authenticated"
    | "unauthenticated";

type AuthState = {
    status: AuthStatus;

    isRegistering: boolean;

    isVerifyingEmail: boolean;

    error: string | null;

    emailVerificationRequired: boolean;

    register: (payload: RegisterPayload) => Promise<boolean>;

    verifyEmail: (token: string) => Promise<boolean>;

    clearError: () => void;

    reset: () => void;
};


export const useAuthStore = create<AuthState>(
    (set) => ({
        status: "unauthenticated",
        isRegistering: false,
        isVerifyingEmail: false,
        error: null,
        emailVerificationRequired: false,

        register: async (payload) => {
            set({
                isRegistering: true,
                error: null,
                emailVerificationRequired: false,
            });

            try {
                await registerApi(payload);

                set({
                    status: "unauthenticated",
                    isRegistering: false,
                    error: null,
                    emailVerificationRequired: true,
                });

                return true;
            } catch (error) {
                const message = getApiErrorMessage(error);

                set({
                    isRegistering: false,
                    error: message,
                    emailVerificationRequired: false,
                });
                return false;
            }
        },

        verifyEmail: async (token) => {
            set({
                isVerifyingEmail: true,
                error: null
            });
            try {
                await verifyEmailApi(token);

                set({
                    isVerifyingEmail: false,
                    error: null,
                });

                return true;
            } catch (error) {
                const message = getApiErrorMessage(error);

                set({
                    isVerifyingEmail: false,
                    error: message,
                });

                return false;
            }
        },

        clearError: () => {
            set({
                error: null,
            });
        },

        reset: () => {
            set({
                status: "unauthenticated",
                isRegistering: false,
                isVerifyingEmail: false,
                error: null,
                emailVerificationRequired: false
            });
        },
    }),
);


function getApiErrorMessage(
    error: unknown,
): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: {
                    data?: {
                        error?: {
                            message?: string;
                        };
                    };
                };
            }
        ).response;

        const message =
            response?.data?.error?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}