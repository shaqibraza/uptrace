import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    bigint,
    jsonb,
    index,
    unique,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

import { traces } from "./traces.js";

export const spans = pgTable(
    "spans",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, {
                onDelete: "cascade",
            }),

        traceId: varchar("trace_id", {
            length: 32,
        }).notNull(),

        spanId: varchar("span_id", {
            length: 16,
        }).notNull(),

        parentSpanId: varchar("parent_span_id", {
            length: 16,
        }),

        traceRecordId: uuid("trace_record_id")
            .references(() => traces.id, {
                onDelete: "cascade",
            }),

        serviceName: varchar("service_name", {
            length: 255,
        }).notNull(),

        name: varchar("name", {
            length: 500,
        }).notNull(),

        kind: varchar("kind", {
            length: 50,
        }).notNull(),

        startTime: timestamp("start_time", {
            withTimezone: true,
        }).notNull(),

        endTime: timestamp("end_time", {
            withTimezone: true,
        }),

        durationMs: bigint("duration_ms", {
            mode: "number",
        }),

        status: varchar("status", {
            length: 20,
        }).notNull(),

        statusMessage: varchar("status_message", {
            length: 1000,
        }),

        attributes: jsonb("attributes"),

        resourceAttributes: jsonb("resource_attributes"),

        events: jsonb("events"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).defaultNow().notNull(),
    },
    (table) => ({
        projectTraceSpanUnique: unique(
            "spans_project_trace_span_unique",
        ).on(
            table.projectId,
            table.traceId,
            table.spanId,
        ),

        projectTraceIndex: index(
            "spans_project_trace_idx",
        ).on(
            table.projectId,
            table.traceId,
        ),

        traceSpanIndex: index(
            "spans_trace_span_idx",
        ).on(
            table.traceId,
            table.spanId,
        ),

        parentSpanIndex: index(
            "spans_parent_span_idx",
        ).on(
            table.traceId,
            table.parentSpanId,
        ),

        projectStartTimeIndex: index(
            "spans_project_start_time_idx",
        ).on(
            table.projectId,
            table.startTime,
        ),

        projectServiceIndex: index(
            "spans_project_service_idx",
        ).on(
            table.projectId,
            table.serviceName,
        ),
    }),
);