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
            throw new Error("User not found");
        };

        await this.emailVerificationRepository.markUsed(token.id);

        return user;
    };

    async login(input: LoginInput) {
        const email = input.email.toLowerCase();

        const user = await this.userRepository.findByEmail(email);

        if (!user || !user.passwordHash) {
            throw new Error("Invalid email or password");
        };

        const passwordValid = await verify(
            user.passwordHash,
            input.password
        );
        if (!passwordValid) {
            throw new Error("Invalid email or password");
        };

        if (!user.emailVerifiedAt) {
            throw new Error("Email address is not verified");
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

    async refresh(refreshToken: string){
        const session = await this.sessionRepository.rotate(refreshToken);

        if (!session) {
            throw new Error("Invalid or expired refresh token");
        };

        const accessToken = await this.tokenService.createAccessToken(session.userId);

        return {
            accessToken,
            refreshToken: session.rawToken
        };
    };
};