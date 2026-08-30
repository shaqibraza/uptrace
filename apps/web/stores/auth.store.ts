import { create } from "zustand";

import {
    register as registerApi,
    verifyEmail as verifyEmailApi,
    resendVerificationEmail as resendVerificationEmailApi,
    login as loginApi,
    refresh as refreshApi,
    getCurrentUser as getCurrentUserApi,
    logout as logoutApi,
    type RegisterPayload,
    type LoginPayload,
    type LoginUser,
} from "../lib/api/auth.api";


type AuthStatus =
    | "unknown"
    | "authenticated"
    | "unauthenticated";

type AuthState = {
    status: AuthStatus;

    user: LoginUser | null;

    accessToken: string | null;

    isInitializing: boolean;

    isRegistering: boolean;

    isVerifyingEmail: boolean;

    isResendingVerificationEmail: boolean;

    isLoggingIn: boolean;

    isLoggingOut: boolean;

    error: string | null;

    emailVerificationRequired: boolean;

    initializeAuth: () => Promise<void>;

    register: (
        payload: RegisterPayload,
    ) => Promise<boolean>;

    verifyEmail: (
        token: string,
    ) => Promise<boolean>;

    resendVerificationEmail: (
        email: string,
    ) => Promise<boolean>;

    login: (
        payload: LoginPayload,
    ) => Promise<boolean>;

    logout: () => Promise<void>;

    clearError: () => void;

    reset: () => void;
};


export const useAuthStore = create<AuthState>(
    (set) => ({
        status: "unknown",

        user: null,
        accessToken: null,

        isInitializing: true,
        isRegistering: false,
        isVerifyingEmail: false,
        isResendingVerificationEmail: false,
        isLoggingIn: false,
        isLoggingOut: false,

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

        resendVerificationEmail: async (email: string) => {
            set({
                isResendingVerificationEmail: true,
                error: null,
            });

            try {
                await resendVerificationEmailApi({
                    email: email.trim().toLowerCase(),
                });

                set({
                    isResendingVerificationEmail: false,
                    error: null,
                });

                return true;
            } catch (error) {
                const message = getApiErrorMessage(error);

                set({
                    isResendingVerificationEmail: false,
                    error: message,
                });

                return false;
            }
        },

        login: async (payload) => {
            set({
                isLoggingIn: true,
                error: null,
            });

            try {
                const response = await loginApi(payload);

                set({
                    status: "authenticated",
                    user: response.data.user,
                    accessToken: response.data.accessToken,
                    isLoggingIn: false,
                    error: null,
                });

                return true;
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    status: "unauthenticated",
                    user: null,
                    accessToken: null,
                    isLoggingIn: false,
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

        initializeAuth: async () => {
            set({
                isInitializing: true,
                error: null,
            });

            try {
                const refreshResponse =
                    await refreshApi();

                const accessToken =
                    refreshResponse.data.accessToken;

                const meResponse =
                    await getCurrentUserApi(accessToken);

                set({
                    status: "authenticated",
                    user: meResponse.data.user,
                    accessToken,
                    isInitializing: false,
                    error: null,
                });
            } catch {
                set({
                    status: "unauthenticated",
                    user: null,
                    accessToken: null,
                    isInitializing: false,
                    error: null,
                });
            }
        },

        logout: async () => {
            set({
                isLoggingOut: true,
                error: null,
            });

            try {
                await logoutApi();

                set({
                    status: "unauthenticated",
                    user: null,
                    accessToken: null,
                    isLoggingOut: false,
                    error: null,
                });
            } catch (error) {
                const message =
                    getApiErrorMessage(error);

                set({
                    isLoggingOut: false,
                    error: message,
                });
            }
        },

        reset: () => {
            set({
                status: "unauthenticated",
                user: null,
                accessToken: null,
                isInitializing: false,
                isRegistering: false,
                isVerifyingEmail: false,
                isResendingVerificationEmail: false,
                isLoggingIn: false,
                isLoggingOut: false,
                error: null,
                emailVerificationRequired: false,
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