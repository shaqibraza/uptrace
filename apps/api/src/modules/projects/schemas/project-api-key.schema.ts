import { z } from "zod";

export const createProjectApiKeySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "API key name is required")
        .max(
            100,
            "API key name must be at most 100 characters",
        ),
});