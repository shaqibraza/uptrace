import { hash } from "@node-rs/argon2";
import { UserRepository } from "../repositories/user.repository.js";
import type { RegisterInput } from "../schemas/auth.schema.js";
import type { EmailVerificationRepository } from "../repositories/email-verification.repository.js";
import type { EmailService } from "../../../core/email/email.service.js";
import { buildVerificationEmail } from "../../../core/email/templates/verification-email.js";
import { env } from "../../../config/env.js";


export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailVerificationRepository: EmailVerificationRepository,
        private readonly emailService: EmailService
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

    async verifyEmail(rawToken: string){
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
    }
}