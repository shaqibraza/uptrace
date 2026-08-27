import { and, desc, eq } from "drizzle-orm";

import { spans } from "@uptrace/db";

import { db } from "../../../db.js";


export class SpanRepository {
    async create(data: {
        projectId: string;
        traceId: string;
        spanId: string;
        parentSpanId?: string | null;
        traceRecordId?: string | null;
        serviceName: string;
        name: string;
        kind: string;
        startTime: Date;
        endTime?: Date | null;
        durationMs?: number | null;
        status: string;
        statusMessage?: string | null;
        attributes?: unknown;
        resourceAttributes?: unknown;
        events?: unknown;
    }) {
        const result = await db
            .insert(spans)
            .values({
                projectId: data.projectId,
                traceId: data.traceId,
                spanId: data.spanId,
                parentSpanId: data.parentSpanId,
                traceRecordId: data.traceRecordId,
                serviceName: data.serviceName,
                name: data.name,
                kind: data.kind,
                startTime: data.startTime,
                endTime: data.endTime,
                durationMs: data.durationMs,
                status: data.status,
                statusMessage: data.statusMessage,
                attributes: data.attributes,
                resourceAttributes: data.resourceAttributes,
                events: data.events,
            })
            .returning();

        const span = result[0];
        if (!span) {
            throw new Error("Failed to create span");
        };

        return span;
    };

    async findById(spanRecordId: string) {
        const result = await db
            .select()
            .from(spans)
            .where(eq(spans.id, spanRecordId))
            .limit(1);

        return result[0] ?? null;
    };

    async findBySpanId(
        projectId: string,
        traceId: string,
        spanId: string,
    ) {
        const result = await db
            .select()
            .from(spans)
            .where(
                and(
                    eq(spans.projectId, projectId),
                    eq(spans.traceId, traceId),
                    eq(spans.spanId, spanId),
                ),
            )
            .limit(1);

        return result[0] ?? null;
    };


    async upsert(data: {
        projectId: string;
        traceId: string;
        spanId: string;
        parentSpanId?: string | null;
        traceRecordId?: string | null;
        serviceName: string;
        name: string;
        kind: string;
        startTime: Date;
        endTime?: Date | null;
        durationMs?: number | null;
        status: string;
        statusMessage?: string | null;
        attributes?: unknown;
        resourceAttributes?: unknown;
        events?: unknown;
    }) {
        const result = await db
            .insert(spans)
            .values({
                projectId: data.projectId,
                traceId: data.traceId,
                spanId: data.spanId,
                parentSpanId: data.parentSpanId,
                traceRecordId: data.traceRecordId,
                serviceName: data.serviceName,
                name: data.name,
                kind: data.kind,
                startTime: data.startTime,
                endTime: data.endTime,
                durationMs: data.durationMs,
                status: data.status,
                statusMessage: data.statusMessage,
                attributes: data.attributes,
                resourceAttributes: data.resourceAttributes,
                events: data.events,
            })
            .onConflictDoUpdate({
                target: [
                    spans.projectId,
                    spans.traceId,
                    spans.spanId,
                ],
                set: {
                    parentSpanId: data.parentSpanId,
                    traceRecordId: data.traceRecordId,
                    serviceName: data.serviceName,
                    name: data.name,
                    kind: data.kind,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    durationMs: data.durationMs,
                    status: data.status,
                    statusMessage: data.statusMessage,
                    attributes: data.attributes,
                    resourceAttributes: data.resourceAttributes,
                    events: data.events,
                },
            })
            .returning();

        const span = result[0];

        if (!span) {
            throw new Error("Failed to upsert span");
        }

        return span;
    }

    async listByTrace(
        projectId: string,
        traceId: string,
    ) {
        return await db
            .select()
            .from(spans)
            .where(
                and(
                    eq(spans.projectId, projectId),
                    eq(spans.traceId, traceId),
                ),
            )
            .orderBy(desc(spans.startTime));
    }
}