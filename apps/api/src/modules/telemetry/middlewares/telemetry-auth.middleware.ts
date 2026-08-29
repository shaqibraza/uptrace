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
        console.log("=== TELEMETRY MIDDLEWARE HIT ===");
        try {
            const apiKey = req.headers["x-uptrace-api-key"];
            console.log("RAW API KEY:", JSON.stringify(apiKey));
            console.log("TELEMETRY AUTH HEADER:", {
                type: typeof apiKey,
                prefix:
                    typeof apiKey === "string"
                        ? apiKey.slice(0, 11)
                        : null,
                length:
                    typeof apiKey === "string"
                        ? apiKey.length
                        : null,
            });

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

            console.log("=== TELEMETRY AUTH RESULT ===", {
                found: !!projectApiKey,
                id: projectApiKey?.id,
                projectId: projectApiKey?.projectId,
                revokedAt: projectApiKey?.revokedAt,
            });

            if (!projectApiKey) {
                return next(
                    new AppError(
                        "Invalid or revoked telemetry API key",
                        401,
                        "INVALID_TELEMETRY_API_KEY",
                    ),
                );
            }

            console.log("=== TELEMETRY AUTH SUCCESS ===", {
                projectId: projectApiKey.projectId,
                apiKeyId: projectApiKey.id,
            });

            req.telemetry = {
                projectId: projectApiKey.projectId,
                apiKeyId: projectApiKey.id,
            };

            await projectApiKeyService.markAsUsed(
                projectApiKey.id,
            );

            console.log("=== TELEMETRY CALLING NEXT ===");

            return next();
        } catch (error) {
            return next(error);
        }
    };
}