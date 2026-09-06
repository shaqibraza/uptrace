import {
    MetricRepository,
    type MetricDetail,
    type MetricSource,
    type MetricSummary,
} from "../repositories/metric.repository.js";
import { ProjectService } from "../../projects/services/project.service.js";

export type MetricServiceOptions = {
    startTime?: Date;
    endTime?: Date;
    serviceName?: string;
    environment?: string;
    search?: string;
};

export type MetricOverview = {
    metrics: MetricSummary[];
    summary: {
        activeMetrics: number;
        dataPoints: number;
        throughput: number;
        collectionDelayMs: number;
    };
    sources: MetricSource[];
};

export class MetricService {
    constructor(
        private readonly metricRepository: MetricRepository,
        private readonly projectService: ProjectService,
    ) {}

    /**
     * Get the complete metrics overview for a project.
     */
    async getOverview(
        projectId: string,
        userId: string,
        options?: MetricServiceOptions,
    ): Promise<MetricOverview> {
        this.validateProjectId(projectId);
        this.validateUserId(userId);
        this.validateDateRange(options);

        await this.projectService.getById(
            projectId,
            userId,
        );

        const [
            metrics,
            summary,
            sources,
        ] = await Promise.all([
            this.metricRepository.listByProject(
                projectId,
                options,
            ),
            this.metricRepository.getSummary(
                projectId,
                options,
            ),
            this.metricRepository.listSources(
                projectId,
                options,
            ),
        ]);

        return {
            metrics,
            summary,
            sources,
        };
    }

    /**
     * Get a single metric and its time-series data.
     */
    async getMetric(
        projectId: string,
        userId: string,
        metricName: string,
        options?: Omit<
            MetricServiceOptions,
            "search"
        >,
    ): Promise<MetricDetail | null> {
        this.validateProjectId(projectId);
        this.validateUserId(userId);

        if (!metricName?.trim()) {
            throw new Error(
                "Metric name is required",
            );
        }

        this.validateDateRange(options);

        await this.projectService.getById(
            projectId,
            userId,
        );

        return this.metricRepository.getMetric(
            projectId,
            metricName.trim(),
            options,
        );
    }

    /**
     * Get metric time-series data.
     */
    async getTimeSeries(
        projectId: string,
        userId: string,
        metricName: string,
        options?: Omit<
            MetricServiceOptions,
            "search"
        >,
    ) {
        this.validateProjectId(projectId);
        this.validateUserId(userId);

        if (!metricName?.trim()) {
            throw new Error(
                "Metric name is required",
            );
        }

        this.validateDateRange(options);

        await this.projectService.getById(
            projectId,
            userId,
        );

        return this.metricRepository.getTimeSeries(
            projectId,
            metricName.trim(),
            options,
        );
    }

    /**
     * Get aggregate metric summary.
     */
    async getSummary(
        projectId: string,
        userId: string,
        options?: Omit<
            MetricServiceOptions,
            "search"
        >,
    ) {
        this.validateProjectId(projectId);
        this.validateUserId(userId);
        this.validateDateRange(options);

        await this.projectService.getById(
            projectId,
            userId,
        );

        return this.metricRepository.getSummary(
            projectId,
            options,
        );
    }

    /**
     * Get metric sources/services.
     */
    async getSources(
        projectId: string,
        userId: string,
        options?: Omit<
            MetricServiceOptions,
            "search"
        >,
    ) {
        this.validateProjectId(projectId);
        this.validateUserId(userId);
        this.validateDateRange(options);

        await this.projectService.getById(
            projectId,
            userId,
        );

        return this.metricRepository.listSources(
            projectId,
            options,
        );
    }

    private validateProjectId(
        projectId: string,
    ): void {
        if (!projectId?.trim()) {
            throw new Error(
                "Project ID is required",
            );
        }
    }

    private validateUserId(
        userId: string,
    ): void {
        if (!userId?.trim()) {
            throw new Error(
                "User ID is required",
            );
        }
    }

    private validateDateRange(
        options?: MetricServiceOptions,
    ): void {
        if (
            options?.startTime &&
            Number.isNaN(
                options.startTime.getTime(),
            )
        ) {
            throw new Error(
                "Invalid start time",
            );
        }

        if (
            options?.endTime &&
            Number.isNaN(
                options.endTime.getTime(),
            )
        ) {
            throw new Error(
                "Invalid end time",
            );
        }

        if (
            options?.startTime &&
            options?.endTime &&
            options.startTime.getTime() >
                options.endTime.getTime()
        ) {
            throw new Error(
                "Start time must be before end time",
            );
        }
    }
}