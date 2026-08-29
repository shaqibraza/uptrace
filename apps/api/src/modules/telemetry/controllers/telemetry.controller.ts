import type { Request, Response, NextFunction } from "express";

import { parseOtlpTraceRequest } from "../ingestion/otlp-trace.parser.js";
import { TraceIngestionService } from "../services/trace-ingestion.service.js";


export class TelemetryController {
    constructor(
        private readonly traceIngestionService: TraceIngestionService,
    ) { };

    ingestTraces = async (req: Request, res: Response, next: NextFunction) => {
        console.log("=== TELEMETRY CONTROLLER HIT ===");
        console.log("TELEMETRY:", req.telemetry);
        console.log("CONTENT TYPE:", req.headers["content-type"]);
        console.log("BODY TYPE:", typeof req.body);
        try {
            const telemetry = req.telemetry;
            if (!telemetry) {
                throw new Error("Telemetry authentication context is missing");
            };

            const payload = parseOtlpTraceRequest(req.body);

            console.log("=== DECODED OTLP PAYLOAD ===");
            console.dir(payload, { depth: 10 });

            const result = await this.traceIngestionService.ingest(
                telemetry.projectId,
                payload
            );

            console.log("=== INGESTION RESULT ===", result);

            return res.status(200).json({
                accepted: true,
                ...result,
            });
        } catch (error) {
            console.error("=== TELEMETRY INGESTION ERROR ===");
            console.error(error);
            next(error);
        };
    };
};