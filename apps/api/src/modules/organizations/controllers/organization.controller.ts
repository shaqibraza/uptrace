import type { Request, Response, NextFunction } from "express";

import { createOrganizationSchema, updateOrganizationSchema } from "../schemas/organization.schema.js";
import { OrganizationService } from "../services/organization.service.js";
import { AppError } from "../../../core/errors/app-error.js";


export class OrganizationController {
    constructor(
        private readonly organizationService: OrganizationService,
    ) { };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.id) {
                throw new Error("Authentication required");
            };

            const input = createOrganizationSchema.parse(req.body);

            const organization = await this.organizationService.create({
                name: input.name,
                userId: req.user.id
            });

            return res.status(201).json({
                success: true,
                data: {
                    organization
                }
            });
        } catch (error) {
            next(error);
        };
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.id) {
                throw new Error("Authentication required");
            };

            const organizations = await this.organizationService.getUserOrganizations(req.user.id);

            return res.status(200).json({
                success: true,
                data: {
                    organizations
                }
            });
        } catch (error) {
            next(error);
        };
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
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
                throw new Error("Organization ID is required");
            };

            await this.organizationService.ensureMember(
                organizationId,
                req.user.id,
            );

            const organization = await this.organizationService.getById(organizationId);

            if (!organization) {
                throw new Error("Organization not found")
            };

            return res.status(200).json({
                success: true,
                data: {
                    organization
                }
            });
        } catch (error) {
            next(error);
        };
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

            const { organizationId } = req.params;

            if (!organizationId || typeof organizationId !== "string") {
                throw new AppError(
                    "Organization ID is required",
                    400,
                    "INVALID_ORGANIZATION_ID",
                );
            }

            const input =
                updateOrganizationSchema.parse(req.body);

            const organization =
                await this.organizationService.update(
                    organizationId,
                    req.user.id,
                    input,
                );

            return res.status(200).json({
                success: true,
                data: {
                    organization,
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

            const { organizationId } = req.params;

            if (!organizationId || typeof organizationId !== "string") {
                throw new AppError(
                    "Organization ID is required",
                    400,
                    "INVALID_ORGANIZATION_ID",
                );
            }

            await this.organizationService.delete(
                organizationId,
                req.user.id,
            );

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
};