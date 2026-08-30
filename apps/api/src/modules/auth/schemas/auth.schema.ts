import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(3).max(100),

    email: z.string().trim().email().max(255),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password must be less than 128 characters.")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter.",
        )
        .regex(
            /[a-z]/,
            "Password must contain at least one lowercase letter.",
        )
        .regex(
            /[0-9]/,
            "Password must contain at least one number.",
        )
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character.",
        ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().trim().email().max(255),

    password: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;