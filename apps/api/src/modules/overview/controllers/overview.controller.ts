import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { AppError } from "../../../core/errors/app-error.js";
import { OverviewService } from "../services/overview.service.js";

export class OverviewController {
    constructor(
        private readonly overviewService: OverviewService,
    ) {}

    async getSummary(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const projectId =
                this.getProjectId(
                    req.params.projectId,
                ) ??
                this.getStringQuery(
                    req.query.projectId,
                );

            const userId = req.user?.id;

            if (!userId) {
                throw new AppError(
                    "Unauthorized",
                    401,
                    "UNAUTHORIZED",
                );
            }

            if (!projectId) {
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

            const timeRange = {
                ...(startTime
                    ? { startTime }
                    : {}),
                ...(endTime
                    ? { endTime }
                    : {}),
            };

            const overview =
                await this.overviewService.getSummary(
                    projectId,
                    userId,
                    timeRange,
                );

            res.status(200).json({
                success: true,
                data: overview,
            });
        } catch (error) {
            next(error);
        }
    }

    private getProjectId(
        value:
            | string
            | string[]
            | undefined,
    ): string | undefined {
        if (typeof value !== "string") {
            return undefined;
        }

        const trimmed =
            value.trim();

        return trimmed || undefined;
    }

    private getStringQuery(
        value: unknown,
    ): string | undefined {
        if (typeof value !== "string") {
            return undefined;
        }

        const trimmed =
            value.trim();

        return trimmed || undefined;
    }

    private parseDate(
        value: unknown,
        fieldName: string,
    ): Date | undefined {
        const raw =
            this.getStringQuery(value);

        if (!raw) {
            return undefined;
        }

        const date = new Date(raw);

        if (
            Number.isNaN(
                date.getTime(),
            )
        ) {
            throw new AppError(
                `Invalid ${fieldName}`,
                400,
                "INVALID_DATE",
            );
        }

        return date;
    }
}