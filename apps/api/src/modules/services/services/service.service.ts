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

    /**
     * List all services belonging to a project.
     *
     * Project access is verified before telemetry is queried.
     */
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
                Number(service.requestCount ?? 0),

            averageLatencyMs:
                roundNumber(
                    service.averageLatencyMs,
                ),

            p95LatencyMs:
                roundNumber(
                    service.p95LatencyMs,
                ),

            errorCount:
                Number(service.errorCount ?? 0),

            uptime:
                roundNumber(
                    service.uptime,
                ),

            errorRate:
                roundNumber(
                    service.errorRate,
                ),

            trend:
                service.trend,

            trendValue:
                roundNumber(
                    service.trendValue,
                ),

            firstSeenAt:
                service.firstSeenAt ?? null,

            lastSeenAt:
                service.lastSeenAt ?? null,
        }));
    }

    /**
     * Get complete detail information for a single service.
     *
     * Includes:
     * - summary metrics
     * - request rate
     * - operations
     * - time series
     * - recent traces
     * - dependencies
     * - instances
     */
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

            /*
             * ------------------------------------------------------------------
             * Summary
             * ------------------------------------------------------------------
             */

            requestCount:
                Number(service.requestCount ?? 0),

            requestRate:
                roundNumber(
                    service.requestRate,
                ),

            averageLatencyMs:
                roundNumber(
                    service.averageLatencyMs,
                ),

            p95LatencyMs:
                roundNumber(
                    service.p95LatencyMs,
                ),

            errorCount:
                Number(service.errorCount ?? 0),

            errorRate:
                roundNumber(
                    service.errorRate,
                ),

            uptime:
                roundNumber(
                    service.uptime,
                ),

            trendValue:
                roundNumber(
                    service.trendValue,
                ),

            firstSeenAt:
                service.firstSeenAt ?? null,

            lastSeenAt:
                service.lastSeenAt ?? null,

            /*
             * ------------------------------------------------------------------
             * Operations
             * ------------------------------------------------------------------
             */

            operations:
                service.operations.map(
                    (operation) => ({
                        ...operation,

                        requestCount:
                            Number(
                                operation.requestCount ??
                                0,
                            ),

                        averageLatencyMs:
                            roundNumber(
                                operation.averageLatencyMs,
                            ),

                        p95LatencyMs:
                            roundNumber(
                                operation.p95LatencyMs,
                            ),

                        errorCount:
                            Number(
                                operation.errorCount ??
                                0,
                            ),

                        errorRate:
                            roundNumber(
                                operation.errorRate,
                            ),
                    }),
                ),

            /*
             * ------------------------------------------------------------------
             * Time series
             * ------------------------------------------------------------------
             */

            timeSeries:
                service.timeSeries.map(
                    (point) => ({
                        ...point,

                        requestCount:
                            Number(
                                point.requestCount ??
                                0,
                            ),

                        requestRate:
                            roundNumber(
                                point.requestRate,
                            ),

                        averageLatencyMs:
                            roundNumber(
                                point.averageLatencyMs,
                            ),

                        errorCount:
                            Number(
                                point.errorCount ??
                                0,
                            ),

                        errorRate:
                            roundNumber(
                                point.errorRate,
                            ),
                    }),
                ),

            /*
             * ------------------------------------------------------------------
             * Recent traces
             * ------------------------------------------------------------------
             */

            recentTraces:
                service.recentTraces.map(
                    (trace) => ({
                        ...trace,

                        durationMs:
                            roundNumber(
                                trace.durationMs,
                            ),
                    }),
                ),

            /*
             * ------------------------------------------------------------------
             * Dependencies
             * ------------------------------------------------------------------
             */

            dependencies:
                service.dependencies.map(
                    (dependency) => ({
                        ...dependency,

                        requestCount:
                            Number(
                                dependency.requestCount ??
                                0,
                            ),

                        averageLatencyMs:
                            roundNumber(
                                dependency.averageLatencyMs,
                            ),

                        p95LatencyMs:
                            roundNumber(
                                dependency.p95LatencyMs,
                            ),

                        errorCount:
                            Number(
                                dependency.errorCount ??
                                0,
                            ),

                        errorRate:
                            roundNumber(
                                dependency.errorRate,
                            ),

                        lastSeenAt:
                            dependency.lastSeenAt ??
                            null,
                    }),
                ),

            /*
             * ------------------------------------------------------------------
             * Instances
             * ------------------------------------------------------------------
             */

            instances:
                service.instances.map(
                    (instance) => ({
                        ...instance,

                        id:
                            instance.id,

                        hostName:
                            instance.hostName ??
                            null,

                        hostId:
                            instance.hostId ??
                            null,

                        environment:
                            instance.environment ??
                            null,

                        requestCount:
                            Number(
                                instance.requestCount ??
                                0,
                            ),

                        averageLatencyMs:
                            roundNumber(
                                instance.averageLatencyMs,
                            ),

                        p95LatencyMs:
                            roundNumber(
                                instance.p95LatencyMs,
                            ),

                        errorCount:
                            Number(
                                instance.errorCount ??
                                0,
                            ),

                        errorRate:
                            roundNumber(
                                instance.errorRate,
                            ),

                        lastSeenAt:
                            instance.lastSeenAt ??
                            null,
                    }),
                ),
        };
    }
}

/**
 * Normalize floating-point values returned by PostgreSQL.
 *
 * Keeps API responses predictable without changing
 * the actual repository calculations.
 */
function roundNumber(
    value: number | null | undefined,
    decimals = 2,
): number {
    const numericValue =
        Number(value ?? 0);

    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    const multiplier =
        10 ** decimals;

    return (
        Math.round(
            numericValue * multiplier,
        ) / multiplier
    );
}