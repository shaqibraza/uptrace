import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    MetricService,
    type MetricServiceOptions,
} from "../services/metric.service.js";

export class MetricController {
    constructor(
        private readonly metricService: MetricService,
    ) { }

    /**
     * GET /projects/:projectId/metrics
     *
     * Returns:
     * - metric list
     * - aggregate summary
     * - metric sources
     */
    list = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;

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

            const projectId =
                this.getParamValue(
                    req.params.projectId,
                );

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });
                return;
            }

            const options =
                this.parseOptions(req);

            const result =
                await this.metricService.getOverview(
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

    /**
     * GET /projects/:projectId/metrics/:metricName
     *
     * Returns a single metric with:
     * - metadata
     * - latest value
     * - datapoints
     * - time-series
     */
    getDetail = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;

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

            const projectId =
                this.getParamValue(
                    req.params.projectId,
                );

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });
                return;
            }

            const rawMetricName =
                this.getParamValue(
                    req.params.metricName,
                );

            const metricName =
                rawMetricName
                    ? decodeURIComponent(
                        rawMetricName,
                    ).trim()
                    : "";

            if (!metricName) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "METRIC_NAME_REQUIRED",
                        message:
                            "Metric name is required",
                    },
                });
                return;
            }

            const options =
                this.parseOptions(req);

            const metric =
                await this.metricService.getMetric(
                    projectId,
                    userId,
                    metricName,
                    options,
                );

            if (!metric) {
                res.status(404).json({
                    success: false,
                    error: {
                        code:
                            "METRIC_NOT_FOUND",
                        message:
                            "Metric not found",
                    },
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    metric,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /projects/:projectId/metrics/:metricName/time-series
     */
    getTimeSeries = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;

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

            const projectId =
                this.getParamValue(
                    req.params.projectId,
                );

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });
                return;
            }

            const rawMetricName =
                this.getParamValue(
                    req.params.metricName,
                );

            const metricName =
                rawMetricName
                    ? decodeURIComponent(
                        rawMetricName,
                    ).trim()
                    : "";

            if (!metricName) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "METRIC_NAME_REQUIRED",
                        message:
                            "Metric name is required",
                    },
                });
                return;
            }

            const options =
                this.parseOptions(req);

            const timeSeries =
                await this.metricService.getTimeSeries(
                    projectId,
                    userId,
                    metricName,
                    options,
                );

            res.status(200).json({
                success: true,
                data: {
                    timeSeries,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /projects/:projectId/metrics/summary
     */
    getSummary = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;

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

            const projectId =
                this.getParamValue(
                    req.params.projectId,
                );

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });
                return;
            }

            const options =
                this.parseOptions(req);

            const summary =
                await this.metricService.getSummary(
                    projectId,
                    userId,
                    options,
                );

            res.status(200).json({
                success: true,
                data: {
                    summary,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /projects/:projectId/metrics/sources
     */
    getSources = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;

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

            const projectId =
                this.getParamValue(
                    req.params.projectId,
                );

            if (!projectId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code:
                            "PROJECT_ID_REQUIRED",
                        message:
                            "Project ID is required",
                    },
                });
                return;
            }

            const options =
                this.parseOptions(req);

            const sources =
                await this.metricService.getSources(
                    projectId,
                    userId,
                    options,
                );

            res.status(200).json({
                success: true,
                data: {
                    sources,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    private parseOptions(
        req: Request,
    ): MetricServiceOptions {
        const options: MetricServiceOptions =
            {};

        const startTimeValue =
            this.getQueryValue(
                req.query.startTime,
            );

        const endTimeValue =
            this.getQueryValue(
                req.query.endTime,
            );

        const serviceName =
            this.getQueryValue(
                req.query.serviceName,
            );

        const environment =
            this.getQueryValue(
                req.query.environment,
            );

        const search =
            this.getQueryValue(
                req.query.search,
            );

        if (
            this.hasQueryValue(
                req.query.startTime,
            )
        ) {
            const startTime =
                this.parseDate(
                    startTimeValue,
                );

            if (!startTime) {
                throw this.badRequest(
                    "INVALID_DATE",
                    "Invalid start time",
                );
            }

            options.startTime =
                startTime;
        }

        if (
            this.hasQueryValue(
                req.query.endTime,
            )
        ) {
            const endTime =
                this.parseDate(
                    endTimeValue,
                );

            if (!endTime) {
                throw this.badRequest(
                    "INVALID_DATE",
                    "Invalid end time",
                );
            }

            options.endTime =
                endTime;
        }

        if (serviceName) {
            options.serviceName =
                serviceName;
        }

        if (environment) {
            options.environment =
                environment;
        }

        if (search) {
            options.search =
                search;
        }

        if (
            options.startTime &&
            options.endTime &&
            options.startTime.getTime() >
            options.endTime.getTime()
        ) {
            throw this.badRequest(
                "INVALID_DATE_RANGE",
                "Start time must be before end time",
            );
        }

        return options;
    }

    private getParamValue(
        value:
            | string
            | string[]
            | undefined,
    ): string | undefined {
        if (typeof value === "string") {
            return value.trim() || undefined;
        }

        if (Array.isArray(value)) {
            const first =
                value.find(
                    (item) =>
                        typeof item ===
                        "string",
                );

            return first?.trim() || undefined;
        }

        return undefined;
    }

    private getQueryValue(
        value: unknown,
    ): string | undefined {
        if (typeof value === "string") {
            return value.trim() || undefined;
        }

        if (Array.isArray(value)) {
            const first = value.find(
                (item): item is string =>
                    typeof item === "string",
            );

            return first?.trim() || undefined;
        }

        return undefined;
    }

    private hasQueryValue(
        value: unknown,
    ): boolean {
        return (
            typeof value === "string" ||
            Array.isArray(value)
        );
    }

    private parseDate(
        value: string | undefined,
    ): Date | undefined {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime(),
            )
        ) {
            return undefined;
        }

        return date;
    }

    private badRequest(
        code: string,
        message: string,
    ): Error & {
        statusCode: number;
        code: string;
    } {
        const error =
            new Error(message) as Error & {
                statusCode: number;
                code: string;
            };

        error.statusCode = 400;
        error.code = code;

        return error;
    }
}