import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";
import { env } from "../../../config/index.js";
import { loginSchema } from "../schemas/auth.schema.js";


export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { };

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input = registerSchema.parse(req.body);

            const user = await this.authService.register(input);

            return res.status(201).json({
                success: true,
                data: {
                    message: user.message,
                }
            })
        } catch (error) {
            next(error);
        };
    };

    verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.query.token;
            if (!token || typeof token !== "string") {
                throw new Error("Verification token is required");
            };

            const user = await this.authService.verifyEmail(token);

            return res.status(200).json({
                success: true,
                data: {
                    message: "Email verified successfully",
                    user: {
                        id: user.id,
                        email: user.email,
                        emailVerifiedAt: user.emailVerifiedAt
                    },
                },
            });
        } catch (error) {
            next(error);
        };
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input = loginSchema.parse(req.body);
            const result = await this.authService.login(input);

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/auth/refresh",
            });

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/auth",
                expires: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                ),
            });

            res.status(200).json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    user: result.user
                },
            });
        } catch (error) {
            next(error);
        };
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken || typeof refreshToken !== "string") {
                throw new Error("Refresh token is required");
            };

            const result = await this.authService.refresh(refreshToken);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/auth",
                expires: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                ),
            });

            res.status(200).json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        };
    };
};