import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../../core/errors/app-error.js";
import {
    createProjectSchema,
    updateProjectSchema,
} from "../schemas/project.schema.js";

import { ProjectService } from "../services/project.service.js";


export class ProjectController {
    constructor(
        private readonly projectService: ProjectService,
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

            const { organizationId } = req.params;

            if (!organizationId || typeof organizationId !== "string") {
                throw new AppError(
                    "Organization ID is required",
                    400,
                    "INVALID_ORGANIZATION_ID",
                );
            };

            const input = createProjectSchema.parse(req.body);

            const project = await this.projectService.create({
                organizationId,
                userId: req.user.id,
                name: input.name,
                ...(input.description !== undefined ? { description: input.description } : {})
            });

            return res.status(201).json({
                success: true,
                data: {
                    project
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
            }

            const { organizationId } = req.params;

            if (!organizationId || typeof organizationId !== "string") {
                throw new AppError(
                    "Organization ID is required",
                    400,
                    "INVALID_ORGANIZATION_ID",
                );
            };

            const projects = await this.projectService.getOrganizationProjects(organizationId, req.user.id);

            return res.status(200).json({
                success: true,
                data: {
                    projects
                }
            });
        } catch (error) {
            next(error);
        };
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

            const { projectId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            }

            const project =
                await this.projectService.getById(
                    projectId,
                    req.user.id,
                );

            return res.status(200).json({
                success: true,
                data: {
                    project,
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

            const { projectId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            }

            const input =
                updateProjectSchema.parse(req.body);

            const project =
                await this.projectService.update(
                    projectId,
                    req.user.id,
                    {
                        ...(input.name !== undefined
                            ? { name: input.name }
                            : {}),
                        ...(input.description !== undefined
                            ? { description: input.description }
                            : {}),
                    },
                );

            return res.status(200).json({
                success: true,
                data: {
                    project,
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

            const { projectId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            }

            await this.projectService.delete(
                projectId,
                req.user.id,
            );

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}