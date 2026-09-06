import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { AppError } from "../../../core/errors/app-error.js";
import { ProjectApiKeyService } from "../../projects/services/project-api-key.service.js";

export function createTelemetryAuthMiddleware(
    projectApiKeyService: ProjectApiKeyService,
) {
    return async function requireTelemetryAuth(
        req: Request,
        _res: Response,
        next: NextFunction,
    ) {
        try {
            const apiKey = req.headers["x-uptrace-api-key"];
            if (
                typeof apiKey !== "string" ||
                !apiKey.trim()
            ) {
                return next(
                    new AppError(
                        "Telemetry API key is required",
                        401,
                        "TELEMETRY_API_KEY_REQUIRED",
                    ),
                );
            }

            const projectApiKey =
                await projectApiKeyService.authenticate(
                    apiKey,
                );

            if (!projectApiKey) {
                return next(
                    new AppError(
                        "Invalid or revoked telemetry API key",
                        401,
                        "INVALID_TELEMETRY_API_KEY",
                    ),
                );
            }

            req.telemetry = {
                projectId: projectApiKey.projectId,
                apiKeyId: projectApiKey.id,
            };

            await projectApiKeyService.markAsUsed(
                projectApiKey.id,
            );

            return next();
        } catch (error) {
            return next(error);
        }
    };
}