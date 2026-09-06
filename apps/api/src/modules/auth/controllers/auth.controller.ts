import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    registerSchema,
    loginSchema,
    updateNameSchema,
} from "../schemas/auth.schema.js";

import { AuthService } from "../services/auth.service.js";

import { env } from "../../../config/index.js";

import { uploadProfileImage } from "../../../core/upload/cloudinary-upload.js";

export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    register = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const input =
                registerSchema.parse(req.body);

            const user =
                await this.authService.register(input);

            return res.status(201).json({
                success: true,
                data: {
                    message: user.message,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    verifyEmail = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const token = req.query.token;

            if (
                !token ||
                typeof token !== "string"
            ) {
                throw new Error(
                    "Verification token is required",
                );
            }

            const user =
                await this.authService.verifyEmail(
                    token,
                );

            return res.status(200).json({
                success: true,
                data: {
                    message:
                        "Email verified successfully",
                    user: {
                        id: user.id,
                        email: user.email,
                        emailVerifiedAt:
                            user.emailVerifiedAt,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    };

    resendVerificationEmail = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { email } = req.body;

            if (
                typeof email !== "string" ||
                !email.trim()
            ) {
                throw new Error(
                    "Email is required",
                );
            }

            const result =
                await this.authService.resendVerificationEmail(
                    email,
                );

            return res.status(200).json({
                success: true,
                data: {
                    message: result.message,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const input =
                loginSchema.parse(req.body);

            const result =
                await this.authService.login(input);

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure:
                    env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/auth",
            });

            res.cookie(
                "refreshToken",
                result.refreshToken,
                {
                    httpOnly: true,
                    secure:
                        env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/auth",
                    expires: new Date(
                        Date.now() +
                            30 *
                                24 *
                                60 *
                                60 *
                                1000,
                    ),
                },
            );

            res.status(200).json({
                success: true,
                data: {
                    accessToken:
                        result.accessToken,
                    user: result.user,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    refresh = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const refreshToken =
                req.cookies.refreshToken;

            if (
                !refreshToken ||
                typeof refreshToken !== "string"
            ) {
                throw new Error(
                    "Refresh token is required",
                );
            }

            const result =
                await this.authService.refresh(
                    refreshToken,
                );

            res.cookie(
                "refreshToken",
                result.refreshToken,
                {
                    httpOnly: true,
                    secure:
                        env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/auth",
                    expires: new Date(
                        Date.now() +
                            30 *
                                24 *
                                60 *
                                60 *
                                1000,
                    ),
                },
            );

            res.status(200).json({
                success: true,
                data: {
                    accessToken:
                        result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    me = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new Error(
                    "Authentication required",
                );
            }

            const user =
                await this.authService.getCurrentUser(
                    req.user.id,
                );

            res.status(200).json({
                success: true,
                data: {
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update only the authenticated user's name.
     */
    updateName = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new Error(
                    "Authentication required",
                );
            }

            const input =
                updateNameSchema.parse(req.body);

            const user =
                await this.authService.updateName(
                    req.user.id,
                    input.name,
                );

            return res.status(200).json({
                success: true,
                data: {
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Upload and update only the authenticated user's
     * profile image.
     */
    updateProfileImage = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new Error(
                    "Authentication required",
                );
            }

            if (!req.file) {
                throw new Error(
                    "Profile image is required",
                );
            }

            const result =
                await uploadProfileImage(
                    req.file.buffer,
                );

            const user =
                await this.authService.updateProfileImage(
                    req.user.id,
                    result.secureUrl,
                );

            return res.status(200).json({
                success: true,
                data: {
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const refreshToken =
                req.cookies?.refreshToken;

            if (refreshToken) {
                await this.authService.logout(
                    refreshToken,
                );
            }

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure:
                    env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/auth",
            });

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}