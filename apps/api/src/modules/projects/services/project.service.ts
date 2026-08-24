import { projects } from "@uptrace/db";
import { AppError } from "../../../core/errors/app-error.js";
import { generateSlug } from "../../../core/utils/slug.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectRepository } from "../repositories/project.repository.js";


export class ProjectService {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
        private readonly projectRepository: ProjectRepository,
    ) { };

    private isUniqueViolation(error: unknown) {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        );
    };

    private async ensureOrganizationMember(
        organizationId: string,
        userId: string,
    ) {
        const membership =
            await this.organizationRepository.getMembership(
                organizationId,
                userId,
            );

        if (!membership) {
            throw new AppError(
                "You do not have access to this organization",
                403,
                "FORBIDDEN",
            );
        }
    };

    async create(data: {
        organizationId: string;
        userId: string;
        name: string;
        description?: string;
    }) {
        const membership = await this.organizationRepository.getMembership(data.organizationId, data.userId);

        if (!membership) {
            throw new AppError(
                "You do not have access to this organization",
                403,
                "FORBIDDEN",
            );
        };

        if (
            membership.role !== "OWNER" &&
            membership.role !== "ADMIN"
        ) {
            throw new AppError(
                "You do not have permission to create projects",
                403,
                "FORBIDDEN",
            );
        };

        const name = data.name.trim();
        if (!name) {
            throw new AppError(
                "Project name is required",
                400,
                "INVALID_PROJECT_NAME",
            );
        };

        if (name.length > 100) {
            throw new AppError(
                "Project name must be at most 100 characters",
                400,
                "INVALID_PROJECT_NAME",
            );
        };

        const baseSlug = generateSlug(name);
        if (!baseSlug) {
            throw new AppError(
                "Project name must contain valid characters",
                400,
                "INVALID_PROJECT_NAME",
            );
        };

        let counter = 1;
        while (true) {
            const slug = counter === 1 ? baseSlug : `${baseSlug}-${counter}`;

            try {
                return await this.projectRepository.create({
                    organizationId: data.organizationId,
                    name,
                    slug,
                    ...(data.description?.trim()
                        ? { description: data.description.trim() }
                        : {}),
                });
            } catch (error) {
                if (!this.isUniqueViolation(error)) {
                    throw error;
                };

                counter++;
            }
        }
    };

    async getById(
        projectId: string,
        userId: string
    ) {
        const project = await this.projectRepository.findById(projectId);

        if (!project) {
            throw new AppError(
                "Project not found",
                404,
                "PROJECT_NOT_FOUND",
            );
        };

        await this.ensureOrganizationMember(project.organizationId, userId);

        return project;
    };

    async getOrganizationProjects(
        organizationId: string,
        userId: string
    ) {
        await this.ensureOrganizationMember(organizationId, userId);

        return await this.projectRepository.findOrganizationProjects(organizationId);
    };

    async update(
        projectId: string,
        userId: string,
        data: {
            name?: string;
            description?: string | null;
        }
    ) {
        const project = await this.projectRepository.findById(projectId);

        if (!project) {
            throw new AppError(
                "Project not found",
                404,
                "PROJECT_NOT_FOUND",
            );
        };

        const membership = await this.organizationRepository.getMembership(project.organizationId, userId);

        if (!membership) {
            throw new AppError(
                "You do not have access to this organization",
                403,
                "FORBIDDEN",
            );
        };

        if (
            membership.role !== "OWNER" &&
            membership.role !== "ADMIN"
        ) {
            throw new AppError(
                "You do not have permission to update projects",
                403,
                "FORBIDDEN",
            );
        };

        return await this.projectRepository.update(
            projectId,
            data
        );
    };

    async delete(
        projectId: string,
        userId: string
    ) {
        const project = await this.projectRepository.findById(projectId);

        if (!project) {
            throw new AppError(
                "Project not found",
                404,
                "PROJECT_NOT_FOUND",
            );
        };

        const membership = await this.organizationRepository.getMembership(project.organizationId, userId);

        if (!membership) {
            throw new AppError(
                "You do not have access to this organization",
                403,
                "FORBIDDEN",
            );
        }

        if (membership.role !== "OWNER") {
            throw new AppError(
                "Only the organization owner can delete projects",
                403,
                "FORBIDDEN",
            );
        };

        return await this.projectRepository.delete(projectId);
    };
};