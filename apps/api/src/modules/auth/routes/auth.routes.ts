import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
import { BrevoEmailProvider } from "../../../core/email/brevo.provider.js";
import { EmailService } from "../../../core/email/email.service.js";
import { SessionRepository } from "../repositories/session.repository.js";
import { TokenService } from "../services/token.service.js";

const userRepository = new UserRepository();
const emailVerificationRepository = new EmailVerificationRepository;
const emailProvider = new BrevoEmailProvider();
const emailService = new EmailService(emailProvider);
const sessionRepository = new SessionRepository();
const tokenService = new TokenService();
const authService = new AuthService(
    userRepository,
    emailVerificationRepository,
    emailService,
    sessionRepository,
    tokenService,
);
const authController = new AuthController(authService);

export function createAuthRouter() {
    const router = Router();

    router.post("/register", authController.register);

    router.get("/verify-email", authController.verifyEmail);

    router.post("/login", authController.login);

    router.post("/refresh", authController.refresh);

    return router;
}