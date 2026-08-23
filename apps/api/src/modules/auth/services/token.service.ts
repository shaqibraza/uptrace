import { SignJWT, jwtVerify } from "jose";

import { env } from "../../../config/index.js";

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);


export class TokenService {
    async createAccessToken(userId: string): Promise<string> {
        return new SignJWT({
            sub: userId
        })
            .setProtectedHeader({
                alg: "HS256",
                typ: "JWT",
            })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(secret);
    };

    async verifyAccessToken(token: string) {
        try {
            const { payload } = await jwtVerify(token, secret, {
                algorithms: ["HS256"]
            });

            if (typeof payload.sub !== "string") {
                throw new Error("Invalid access token");
            };

            return {
                userId: payload.sub
            };
        } catch (error) {
            throw error;
        }
    };
};