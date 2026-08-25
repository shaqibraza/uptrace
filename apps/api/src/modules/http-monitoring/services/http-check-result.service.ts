import { AppError } from "../../../core/errors/app-error.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";

import { ProjectRepository } from "../../projects/repositories/project.repository.js";

import { HttpEndpointRepository } from "../repositories/http-endpoint.repository.js";

import { HttpCheckResultRepository } from "../repositories/http-check-result.repository.js";

export class HttpCheckResultService {
    constructor(
        private readonly httpCheckResultRepository: HttpCheckResultRepository,
        private readonly httpEndpointRepository: HttpEndpointRepository,
        private readonly projectRepository: ProjectRepository,
        private readonly organizationRepository: OrganizationRepository,
    ) { }

    async create(data: {
        endpointId: string;
        status: "UP" | "DOWN";
        statusCode?: number;
        responseTimeMs?: number;
        errorMessage?: string;
        checkedAt: Date;
    }) {
        if (
            data.status === "UP" &&
            data.errorMessage
        ) {
            throw new AppError(
                "Successful check cannot contain an error",
                400,
                "INVALID_CHECK_RESULT",
            );
        }

        if (
            data.statusCode !== undefined &&
            (
                data.statusCode < 100 ||
                data.statusCode > 599
            )
        ) {
            throw new AppError(
                "Invalid HTTP status code",
                400,
                "INVALID_STATUS_CODE",
            );
        }

        if (
            data.responseTimeMs !== undefined &&
            data.responseTimeMs < 0
        ) {
            throw new AppError(
                "Response time cannot be negative",
                400,
                "INVALID_RESPONSE_TIME",
            );
        }

        return await this.httpCheckResultRepository.create({
            endpointId: data.endpointId,
            status: data.status,

            ...(data.statusCode !== undefined
                ? {
                    statusCode:
                        data.statusCode,
                }
                : {}),

            ...(data.responseTimeMs !== undefined
                ? {
                    responseTimeMs:
                        data.responseTimeMs,
                }
                : {}),

            ...(data.errorMessage !== undefined
                ? {
                    errorMessage:
                        data.errorMessage,
                }
                : {}),

            checkedAt: data.checkedAt,
        });
    }

    private async authorizeEndpointAccess(
        endpointId: string,
        userId: string,
    ) {
        const endpoint =
            await this.httpEndpointRepository.findById(
                endpointId,
            );

        if (!endpoint) {
            throw new AppError(
                "HTTP endpoint not found",
                404,
                "HTTP_ENDPOINT_NOT_FOUND",
            );
        }

        const project =
            await this.projectRepository.findById(
                endpoint.projectId,
            );

        if (!project) {
            throw new AppError(
                "Project not found",
                404,
                "PROJECT_NOT_FOUND",
            );
        }

        const isMember =
            await this.organizationRepository.isMember(
                project.organizationId,
                userId,
            );

        if (!isMember) {
            throw new AppError(
                "You do not have access to this endpoint",
                403,
                "FORBIDDEN",
            );
        }

        return endpoint;
    }

    async getByEndpointId(data: {
        endpointId: string;
        userId: string;
    }) {
        await this.authorizeEndpointAccess(
            data.endpointId,
            data.userId,
        );

        return await this.httpCheckResultRepository.findByEndpointId(
            data.endpointId,
        );
    }

    async getLatestByEndpointId(data: {
        endpointId: string;
        userId: string;
    }) {
        await this.authorizeEndpointAccess(
            data.endpointId,
            data.userId,
        );

        return await this.httpCheckResultRepository.findLatestByEndpointId(
            data.endpointId,
        );
    }
}