import { HttpEndpointRepository } from "../repositories/http-endpoint.repository.js";
import { ProjectRepository } from "../../projects/repositories/project.repository.js";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { AppError } from "../../../core/errors/app-error.js";



export class HttpEndpointService {
    constructor(
        private readonly httpEndpointRepository: HttpEndpointRepository,
        private readonly projectRepository: ProjectRepository,
        private readonly organizationRepository: OrganizationRepository,
    ) { };

    async create(data: {
        projectId: string;
        userId: string;
        name: string;
        url: string;
        method: string;
        expectedStatusCode: number;
        intervalSeconds: number;
        timeoutMs: number;
    }) {
        const project = await this.projectRepository.findById(data.projectId);

        if (!project) {
            throw new Error("Project not found");
        };

        const isMember = await this.organizationRepository.isMember(project.organizationId, data.userId);

        if (!isMember) {
            throw new Error("You do not have access to this project");
        };

        return await this.httpEndpointRepository.create({
            projectId: data.projectId,
            name: data.name,
            url: data.url,
            method: data.method,
            expectedStatusCode: data.expectedStatusCode,
            intervalSeconds: data.intervalSeconds,
            timeoutMs: data.timeoutMs,
        });
    };

    async listByProject(data: {
        projectId: string;
        userId: string;
    }) {
        const project = await this.projectRepository.findById(data.projectId);

        if (!project) {
            throw new AppError(
                "Project not found",
                404,
                "PROJECT_NOT_FOUND",
            );
        };

        const isMember =
            await this.organizationRepository.isMember(
                project.organizationId,
                data.userId,
            );

        if (!isMember) {
            throw new AppError(
                "You do not have access to this project",
                403,
                "FORBIDDEN",
            );
        };

        return await this.httpEndpointRepository.findByProjectId(data.projectId);
    };

    async getById(data: {
        endpointId: string;
        userId: string;
    }) {
        const endpoint =
            await this.httpEndpointRepository.findById(
                data.endpointId,
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
                data.userId,
            );

        if (!isMember) {
            throw new AppError(
                "You do not have access to this endpoint",
                403,
                "FORBIDDEN",
            );
        }

        return endpoint;
    };

    async update(
        data: {
            endpointId: string;
            userId: string;
            name?: string;
            url?: string;
            method?: string;
            expectedStatusCode?: number;
            intervalSeconds?: number;
            timeoutMs?: number;
            isActive?: boolean;
        },
    ) {
        const endpoint =
            await this.httpEndpointRepository.findById(
                data.endpointId,
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
                data.userId,
            );

        if (!isMember) {
            throw new AppError(
                "You do not have access to this endpoint",
                403,
                "FORBIDDEN",
            );
        }

        const updatedEndpoint =
            await this.httpEndpointRepository.update(
                data.endpointId,
                {
                    ...(data.name !== undefined
                        ? { name: data.name }
                        : {}),
                    ...(data.url !== undefined
                        ? { url: data.url }
                        : {}),
                    ...(data.method !== undefined
                        ? { method: data.method }
                        : {}),
                    ...(data.expectedStatusCode !== undefined
                        ? {
                            expectedStatusCode:
                                data.expectedStatusCode,
                        }
                        : {}),
                    ...(data.intervalSeconds !== undefined
                        ? {
                            intervalSeconds:
                                data.intervalSeconds,
                        }
                        : {}),
                    ...(data.timeoutMs !== undefined
                        ? {
                            timeoutMs: data.timeoutMs,
                        }
                        : {}),
                    ...(data.isActive !== undefined
                        ? { isActive: data.isActive }
                        : {}),
                },
            );

        if (!updatedEndpoint) {
            throw new AppError(
                "Failed to update HTTP endpoint",
                500,
                "HTTP_ENDPOINT_UPDATE_FAILED",
            );
        }

        return updatedEndpoint;
    };

    async delete(data: {
        endpointId: string;
        userId: string;
    }) {
        const endpoint =
            await this.httpEndpointRepository.findById(
                data.endpointId,
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
                data.userId,
            );

        if (!isMember) {
            throw new AppError(
                "You do not have access to this endpoint",
                403,
                "FORBIDDEN",
            );
        }

        const deleted =
            await this.httpEndpointRepository.delete(
                data.endpointId,
            );

        if (!deleted) {
            throw new AppError(
                "Failed to delete HTTP endpoint",
                500,
                "HTTP_ENDPOINT_DELETE_FAILED",
            );
        }

        return deleted;
    }
};