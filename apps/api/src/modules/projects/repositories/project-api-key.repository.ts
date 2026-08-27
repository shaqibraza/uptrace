import { and, desc, eq, isNull } from "drizzle-orm";

import { projectApiKeys } from "@uptrace/db";

import { db } from "../../../db.js";


export class ProjectApiKeyRepository {
    async create(data: {
        projectId: string;
        name: string;
        keyPrefix: string;
        keyHash: string;
    }) {
        const result = await db
            .insert(projectApiKeys)
            .values({
                projectId: data.projectId,
                name: data.name,
                keyPrefix: data.keyPrefix,
                keyHash: data.keyHash,
            })
            .returning();

        const apiKey = result[0];

        if (!apiKey) {
            throw new Error("Failed to create project API key");
        }

        return apiKey;
    };

    async findByHash(keyHash: string) {
        const result = await db
            .select()
            .from(projectApiKeys)
            .where(
                and(
                    eq(projectApiKeys.keyHash, keyHash),
                    isNull(projectApiKeys.revokedAt),
                ),
            )
            .limit(1);

        return result[0] ?? null;
    };

    async findByProjectId(projectId: string) {
        return await db
            .select()
            .from(projectApiKeys)
            .where(eq(projectApiKeys.projectId, projectId))
            .orderBy(desc(projectApiKeys.createdAt));
    };

    async revoke(apiKeyId: string) {
        const result = await db
            .update(projectApiKeys)
            .set({
                revokedAt: new Date(),
            })
            .where(eq(projectApiKeys.id, apiKeyId))
            .returning();

        return result[0] ?? null;
    };

    async updateLastUsedAt(apiKeyId: string) {
        const result = await db
            .update(projectApiKeys)
            .set({
                lastUsedAt: new Date(),
            })
            .where(eq(projectApiKeys.id, apiKeyId))
            .returning({
                id: projectApiKeys.id,
                lastUsedAt: projectApiKeys.lastUsedAt,
            });

        return result[0] ?? null;
    };
}