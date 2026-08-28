import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../../core/errors/app-error.js";
import { createProjectApiKeySchema } from "../schemas/project-api-key.schema.js";
import { ProjectApiKeyService } from "../services/project-api-key.service.js";


export class ProjectApiKeyController {
    constructor(
        private readonly projectApiKeyService: ProjectApiKeyService,
    ){};

    create = async (req: Request, res: Response, next: NextFunction ) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            };

            const { projectId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            };

            const input = createProjectApiKeySchema.parse(req.body);

            const apiKey = await this.projectApiKeyService.create({
                projectId,
                userId: req.user.id,
                name: input.name
            });

            return res.status(201).json({
                success: true,
                data: {
                    apiKey,
                }
            });
        } catch (error) {
            next(error);
        };
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            };

            const { projectId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            };

            const apiKeys = await this.projectApiKeyService.list({
                projectId,
                userId: req.user.id
            });

            return res.status(200).json({
                success: true,
                data: {
                    apiKeys
                }
            });
        } catch (error) {
            next(error);
        };
    };

    revoke = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            }

            const { projectId, apiKeyId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            };

            if (!apiKeyId || typeof apiKeyId !== "string") {
                throw new AppError(
                    "API key ID is required",
                    400,
                    "INVALID_API_KEY_ID",
                );
            };

            const apiKey = await this.projectApiKeyService.revoke({
                projectId,
                apiKeyId,
                userId: req.user.id
            });

            return res.status(200).json({
                success: true,
                data: {

                    apiKey
                }
            });
        } catch (error) {
            next(error);
        };
    };
};