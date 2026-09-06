import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { parseOtlpLogsRequest } from "../../telemetry/ingestion/otlp-log.parser.js";
import { LogIngestionService } from "../services/log-ingestion.service.js";
import {
    LogService,
    type LogServiceOptions,
} from "../services/log.service.js";

export class LogController {
    constructor(
        private readonly logIngestionService: LogIngestionService,
        private readonly logService: LogService,
    ) {}

    ingest = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const projectId = req.telemetry?.projectId;

            if (!projectId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "TELEMETRY_AUTH_REQUIRED",
                        message:
                            "Valid telemetry API key is required",
                    },
                });

                return;
            }

            const contentType =
                req.headers["content-type"];

            const payload =
                parseOtlpLogsRequest(
                    req.body,
                    contentType,
                );

            const result =
                await this.logIngestionService.ingest(
                    projectId,
                    payload,
                );

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    list = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            const projectId =
                this.getParamString(
                    req.params.projectId,
                );

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message:
                            "Authentication required",
                    },
                });

                return;
            }

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });

                return;
            }

            const options =
                this.parseListOptions(req);

            const result =
                await this.logService.list(
                    projectId,
                    userId,
                    options,
                );

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getSummary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            const projectId =
                this.getParamString(
                    req.params.projectId,
                );

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message:
                            "Authentication required",
                    },
                });

                return;
            }

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });

                return;
            }

            const startTime =
                this.parseDate(
                    req.query.startTime,
                );

            const endTime =
                this.parseDate(
                    req.query.endTime,
                );

            this.validateDateRange(
                startTime,
                endTime,
            );

            const options: {
                startTime?: Date;
                endTime?: Date;
                serviceName?: string;
                environment?: string;
            } = {};

            if (startTime) {
                options.startTime = startTime;
            }

            if (endTime) {
                options.endTime = endTime;
            }

            const serviceName =
                this.getQueryString(
                    req.query.serviceName,
                );

            if (serviceName) {
                options.serviceName =
                    serviceName;
            }

            const environment =
                this.getQueryString(
                    req.query.environment,
                );

            if (environment) {
                options.environment =
                    environment;
            }

            const result =
                await this.logService.getSummary(
                    projectId,
                    userId,
                    options,
                );

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getSources = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            const projectId =
                this.getParamString(
                    req.params.projectId,
                );

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message:
                            "Authentication required",
                    },
                });

                return;
            }

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });

                return;
            }

            const startTime =
                this.parseDate(
                    req.query.startTime,
                );

            const endTime =
                this.parseDate(
                    req.query.endTime,
                );

            this.validateDateRange(
                startTime,
                endTime,
            );

            const options: {
                startTime?: Date;
                endTime?: Date;
                environment?: string;
            } = {};

            if (startTime) {
                options.startTime = startTime;
            }

            if (endTime) {
                options.endTime = endTime;
            }

            const environment =
                this.getQueryString(
                    req.query.environment,
                );

            if (environment) {
                options.environment =
                    environment;
            }

            const result =
                await this.logService.getSources(
                    projectId,
                    userId,
                    options,
                );

            res.status(200).json({
                success: true,
                data: {
                    sources: result,
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
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            const projectId =
                this.getParamString(
                    req.params.projectId,
                );
            const logId =
                this.getParamString(
                    req.params.logId,
                );

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message:
                            "Authentication required",
                    },
                });

                return;
            }

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });

                return;
            }

            if (!logId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: "LOG_ID_REQUIRED",
                        message:
                            "Log ID is required",
                    },
                });

                return;
            }

            const result =
                await this.logService.getById(
                    projectId,
                    userId,
                    logId,
                );

            if (!result) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: "LOG_NOT_FOUND",
                        message:
                            "Log not found",
                    },
                });

                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    log: result,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    private parseListOptions(
        req: Request,
    ): LogServiceOptions {
        const startTime =
            this.parseDate(
                req.query.startTime,
            );

        const endTime =
            this.parseDate(
                req.query.endTime,
            );

        this.validateDateRange(
            startTime,
            endTime,
        );

        const limit =
            this.parseInteger(
                req.query.limit,
                "limit",
            );

        const offset =
            this.parseInteger(
                req.query.offset,
                "offset",
            );

        if (
            limit !== undefined &&
            (limit < 1 || limit > 500)
        ) {
            throw this.badRequest(
                "INVALID_LIMIT",
                "Limit must be between 1 and 500",
            );
        }

        if (
            offset !== undefined &&
            offset < 0
        ) {
            throw this.badRequest(
                "INVALID_OFFSET",
                "Offset must be greater than or equal to 0",
            );
        }

        const options: LogServiceOptions = {};

        if (startTime) {
            options.startTime = startTime;
        }

        if (endTime) {
            options.endTime = endTime;
        }

        const serviceName =
            this.getQueryString(
                req.query.serviceName,
            );

        if (serviceName) {
            options.serviceName =
                serviceName;
        }

        const environment =
            this.getQueryString(
                req.query.environment,
            );

        if (environment) {
            options.environment =
                environment;
        }

        const severity =
            this.getQueryString(
                req.query.severity,
            );

        if (severity) {
            options.severity = severity;
        }

        const search =
            this.getQueryString(
                req.query.search,
            );

        if (search) {
            options.search = search;
        }

        const traceId =
            this.getQueryString(
                req.query.traceId,
            );

        if (traceId) {
            options.traceId = traceId;
        }

        const spanId =
            this.getQueryString(
                req.query.spanId,
            );

        if (spanId) {
            options.spanId = spanId;
        }

        if (limit !== undefined) {
            options.limit = limit;
        }

        if (offset !== undefined) {
            options.offset = offset;
        }

        return options;
    }

    private parseDate(
        value: unknown,
    ): Date | undefined {
        const raw =
            this.getQueryString(value);

        if (!raw) {
            return undefined;
        }

        const date = new Date(raw);

        if (Number.isNaN(date.getTime())) {
            throw this.badRequest(
                "INVALID_DATE",
                `Invalid date: ${raw}`,
            );
        }

        return date;
    }

    private parseInteger(
        value: unknown,
        field: string,
    ): number | undefined {
        const raw =
            this.getQueryString(value);

        if (!raw) {
            return undefined;
        }

        if (!/^\d+$/.test(raw)) {
            throw this.badRequest(
                `INVALID_${field.toUpperCase()}`,
                `${field} must be a non-negative integer`,
            );
        }

        const parsed =
            Number.parseInt(raw, 10);

        if (!Number.isSafeInteger(parsed)) {
            throw this.badRequest(
                `INVALID_${field.toUpperCase()}`,
                `${field} is too large`,
            );
        }

        return parsed;
    }

    private getParamString(
        value: string | string[] | undefined,
    ): string | undefined {
        if (typeof value === "string") {
            return value.trim() || undefined;
        }

        if (Array.isArray(value)) {
            const first = value[0];

            return typeof first === "string"
                ? first.trim() || undefined
                : undefined;
        }

        return undefined;
    }

    private getQueryString(
        value: unknown,
    ): string | undefined {
        if (typeof value === "string") {
            return value.trim() || undefined;
        }

        if (Array.isArray(value)) {
            const first = value[0];

            return typeof first === "string"
                ? first.trim() || undefined
                : undefined;
        }

        return undefined;
    }

    private validateDateRange(
        startTime?: Date,
        endTime?: Date,
    ): void {
        if (
            startTime &&
            endTime &&
            startTime.getTime() >
                endTime.getTime()
        ) {
            throw this.badRequest(
                "INVALID_DATE_RANGE",
                "startTime must be before or equal to endTime",
            );
        }
    }

    private badRequest(
        code: string,
        message: string,
    ): Error & {
        statusCode: number;
        code: string;
    } {
        const error = new Error(
            message,
        ) as Error & {
            statusCode: number;
            code: string;
        };

        error.statusCode = 400;
        error.code = code;

        return error;
    }
}