import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){};

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
};