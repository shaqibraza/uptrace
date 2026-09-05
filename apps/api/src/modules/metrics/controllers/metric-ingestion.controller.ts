import type { NextFunction, Request, Response } from "express";

import { parseOtlpMetricsRequest } from "../../telemetry/ingestion/otlp-metric.parser.js";

import { MetricIngestionService } from "../services/metric-ingestion.service.js";

export class MetricIngestionController {
    constructor(
        private readonly metricIngestionService: MetricIngestionService,
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
                        message: "Valid telemetry API key is required",
                    },
                });

                return;
            }

            const contentType = req.headers["content-type"];

            const payload = parseOtlpMetricsRequest(
                req.body,
                contentType,
            );

            const result =
                await this.metricIngestionService.ingest(
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
}