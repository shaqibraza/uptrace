import { BrevoClient } from "@getbrevo/brevo";

import { env } from "../../config/index.js";
import type { EmailProvider, SendEmailInput } from "./email.types.js";


export class BrevoEmailProvider implements EmailProvider {
    private readonly client: BrevoClient;

    constructor() {
        this.client = new BrevoClient({
            apiKey: env.BREVO_API_KEY,
        });
    };

    async send(input: SendEmailInput): Promise<void> {
        await this.client.transactionalEmails.sendTransacEmail({
            sender: {
                email: env.BREVO_FROM_EMAIL,
                name: env.BREVO_FROM_NAME,
            },
            to: [{ email: input.to }],
            subject: input.subject,
            htmlContent: input.html,
            ...(input.text !== undefined && {
                textContent: input.text
            }),
        });
    };
};