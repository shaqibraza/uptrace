import { eq, desc } from "drizzle-orm";

import { httpCheckResults } from "@uptrace/db";

import { db } from "../../../db.js";

export class HttpCheckResultRepository {
    async create(data: {
        endpointId: string;
        status: "UP" | "DOWN";
        statusCode?: number;
        responseTimeMs?: number;
        errorMessage?: string;
        checkedAt: Date;
    }) {
        const result = await db
            .insert(httpCheckResults)
            .values({
                endpointId: data.endpointId,
                status: data.status,
                ...(data.statusCode !== undefined
                    ? { statusCode: data.statusCode }
                    : {}),
                ...(data.responseTimeMs !== undefined
                    ? { responseTimeMs: data.responseTimeMs }
                    : {}),
                ...(data.errorMessage !== undefined
                    ? { errorMessage: data.errorMessage }
                    : {}),
                checkedAt: data.checkedAt,
            })
            .returning();

        const checkResult = result[0];

        if (!checkResult) {
            throw new Error(
                "Failed to create HTTP check result",
            );
        }

        return checkResult;
    }

    async findByEndpointId(endpointId: string) {
        return await db
            .select()
            .from(httpCheckResults)
            .where(eq(httpCheckResults.endpointId, endpointId))
            .orderBy(desc(httpCheckResults.checkedAt));
    }

    async findLatestByEndpointId(endpointId: string) {
        const result = await db
            .select()
            .from(httpCheckResults)
            .where(eq(httpCheckResults.endpointId, endpointId))
            .orderBy(desc(httpCheckResults.checkedAt))
            .limit(1);

        return result[0] ?? null;
    }
}