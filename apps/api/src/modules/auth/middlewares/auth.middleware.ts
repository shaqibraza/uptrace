import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { TokenService } from "../services/token.service.js";
import { AppError } from "../../../core/errors/app-error.js";

const tokenService = new TokenService();

export async function requireAuth(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    try {
        const authorization = req.headers.authorization;
        console.log("=== REQUIRE AUTH DEBUG ===");
        console.log("Authorization exists:", !!authorization);
        console.log(
            "Authorization prefix:",
            authorization?.slice(0, 20),
        );
        if (!authorization?.startsWith("Bearer ")) {
            return next(new AppError(
                "Authentication required",
                401,
                "AUTHENTICATION_REQUIRED",
            ),);
        }

        const token = authorization.slice(7).trim();
        console.log("Token exists:", !!token);
        console.log("Token length:", token.length);
        if (!token) {
            return next(new Error("Authentication required"));
        }

        console.log("=== AUTH DEBUG ===");
        console.log("AUTH HEADER:", req.headers.authorization);
        console.log("TOKEN LENGTH:", token.length);

        const { userId } =
            await tokenService.verifyAccessToken(token);
        console.log("JWT VERIFIED, USER ID:", userId);
        console.log("VERIFIED USER ID:", userId);

        req.user = {
            id: userId,
        };

        return next();
    } catch (error) {
        console.error("=== JWT VERIFY FAILED ===");
        console.error("=== AUTH VERIFY ERROR ===");
        console.error(error);

        return next(
            new AppError(
                "Invalid or expired access token",
                401,
                "INVALID_ACCESS_TOKEN",
            ),
        );
    }
}