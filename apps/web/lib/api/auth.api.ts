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
): Promise<RegisterResponse>{
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
    };
};

export async function verifyEmail(
    token: string
): Promise<VerifyEmailResponse>{
    const response = await api.get("/auth/verify-email", {
        params: {
            token,
        },
    });

    return response.data;
}