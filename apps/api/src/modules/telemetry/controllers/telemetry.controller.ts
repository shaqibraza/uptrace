import type { Request, Response, NextFunction } from "express";

import { parseOtlpTraceRequest } from "../ingestion/otlp-trace.parser.js";
import { TraceIngestionService } from "../services/trace-ingestion.service.js";


export class TelemetryController {
    constructor(
        private readonly traceIngestionService: TraceIngestionService,
    ) { };

    ingestTraces = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const telemetry = req.telemetry;
            if (!telemetry) {
                throw new Error("Telemetry authentication context is missing");
            };

            const payload = parseOtlpTraceRequest(req.body);

            const result = await this.traceIngestionService.ingest(
                telemetry.projectId,
                payload
            );

            return res.status(200).json({
                accepted: true,
                ...result,
            });
        } catch (error) {
            console.error(error);
            next(error);
        };
    };
};