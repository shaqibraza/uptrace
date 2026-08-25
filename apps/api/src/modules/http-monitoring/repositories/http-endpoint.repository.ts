import { eq } from "drizzle-orm";

import { httpEndpoints } from "@uptrace/db";

import { db } from "../../../db.js";


export class HttpEndpointRepository {
    async create(data: {
        projectId: string;
        name: string;
        url: string;
        method: string;
        expectedStatusCode: number;
        intervalSeconds: number;
        timeoutMs: number;
    }) {
        const result = await db
            .insert(httpEndpoints)
            .values({
                projectId: data.projectId,
                name: data.name,
                url: data.url,
                method: data.method,
                expectedStatusCode: data.expectedStatusCode,
                intervalSeconds: data.intervalSeconds,
                timeoutMs: data.timeoutMs,
            })
            .returning();

        const endpoint = result[0];
        if (!endpoint) {
            throw new Error("Failed to create http endpoint");
        };

        return endpoint;
    };

    async findById(endpointId: string){
        const result = await db
            .select()
            .from(httpEndpoints)
            .where(eq(httpEndpoints.id, endpointId))
            .limit(1);

        return result[0] ?? null;
    };

    async findByProjectId(projectId: string){
        return await db
            .select()
            .from(httpEndpoints)
            .where(eq(httpEndpoints.projectId, projectId));
    };

    async update(
        endpointId: string,
        data: {
            name?: string;
            url?: string;
            method?: string;
            expectedStatusCode?: number;
            intervalSeconds?: number;
            timeoutMs?: number;
            isActive?: boolean;
        }
    ){
        const result = await db 
            .update(httpEndpoints)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(httpEndpoints.id, endpointId))
            .returning();

        return result[0] ?? null;
    };

    async delete(endpoitId: string){
        const result = await db
            .delete(httpEndpoints)
            .where(eq(httpEndpoints.id, endpoitId))
            .returning({
                id: httpEndpoints.id
            });

        return result[0] ?? null;
    };
};