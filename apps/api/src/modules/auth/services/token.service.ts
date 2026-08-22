import { SignJWT } from "jose";

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
    }
}