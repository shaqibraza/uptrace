import { hash } from "@node-rs/argon2";
import { UserRepository } from "../repositories/user.repository.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";
import type { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
import type { EmailService } from "../../../core/email/email.service.js";
import { buildVerificationEmail } from "../../../core/email/templates/verification-email.js";
import { env } from "../../../config/env.js";
import { verify } from "@node-rs/argon2";
import { SessionRepository } from "../repositories/session.repository.js";
import { TokenService } from "./token.service.js";
import { AppError } from "../../../core/errors/app-error.js";


export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailVerificationRepository: EmailVerificationRepository,
        private readonly emailService: EmailService,
        private readonly sessionRepository: SessionRepository,
        private readonly tokenService: TokenService,
    ) { };

    async register(input: RegisterInput) {
        const email = input.email.toLowerCase();

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new Error("User already exists");
        };

        const passwordHash = await hash(input.password);

        const user = await this.userRepository.create({
            name: input.name,
            email,
            passwordHash
        });

        const { rawToken } = await this.emailVerificationRepository.create(user.id)

        const verificationUrl = `${env.WEB_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;

        const emailContent = buildVerificationEmail({ verificationUrl });

        await this.emailService.send({
            to: user?.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
        })

        return {
            message: "Verification email sent",
        };
    };

    async verifyEmail(rawToken: string) {
        const token = await this.emailVerificationRepository.findValidToken(rawToken);
        if (!token) {
            throw new Error("Invalid or expired verification token");
        };

        const user = await this.userRepository.markEmailVerified(token.userId);
        if (!user) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND",
            );
        };

        await this.emailVerificationRepository.markUsed(token.id);

        return user;
    };

    async resendVerificationEmail(email: string) {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.userRepository.findByEmail(normalizedEmail);

        const genericResponse = {
            message: "If an unverified account exists, a verification email has been sent"
        };

        if (!user) {
            return genericResponse;
        };

        if (user.emailVerifiedAt) {
            return genericResponse;
        };

        await this.emailVerificationRepository.invalidateUnusedTokens(user.id);

        const { rawToken } = await this.emailVerificationRepository.create(user.id);

        const verificationUrl = `${env.WEB_URL}/verify-email?token=${encodeURIComponent(
            rawToken,
        )}`;

        const emailContent = buildVerificationEmail({verificationUrl});

        await this.emailService.send({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
        });

        return {
            message: "Verification email sent"
        };
    };

    async login(input: LoginInput) {
        const email = input.email.toLowerCase();

        const user = await this.userRepository.findByEmail(email);

        if (!user || !user.passwordHash) {
            throw new AppError(
                "Invalid email or password",
                401,
                "INVALID_CREDENTIALS",
            );
        };

        const passwordValid = await verify(
            user.passwordHash,
            input.password
        );
        if (!passwordValid) {
            throw new AppError(
                "Invalid email or password",
                401,
                "INVALID_CREDENTIALS",
            );
        };

        if (!user.emailVerifiedAt) {
            throw new AppError(
                "Email address is not verified",
                403,
                "EMAIL_NOT_VERIFIED",
            );
        };

        const session = await this.sessionRepository.create(user.id);

        const accessToken = await this.tokenService.createAccessToken(user.id);

        return {
            accessToken,
            refreshToken: session.rawToken,
            user: {
                id: user.id,
                email: user.email,
                emailVerifiedAt: user.emailVerifiedAt,
            }
        }
    };

    async refresh(refreshToken: string) {
        const result = await this.sessionRepository.rotate(refreshToken);

        if (result.status === "invalid") {
            throw new AppError(
                "Invalid refresh token",
                401,
                "INVALID_REFRESH_TOKEN",
            );
        };

        if (result.status === "reused") {
            await this.sessionRepository.revokeFamily(
                result.familyId,
            );

            throw new AppError(
                "Refresh token reuse detected",
                401,
                "REFRESH_TOKEN_REUSED",
            );
        }

        const accessToken = await this.tokenService.createAccessToken(result.userId);

        return {
            accessToken,
            refreshToken: result.rawToken
        };
    };

    async getCurrentUser(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND",
            );
        };

        return user;
    }

    async logout(refreshToken: string) {
        await this.sessionRepository.revokeByRefreshToken(refreshToken);
    }
};