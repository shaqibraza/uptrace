import { ProjectService } from "../../projects/services/project.service.js";

import {
    LogRepository,
    type LogListOptions,
    type LogListResult,
    type LogRecord,
    type LogSource,
    type LogSummary,
} from "../repositories/log.repository.js";

export type LogServiceOptions = {
    startTime?: Date;
    endTime?: Date;
    serviceName?: string;
    environment?: string;
    severity?: string;
    search?: string;
    traceId?: string;
    spanId?: string;
    limit?: number;
    offset?: number;
};

export class LogService {
    constructor(
        private readonly logRepository: LogRepository,
        private readonly projectService: ProjectService,
    ) {}

    async list(
        projectId: string,
        userId: string,
        options?: LogServiceOptions,
    ): Promise<LogListResult> {
        this.validateProjectId(projectId);
        this.validateUserId(userId);

        await this.authorizeProject(
            projectId,
            userId,
        );

        const normalizedOptions =
            this.normalizeListOptions(options);

        return this.logRepository.listByProject(
            projectId,
            normalizedOptions,
        );
    }

    async getSummary(
        projectId: string,
        userId: string,
        options?: Pick<
            LogServiceOptions,
            | "startTime"
            | "endTime"
            | "serviceName"
            | "environment"
        >,
    ): Promise<LogSummary> {
        this.validateProjectId(projectId);
        this.validateUserId(userId);

        await this.authorizeProject(
            projectId,
            userId,
        );

        const normalizedOptions =
            this.normalizeTimeOptions(
                options,
            );

        return this.logRepository.getSummary(
            projectId,
            normalizedOptions,
        );
    }

    async getSources(
        projectId: string,
        userId: string,
        options?: Pick<
            LogServiceOptions,
            | "startTime"
            | "endTime"
            | "environment"
        >,
    ): Promise<LogSource[]> {
        this.validateProjectId(projectId);
        this.validateUserId(userId);

        await this.authorizeProject(
            projectId,
            userId,
        );

        const normalizedOptions =
            this.normalizeTimeOptions(
                options,
            );

        return this.logRepository.listSources(
            projectId,
            normalizedOptions,
        );
    }

    async getById(
        projectId: string,
        userId: string,
        logId: string,
    ): Promise<LogRecord | null> {
        this.validateProjectId(projectId);
        this.validateUserId(userId);

        if (!logId.trim()) {
            throw new Error(
                "Log ID is required",
            );
        }

        await this.authorizeProject(
            projectId,
            userId,
        );

        return this.logRepository.getById(
            projectId,
            logId,
        );
    }

    private async authorizeProject(
        projectId: string,
        userId: string,
    ): Promise<void> {
        await this.projectService.getById(
            projectId,
            userId,
        );
    }

    private normalizeListOptions(
        options?: LogServiceOptions,
    ): LogListOptions | undefined {
        if (!options) {
            return undefined;
        }

        const normalized: LogListOptions = {};

        if (options.startTime) {
            normalized.startTime =
                options.startTime;
        }

        if (options.endTime) {
            normalized.endTime =
                options.endTime;
        }

        if (options.serviceName) {
            normalized.serviceName =
                options.serviceName.trim();
        }

        if (options.environment) {
            normalized.environment =
                options.environment.trim();
        }

        if (options.severity) {
            normalized.severity =
                options.severity.trim();
        }

        if (options.search) {
            normalized.search =
                options.search.trim();
        }

        if (options.traceId) {
            normalized.traceId =
                options.traceId.trim();
        }

        if (options.spanId) {
            normalized.spanId =
                options.spanId.trim();
        }

        if (options.limit !== undefined) {
            normalized.limit =
                options.limit;
        }

        if (options.offset !== undefined) {
            normalized.offset =
                options.offset;
        }

        return normalized;
    }

    private normalizeTimeOptions(
        options?: Pick<
            LogServiceOptions,
            | "startTime"
            | "endTime"
            | "serviceName"
            | "environment"
        >,
    ):
        | Pick<
              LogListOptions,
              | "startTime"
              | "endTime"
              | "serviceName"
              | "environment"
          >
        | undefined {
        if (!options) {
            return undefined;
        }

        const normalized: Pick<
            LogListOptions,
            | "startTime"
            | "endTime"
            | "serviceName"
            | "environment"
        > = {};

        if (options.startTime) {
            normalized.startTime =
                options.startTime;
        }

        if (options.endTime) {
            normalized.endTime =
                options.endTime;
        }

        if (options.serviceName) {
            normalized.serviceName =
                options.serviceName.trim();
        }

        if (options.environment) {
            normalized.environment =
                options.environment.trim();
        }

        return normalized;
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
}