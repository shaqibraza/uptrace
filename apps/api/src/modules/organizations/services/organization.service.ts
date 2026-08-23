import { OrganizationRepository } from "../repositories/organization.repository.js";
import { generateSlug } from "../../../core/utils/slug.js";
import { AppError } from "../../../core/errors/app-error.js";

export class OrganizationService {
    constructor(
        private readonly organizationRepository: OrganizationRepository,
    ) { };

    private isUniqueViolation(error: unknown) {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        );
    }

    async create(data: {
        name: string,
        userId: string
    }) {
        const name = data.name.trim();
        if (!name) {
            throw new Error("Organization name is required");
        };

        if (name.length > 100) {
            throw new Error("Organization name must be at most 100 characters");
        };

        const baseSlug = generateSlug(name);
        if (!baseSlug) {
            throw new Error("Organization name must contain valid characters");
        };

        let counter = 1;

        while (true) {
            const slug =
                counter === 1
                    ? baseSlug
                    : `${baseSlug}-${counter}`;

            try {
                return await this.organizationRepository.create({
                    name,
                    slug,
                    ownerId: data.userId,
                });
            } catch (error) {
                if (!this.isUniqueViolation(error)) {
                    throw error;
                }

                counter++;
            }
        }
    };

    async getById(organizationId: string) {
        return await this.organizationRepository.findById(organizationId);
    };

    async getUserOrganizations(userId: string) {
        return await this.organizationRepository.findUserOrganizations(userId);
    }

    async ensureMember(
        organizationId: string,
        userId: string,
    ) {
        const isMember =
            await this.organizationRepository.isMember(
                organizationId,
                userId,
            );

        if (!isMember) {
            throw new AppError(
                "You do not have access to this organization",
                403,
                "FORBIDDEN",
            );
        }
    };

    async update(
        organizationId: string,
        userId: string,
        data: {
            name: string;
        },
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

        if (
            membership.role !== "OWNER" &&
            membership.role !== "ADMIN"
        ) {
            throw new AppError(
                "You do not have permission to update this organization",
                403,
                "FORBIDDEN",
            );
        }

        const name = data.name.trim();

        if (!name) {
            throw new AppError(
                "Organization name is required",
                400,
                "INVALID_ORGANIZATION_NAME",
            );
        }

        return await this.organizationRepository.update(
            organizationId,
            { name },
        );
    };

    async delete(
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

        if (membership.role !== "OWNER") {
            throw new AppError(
                "Only the organization owner can delete the organization",
                403,
                "FORBIDDEN",
            );
        }

        const organization =
            await this.organizationRepository.delete(
                organizationId,
            );

        if (!organization) {
            throw new AppError(
                "Organization not found",
                404,
                "ORGANIZATION_NOT_FOUND",
            );
        }

        return organization;
    }
}