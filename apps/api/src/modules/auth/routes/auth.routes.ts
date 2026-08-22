import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
import { BrevoEmailProvider } from "../../../core/email/brevo.provider.js";
import { EmailService } from "../../../core/email/email.service.js";

const userRepository = new UserRepository();
const emailVerificationRepository = new EmailVerificationRepository;
const emailProvider = new BrevoEmailProvider();
const emailService = new EmailService(emailProvider);
const authService = new AuthService(
    userRepository,
    emailVerificationRepository,
    emailService
);
const authController = new AuthController(authService);

export function createAuthRouter(){
    const router = Router();

    router.post("/register", authController.register);

    router.get("/verify-email", authController.verifyEmail);

    return router;
}