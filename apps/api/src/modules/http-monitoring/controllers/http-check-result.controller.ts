import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { AppError } from "../../../core/errors/app-error.js";

import { HttpCheckResultService } from "../services/http-check-result.service.js";

export class HttpCheckResultController {
    constructor(
        private readonly httpCheckResultService: HttpCheckResultService,
    ) {}

    getByEndpointId = async (
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

            const { endpointId } = req.params;

            if (
                !endpointId ||
                typeof endpointId !== "string"
            ) {
                throw new AppError(
                    "HTTP endpoint ID is required",
                    400,
                    "INVALID_HTTP_ENDPOINT_ID",
                );
            }

            const results =
                await this.httpCheckResultService.getByEndpointId(
                    {
                        endpointId,
                        userId: req.user.id,
                    },
                );

            return res.status(200).json({
                success: true,
                data: {
                    results,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    getLatestByEndpointId = async (
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

            const { endpointId } = req.params;

            if (
                !endpointId ||
                typeof endpointId !== "string"
            ) {
                throw new AppError(
                    "HTTP endpoint ID is required",
                    400,
                    "INVALID_HTTP_ENDPOINT_ID",
                );
            }

            const result =
                await this.httpCheckResultService.getLatestByEndpointId(
                    {
                        endpointId,
                        userId: req.user.id,
                    },
                );

            return res.status(200).json({
                success: true,
                data: {
                    result,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}