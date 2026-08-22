import type { EmailProvider, SendEmailInput } from "./email.types.js";


export class EmailService {
    constructor(
        private readonly provider: EmailProvider,
    ){};

    async send(input: SendEmailInput): Promise<void>{
        await this.provider.send(input)
    }
}