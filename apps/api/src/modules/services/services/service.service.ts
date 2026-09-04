import { AppError } from "../../../core/errors/app-error.js";
import { ProjectService } from "../../projects/services/project.service.js";
import {
    ServiceRepository,
    type ServiceDetail,
} from "../repositories/service.repository.js";

export type ServiceListItem = {
    name: string;
    requestCount: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    errorCount: number;
    uptime: number;
    errorRate: number;
    trend: "up" | "down" | "flat";
    trendValue: number;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
};

export class ServiceService {
    constructor(
        private readonly serviceRepository: ServiceRepository,
        private readonly projectService: ProjectService,
    ) {}

    async listServices(
        projectId: string,
        userId: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceListItem[]> {
        if (!projectId) {
            throw new AppError(
                "Project ID is required",
                400,
                "PROJECT_ID_REQUIRED",
            );
        }

        if (!userId) {
            throw new AppError(
                "Authentication required",
                401,
                "UNAUTHORIZED",
            );
        }

        // Verify project access through organization membership.
        await this.projectService.getById(
            projectId,
            userId,
        );

        const services =
            await this.serviceRepository.listByProject(
                projectId,
                options,
            );

        return services.map((service) => ({
            name: service.name,

            requestCount:
                service.requestCount,

            averageLatencyMs:
                Math.round(
                    service.averageLatencyMs * 100,
                ) / 100,

            p95LatencyMs:
                Math.round(
                    service.p95LatencyMs * 100,
                ) / 100,

            errorCount:
                service.errorCount,

            uptime:
                Math.round(
                    service.uptime * 100,
                ) / 100,

            errorRate:
                Math.round(
                    service.errorRate * 100,
                ) / 100,

            trend:
                service.trend,

            trendValue:
                Math.round(
                    service.trendValue * 100,
                ) / 100,

            firstSeenAt:
                service.firstSeenAt,

            lastSeenAt:
                service.lastSeenAt,
        }));
    }

    async getServiceDetail(
        projectId: string,
        serviceName: string,
        userId: string,
        options?: {
            startTime?: Date;
            endTime?: Date;
        },
    ): Promise<ServiceDetail> {
        if (!projectId) {
            throw new AppError(
                "Project ID is required",
                400,
                "PROJECT_ID_REQUIRED",
            );
        }

        if (!serviceName) {
            throw new AppError(
                "Service name is required",
                400,
                "SERVICE_NAME_REQUIRED",
            );
        }

        if (!userId) {
            throw new AppError(
                "Authentication required",
                401,
                "UNAUTHORIZED",
            );
        }

        // Verify project access through organization membership.
        await this.projectService.getById(
            projectId,
            userId,
        );

        const service =
            await this.serviceRepository.getServiceDetail(
                projectId,
                serviceName,
                options,
            );

        if (!service) {
            throw new AppError(
                "Service not found",
                404,
                "SERVICE_NOT_FOUND",
            );
        }

        return {
            ...service,

            requestRate:
                Math.round(
                    service.requestRate * 100,
                ) / 100,

            averageLatencyMs:
                Math.round(
                    service.averageLatencyMs * 100,
                ) / 100,

            p95LatencyMs:
                Math.round(
                    service.p95LatencyMs * 100,
                ) / 100,

            uptime:
                Math.round(
                    service.uptime * 100,
                ) / 100,

            errorRate:
                Math.round(
                    service.errorRate * 100,
                ) / 100,

            trendValue:
                Math.round(
                    service.trendValue * 100,
                ) / 100,

            operations:
                service.operations.map(
                    (operation) => ({
                        ...operation,

                        averageLatencyMs:
                            Math.round(
                                operation.averageLatencyMs *
                                    100,
                            ) / 100,

                        p95LatencyMs:
                            Math.round(
                                operation.p95LatencyMs *
                                    100,
                            ) / 100,

                        errorRate:
                            Math.round(
                                operation.errorRate *
                                    100,
                            ) / 100,
                    }),
                ),

            timeSeries:
                service.timeSeries.map(
                    (point) => ({
                        ...point,

                        requestRate:
                            Math.round(
                                point.requestRate *
                                    100,
                            ) / 100,

                        averageLatencyMs:
                            Math.round(
                                point.averageLatencyMs *
                                    100,
                            ) / 100,

                        errorRate:
                            Math.round(
                                point.errorRate *
                                    100,
                            ) / 100,
                    }),
                ),

            recentTraces:
                service.recentTraces.map(
                    (trace) => ({
                        ...trace,

                        durationMs:
                            Math.round(
                                trace.durationMs *
                                    100,
                            ) / 100,
                    }),
                ),
        };
    }
}