import { api } from "./axios";

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

export type RegisterResponse = {
    success: true;
    data: {
        message: string;
    };
};

export async function register(
    payload: RegisterPayload,
): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
        "/auth/register",
        payload
    );

    return response.data;
};


export type VerifyEmailResponse = {
    success: true;
    data: {
        message: string;
        user?: {
            id: string;
            email: string;
            emailVerifiedAt: string | null;
        };
    };
};

export async function verifyEmail(
    token: string
): Promise<VerifyEmailResponse> {
    const response = await api.get<VerifyEmailResponse>("/auth/verify-email", {
        params: {
            token,
        },
    });

    return response.data;
}

export type ResendVerificationPayload = {
    email: string;
};

export type ResendVerificationResponse = {
    success: true;
    data: {
        message: string;
    };
};

export async function resendVerificationEmail(
    payload: ResendVerificationPayload
): Promise<ResendVerificationResponse> {
    const response = await api.post<ResendVerificationResponse>("/auth/resend-verification", payload);

    return response.data;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginUser = {
    id: string;
    name: string;
    email: string;
    emailVerifiedAt: string | null;
};

export type LoginResponse = {
    success: true;
    data: {
        accessToken: string;
        user: LoginUser;
    };
};

export async function login(
    payload: LoginPayload
): Promise<LoginResponse> {
    const response = await api
        .post(
            "/auth/login",
            payload
        );

    return response.data;
};

export type RefreshResponse = {
    success: true;
    data: {
        accessToken: string;
    };
};

export async function refresh(): Promise<RefreshResponse> {
    const response =
        await api.post<RefreshResponse>(
            "/auth/refresh",
        );

    return response.data;
};

export type MeResponse = {
    success: true;
    data: {
        user: LoginUser;
    };
};

export async function getCurrentUser(
    accessToken: string,
): Promise<MeResponse> {
    const response =
        await api.get<MeResponse>(
            "/auth/me",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        );

    return response.data;
}

export type LogoutResponse = {
    success: true;
};

export async function logout(): Promise<LogoutResponse> {
    const response =
        await api.post<LogoutResponse>(
            "/auth/logout",
        );

    return response.data;
};
