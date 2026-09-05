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

    /**
     * GET /projects/:projectId/services
     *
     * Returns all services for the selected project.
     *
     * Optional query parameters:
     * - startTime
     * - endTime
     */
    async list(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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
                    "UNAUTHORIZED",
                );
            }

            if (
                !projectId ||
                typeof projectId !== "string"
            ) {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "PROJECT_ID_REQUIRED",
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

            res.status(200).json({
                success: true,
                data: {
                    services,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /projects/:projectId/services/:serviceName
     *
     * Returns complete service detail information.
     *
     * Includes:
     * - summary metrics
     * - request rate
     * - operations
     * - time series
     * - recent traces
     * - dependencies
     * - instances
     *
     * Optional query parameters:
     * - startTime
     * - endTime
     */
    async getDetail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const userId = req.user?.id;
            const projectId = req.params.projectId;
            const serviceName = req.params.serviceName;

            if (
                !userId ||
                typeof userId !== "string"
            ) {
                throw new AppError(
                    "Authentication required",
                    401,
                    "UNAUTHORIZED",
                );
            }

            if (
                !projectId ||
                typeof projectId !== "string"
            ) {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "PROJECT_ID_REQUIRED",
                );
            }

            if (
                !serviceName ||
                typeof serviceName !== "string"
            ) {
                throw new AppError(
                    "Service name is required",
                    400,
                    "SERVICE_NAME_REQUIRED",
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

            const decodedServiceName =
                decodeURIComponent(serviceName);

            const service =
                await this.serviceService.getServiceDetail(
                    projectId,
                    decodedServiceName,
                    userId,
                    options,
                );

            res.status(200).json({
                success: true,
                data: {
                    service,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate that the requested time range is logically valid.
     */
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
                "INVALID_DATE_RANGE",
            );
        }
    }

    /**
     * Parse an optional query-string date.
     */
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
                "INVALID_DATE",
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
                "INVALID_DATE",
            );
        }

        return date;
    }
}