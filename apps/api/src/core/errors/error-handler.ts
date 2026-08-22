import type { ErrorRequestHandler } from "express";
import { env } from "../../config/env.js";
import { AppError } from "./app-error.js";


export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message
            }
        });

        return;
    };

    console.log(error);

    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
                env.NODE_ENV === "production"
                    ? "An unexpected error occurred."
                    : error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
        },
    })
}