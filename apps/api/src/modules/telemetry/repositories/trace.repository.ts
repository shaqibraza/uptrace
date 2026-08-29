import { and, desc, eq } from "drizzle-orm";

import { traces } from "@uptrace/db";

import { db } from "../../../db.js";


export class TraceRepository {
    async create(data: {
        projectId: string;
        traceId: string;
        serviceName: string;
        environment?: string | null;
        startTime: Date;
        endTime?: Date | null;
        durationMs?: number | null;
        status: string;
    }) {
        const result = await db
            .insert(traces)
            .values({
                projectId: data.projectId,
                traceId: data.traceId,
                serviceName: data.serviceName,
                environment: data.environment,
                startTime: data.startTime,
                endTime: data.endTime,
                durationMs: data.durationMs,
                status: data.status,
            })
            .returning();

        const trace = result[0];
        if (!trace) {
            throw new Error("Failed to create trace");
        };

        return trace;
    }

    async findById(traceRecordId: string) {
        const result = await db
            .select()
            .from(traces)
            .where(eq(traces.id, traceRecordId))
            .limit(1);

        return result[0] ?? null;
    };

    async findByTraceId(
        projectId: string,
        traceId: string
    ) {
        const result = await db
            .select()
            .from(traces)
            .where(and(
                eq(traces.projectId, projectId),
                eq(traces.traceId, traceId)
            ))
            .limit(1);

        return result[0] ?? null;
    };

    async upsert(data: {
        projectId: string;
        traceId: string;
        serviceName: string;
        environment?: string | null;
        startTime: Date;
        endTime?: Date | null;
        durationMs?: number | null;
        status: string;
    }) {
        const result = await db
            .insert(traces)
            .values({
                projectId: data.projectId,
                traceId: data.traceId,
                serviceName: data.serviceName,
                environment: data.environment,
                startTime: data.startTime,
                endTime: data.endTime,
                durationMs: data.durationMs,
                status: data.status,
            })
            .onConflictDoUpdate({
                target: [
                    traces.projectId,
                    traces.traceId,
                ],
                set: {
                    serviceName: data.serviceName,
                    environment: data.environment,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    durationMs: data.durationMs,
                    status: data.status,
                }
            })
            .returning();

        const trace = result[0];
        if (!trace) {
            throw new Error("Failed to upsert trace");
        };

        return trace;
    };

    async listByProject(
        projectId: string,
        limit: 100,
    ){
        return await db
            .select()
            .from(traces)
            .where(eq(traces.projectId, projectId))
            .orderBy(desc(traces.startTime))
            .limit(limit);
    }
}