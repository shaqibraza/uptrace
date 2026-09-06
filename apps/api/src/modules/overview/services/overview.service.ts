import { AppError } from "../../../core/errors/app-error.js";
import { ProjectService } from "../../projects/services/project.service.js";
import {
    OverviewRepository,
    type OverviewTimeRange,
} from "../repositories/overview.repository.js";

export class OverviewService {
    constructor(
        private readonly overviewRepository: OverviewRepository,
        private readonly projectService: ProjectService,
    ) {}

    async getSummary(
        projectId: string,
        userId: string,
        options: OverviewTimeRange = {},
    ) {
        if (!projectId?.trim()) {
            throw new AppError(
                "Project ID is required",
                400,
                "PROJECT_ID_REQUIRED",
            );
        }

        if (!userId?.trim()) {
            throw new AppError(
                "User ID is required",
                401,
                "UNAUTHORIZED",
            );
        }

        await this.projectService.getById(
            projectId,
            userId,
        );

        const overview =
            await this.overviewRepository.getOverview(
                projectId,
                options,
            );

        return {
            summary: {
                requestRate:
                    this.roundNumber(
                        overview.summary
                            .requestRate,
                        4,
                    ),

                p95Latency:
                    this.roundNumber(
                        overview.summary
                            .p95Latency,
                        2,
                    ),

                errorRate:
                    this.roundNumber(
                        overview.summary
                            .errorRate,
                        2,
                    ),

                activeServices:
                    overview.summary
                        .activeServices,
            },

            services:
                overview.services.map(
                    (service) => ({
                        name: service.name,

                        requestCount:
                            service.requestCount,

                        averageLatencyMs:
                            this.roundNumber(
                                service.averageLatencyMs,
                                2,
                            ),

                        errorCount:
                            service.errorCount,

                        errorRate:
                            this.roundNumber(
                                service.errorRate,
                                2,
                            ),

                        status:
                            service.status,
                    }),
                ),

            errorSummary:
                overview.errorSummary.map(
                    (error) => ({
                        endpoint:
                            error.endpoint,

                        count:
                            error.count,

                        percentage:
                            this.roundNumber(
                                error.percentage,
                                2,
                            ),
                    }),
                ),
        };
    }

    private roundNumber(
        value: number,
        decimals = 2,
    ) {
        const multiplier =
            10 ** decimals;

        return (
            Math.round(
                (value +
                    Number.EPSILON) *
                    multiplier,
            ) / multiplier
        );
    }
}