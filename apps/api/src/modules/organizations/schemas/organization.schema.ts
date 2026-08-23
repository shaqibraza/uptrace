import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Organization name is required")
        .max(100, "Organization name must be at most 100 characters"),
});

export const updateOrganizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Organization name is required")
        .max(100, "Organization name must be at most 100 characters"),
});