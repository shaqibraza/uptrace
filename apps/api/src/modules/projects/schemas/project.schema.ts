import { z } from "zod";

export const createProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Project name is required")
        .max(100, "Project name must be at most 100 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "Description must be at most 1000 characters")
        .optional(),
});

export const updateProjectSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Project name is required")
            .max(100, "Project name must be at most 100 characters")
            .optional(),

        description: z
            .string()
            .trim()
            .max(1000, "Description must be at most 1000 characters")
            .nullable()
            .optional(),
    })
    .refine(
        (data) =>
            data.name !== undefined ||
            data.description !== undefined,
        {
            message: "At least one field is required",
        },
    );