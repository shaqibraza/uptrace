import { createHash, randomBytes } from "node:crypto";

import { AppError } from "../../../core/errors/app-error.js";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectApiKeyRepository } from "../repositories/project-api-key.repository.js";



export class ProjectApiKeyService {
    constructor(
        private readonly projectRepository: ProjectRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly projectApiKeyRepository: ProjectApiKeyRepository,
    ) { };

    private async getProjectForUser(
        projectId: string,
        userId: string,
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

        return {
            project,
            membership,
        };
    };

    private ensureAdminPermission(
        role: string,
        action: string
    ) {
        if (role !== "OWNER" && role !== "ADMIN") {
            throw new AppError(
                `You do not have permission to ${action}`,
                403,
                "FORBIDDEN",
            );
        };
    };

    private hashKey(key: string) {
        return createHash("sha256")
            .update(key)
            .digest("hex");
    };

    async create(data: {
        projectId: string;
        userId: string;
        name: string;
    }) {
        const { membership } = await this.getProjectForUser(data.projectId, data.userId);

        this.ensureAdminPermission(membership.role, "create project API keys");

        const name = data.name.trim();
        if (!name) {
            throw new AppError(
                "API key name is required",
                400,
                "INVALID_API_KEY_NAME",
            );
        };

        if (name.length > 100) {
            throw new AppError(
                "API key name must be at most 100 characters",
                400,
                "INVALID_API_KEY_NAME",
            );
        };

        const randomPart = randomBytes(32).toString("hex");

        const rawKey = `ut_${randomPart}`;

        const keyPrefix = rawKey.slice(0, 11);

        const keyHash = this.hashKey(rawKey);

        const apiKey = await this.projectApiKeyRepository.create({
            projectId: data.projectId,
            name,
            keyPrefix,
            keyHash,
        });

        return {
            id: apiKey.id,
            projectId: apiKey.projectId,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            createdAt: apiKey.createdAt,
            lastUsedAt: apiKey.lastUsedAt,
            revokedAt: apiKey.revokedAt,

            // Raw key is returned only once.
            key: rawKey,
        };
    };

    async list(data: {
        projectId: string;
        userId: string;
    }) {
        await this.getProjectForUser(data.projectId, data.userId);

        const apiKeys = await this.projectApiKeyRepository.findByProjectId(data.projectId);

        return apiKeys.map((apiKey) => ({
            id: apiKey.id,
            projectId: apiKey.projectId,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            createdAt: apiKey.createdAt,
            lastUsedAt: apiKey.lastUsedAt,
            revokedAt: apiKey.revokedAt,
        }));
    };

    async revoke(data: {
        projectId: string;
        apiKeyId: string;
        userId: string;
    }) {
        const { membership } = await this.getProjectForUser(data.projectId, data.userId);

        this.ensureAdminPermission(
            membership.role,
            "revoke project API keys",
        );

        const apiKeys = await this.projectApiKeyRepository.findByProjectId(data.projectId);

        const apiKey = apiKeys.find((item) => item.id === data.apiKeyId);

        if (!apiKey) {
            throw new AppError(
                "Project API key not found",
                404,
                "API_KEY_NOT_FOUND",
            );
        };

        if (apiKey.revokedAt) {
            throw new AppError(
                "Project API key is already revoked",
                400,
                "API_KEY_ALREADY_REVOKED",
            );
        };

        const revoked = await this.projectApiKeyRepository.revoke(data.apiKeyId);

        if (!revoked) {
            throw new AppError(
                "Failed to revoke project API key",
                500,
                "API_KEY_REVOKE_FAILED",
            );
        };

        return {
            id: revoked.id,
            projectId: revoked.projectId,
            name: revoked.name,
            keyPrefix: revoked.keyPrefix,
            createdAt: revoked.createdAt,
            lastUsedAt: revoked.lastUsedAt,
            revokedAt: revoked.revokedAt,
        };
    };

    async authenticate(rawKey: string) {
        const key = rawKey.trim();
        if (!key) {
            return null;
        };

        const keyHash = this.hashKey(key);

        console.log("TELEMETRY AUTH HASH:", {
            keyPrefix: key.slice(0, 11),
            keyLength: key.length,
            keyHash,
        });

        const apiKey = await this.projectApiKeyRepository.findByHash(keyHash);

        console.log("TELEMETRY AUTH RESULT:", {
            found: Boolean(apiKey),
            id: apiKey?.id ?? null,
            projectId: apiKey?.projectId ?? null,
            revokedAt: apiKey?.revokedAt ?? null,
        });

        if (!apiKey) {
            return null;
        };

        return apiKey;
    };

    async markAsUsed(apiKeyId: string) {
        return await this.projectApiKeyRepository.updateLastUsedAt(apiKeyId);
    };
};