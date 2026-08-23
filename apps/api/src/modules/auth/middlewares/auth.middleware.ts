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

        if (!authorization?.startsWith("Bearer ")) {
            return next(new AppError(
                "Authentication required",
                401,
                "AUTHENTICATION_REQUIRED",
            ),);
        }

        const token = authorization.slice(7).trim();

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const { userId } =
            await tokenService.verifyAccessToken(token);

        req.user = {
            id: userId,
        };

        return next();
    } catch (error) {
        return next(
            new AppError(
                "Invalid or expired access token",
                401,
                "INVALID_ACCESS_TOKEN",
            ),
        );
    }
}