import { z } from "zod";


const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    PORT: z.coerce.number().int().positive().default(4000),

    WEB_URL: z.string().url().default("http://localhost:3000"),

    DATABASE_URL: z.string().min(1),

    BREVO_API_KEY: z.string().min(1),

    BREVO_FROM_EMAIL: z.string().email(),
    
    BREVO_FROM_NAME: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(32),
});


export const env = envSchema.parse(process.env);