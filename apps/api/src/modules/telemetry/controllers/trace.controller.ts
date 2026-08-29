import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../../core/errors/app-error.js";
import { TraceRepository } from "../repositories/trace.repository.js";
import { SpanRepository } from "../repositories/span.repository.js";


export class TraceController {
    constructor(
        private readonly traceRepository: TraceRepository,
        private readonly spanRepository: SpanRepository,
    ) { }

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

            const traces =
                await this.traceRepository.listByProject(
                    projectId,
                    100
                );

            return res.status(200).json({
                success: true,
                data: {
                    traces,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    getByTraceId = async (
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

            const { projectId, traceId } = req.params;

            if (!projectId || typeof projectId !== "string") {
                throw new AppError(
                    "Project ID is required",
                    400,
                    "INVALID_PROJECT_ID",
                );
            }

            if (!traceId || typeof traceId !== "string") {
                throw new AppError(
                    "Trace ID is required",
                    400,
                    "INVALID_TRACE_ID",
                );
            }

            const trace = await this.traceRepository.findByTraceId(
                projectId,
                traceId,
            );

            if (!trace) {
                throw new AppError(
                    "Trace not found",
                    404,
                    "TRACE_NOT_FOUND",
                );
            }

            const spans = await this.spanRepository.listByTrace(
                projectId,
                traceId,
            );

            return res.status(200).json({
                success: true,
                data: {
                    trace,
                    spans,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}