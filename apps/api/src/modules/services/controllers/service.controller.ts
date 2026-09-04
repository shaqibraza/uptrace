import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { AppError } from "../../../core/errors/app-error.js";
import { ServiceService } from "../services/service.service.js";

export class ServiceController {
    constructor(
        private readonly serviceService: ServiceService,
    ) {}

    async list(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.user?.id;
            const projectId = req.params.projectId;

            if (
                !userId ||
                typeof userId !== "string"
            ) {
                throw new AppError(
                    "Authentication required",
                    401,
                );
            }

            if (
                !projectId ||
                typeof projectId !== "string"
            ) {
                throw new AppError(
                    "Project ID is required",
                    400,
                );
            }

            const startTime =
                this.parseDate(
                    req.query.startTime,
                    "startTime",
                );

            const endTime =
                this.parseDate(
                    req.query.endTime,
                    "endTime",
                );

            this.validateDateRange(
                startTime,
                endTime,
            );

            const options: {
                startTime?: Date;
                endTime?: Date;
            } = {};

            if (startTime) {
                options.startTime = startTime;
            }

            if (endTime) {
                options.endTime = endTime;
            }

            const services =
                await this.serviceService.listServices(
                    projectId,
                    userId,
                    options,
                );

            return res.status(200).json({
                success: true,
                data: {
                    services,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getDetail(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.user?.id;
            const projectId =
                req.params.projectId;

            const serviceName =
                req.params.serviceName;

            if (
                !userId ||
                typeof userId !== "string"
            ) {
                throw new AppError(
                    "Authentication required",
                    401,
                );
            }

            if (
                !projectId ||
                typeof projectId !== "string"
            ) {
                throw new AppError(
                    "Project ID is required",
                    400,
                );
            }

            if (
                !serviceName ||
                typeof serviceName !== "string"
            ) {
                throw new AppError(
                    "Service name is required",
                    400,
                );
            }

            const startTime =
                this.parseDate(
                    req.query.startTime,
                    "startTime",
                );

            const endTime =
                this.parseDate(
                    req.query.endTime,
                    "endTime",
                );

            this.validateDateRange(
                startTime,
                endTime,
            );

            const options: {
                startTime?: Date;
                endTime?: Date;
            } = {};

            if (startTime) {
                options.startTime = startTime;
            }

            if (endTime) {
                options.endTime = endTime;
            }

            const service =
                await this.serviceService.getServiceDetail(
                    projectId,
                    decodeURIComponent(
                        serviceName,
                    ),
                    userId,
                    options,
                );

            return res.status(200).json({
                success: true,
                data: {
                    service,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    private validateDateRange(
        startTime?: Date,
        endTime?: Date,
    ): void {
        if (
            startTime &&
            endTime &&
            startTime > endTime
        ) {
            throw new AppError(
                "startTime must be before endTime",
                400,
            );
        }
    }

    private parseDate(
        value: unknown,
        fieldName: string,
    ): Date | undefined {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return undefined;
        }

        if (typeof value !== "string") {
            throw new AppError(
                `${fieldName} must be a valid date`,
                400,
            );
        }

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime(),
            )
        ) {
            throw new AppError(
                `${fieldName} must be a valid date`,
                400,
            );
        }

        return date;
    }
}