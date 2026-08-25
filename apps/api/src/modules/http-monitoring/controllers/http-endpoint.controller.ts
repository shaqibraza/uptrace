import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../../core/errors/app-error.js";
import { createHttpEndpointSchema, updateHttpEndpointSchema } from "../schemas/http-endpoint.schema.js";
import { HttpEndpointService } from "../services/http-endpoint.service.js";



export class HttpEndpointController {
    constructor(
        private readonly httpEndpointService: HttpEndpointService,
    ) { };

    create = async (req: Request, res: Response, next: NextFunction) => {
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

            const input = createHttpEndpointSchema.parse(req.body);

            const endpoint = await this.httpEndpointService.create({
                projectId,
                userId: req.user.id,
                name: input.name,
                url: input.url,
                method: input.method,
                expectedStatusCode: input.expectedStatusCode,
                intervalSeconds: input.intervalSeconds,
                timeoutMs: input.timeoutMs,
            });

            return res.status(201).json({
                success: true,
                data: {
                    endpoint
                }
            });
        } catch (error) {
            next(error);
        };
    };

    list = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            }

            const { projectId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            }

            const endpoints =
                await this.httpEndpointService.listByProject({
                    projectId,
                    userId: req.user.id,
                });

            return res.status(200).json({
                success: true,
                data: {
                    endpoints,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            }

            const { endpointId } = req.params;

            if (!endpointId || typeof endpointId !== "string") {
                throw new AppError(
                    "HTTP endpoint ID is required",
                    400,
                    "INVALID_HTTP_ENDPOINT_ID",
                );
            }

            const endpoint =
                await this.httpEndpointService.getById({
                    endpointId,
                    userId: req.user.id,
                });

            return res.status(200).json({
                success: true,
                data: {
                    endpoint,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            }

            const { endpointId } = req.params;

            if (!endpointId || typeof endpointId !== "string") {
                throw new AppError(
                    "HTTP endpoint ID is required",
                    400,
                    "INVALID_HTTP_ENDPOINT_ID",
                );
            }

            const input =
                updateHttpEndpointSchema.parse(req.body);

            const endpoint =
                await this.httpEndpointService.update({
                    endpointId,
                    userId: req.user.id,
                    ...(input.name !== undefined
                        ? { name: input.name }
                        : {}),
                    ...(input.url !== undefined
                        ? { url: input.url }
                        : {}),
                    ...(input.method !== undefined
                        ? { method: input.method }
                        : {}),
                    ...(input.expectedStatusCode !== undefined
                        ? {
                            expectedStatusCode:
                                input.expectedStatusCode,
                        }
                        : {}),
                    ...(input.intervalSeconds !== undefined
                        ? {
                            intervalSeconds:
                                input.intervalSeconds,
                        }
                        : {}),
                    ...(input.timeoutMs !== undefined
                        ? {
                            timeoutMs: input.timeoutMs,
                        }
                        : {}),
                    ...(input.isActive !== undefined
                        ? { isActive: input.isActive }
                        : {}),
                });

            return res.status(200).json({
                success: true,
                data: {
                    endpoint,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user?.id) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            }

            const { endpointId } = req.params;

            if (!endpointId || typeof endpointId !== "string") {
                throw new AppError(
                    "HTTP endpoint ID is required",
                    400,
                    "INVALID_HTTP_ENDPOINT_ID",
                );
            }

            await this.httpEndpointService.delete({
                endpointId,
                userId: req.user.id,
            });

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
};