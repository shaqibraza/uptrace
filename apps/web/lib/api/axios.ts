import axios from "axios";
import { getAccessToken } from "../token";

export const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000",

    headers: {
        "Content-Type": "application/json",
    },

    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);