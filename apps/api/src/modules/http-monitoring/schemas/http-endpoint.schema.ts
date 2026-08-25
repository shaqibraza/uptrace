import { z } from "zod";

export const createHttpEndpointSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Endpoint name is required")
        .max(100, "Endpoint name must be at most 100 characters"),

    url: z
        .url("Invalid URL"),

    method: z.enum([
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS",
    ]),

    expectedStatusCode: z
        .number()
        .int()
        .min(100)
        .max(599)
        .default(200),

    intervalSeconds: z
        .number()
        .int()
        .positive()
        .default(60),

    timeoutMs: z
        .number()
        .int()
        .positive()
        .default(5000),
});


export const updateHttpEndpointSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Endpoint name is required")
        .max(100, "Endpoint name must be at most 100 characters")
        .optional(),

    url: z
        .url("Invalid URL")
        .optional(),

    method: z
        .enum([
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "HEAD",
            "OPTIONS",
        ])
        .optional(),

    expectedStatusCode: z
        .number()
        .int()
        .min(100)
        .max(599)
        .optional(),

    intervalSeconds: z
        .number()
        .int()
        .positive()
        .optional(),

    timeoutMs: z
        .number()
        .int()
        .positive()
        .optional(),

    isActive: z
        .boolean()
        .optional(),
});