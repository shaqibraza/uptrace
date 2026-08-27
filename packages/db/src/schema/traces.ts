import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    bigint,
    index,
    unique,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

export const traces = pgTable(
    "traces",
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

        serviceName: varchar("service_name", {
            length: 255,
        }).notNull(),

        environment: varchar("environment", {
            length: 100,
        }),

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

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).defaultNow().notNull(),
    },
    (table) => ({
        projectTraceIdUnique: unique(
            "traces_project_trace_id_unique",
        ).on(
            table.projectId,
            table.traceId,
        ),

        projectStartTimeIndex: index(
            "traces_project_start_time_idx",
        ).on(
            table.projectId,
            table.startTime,
        ),

        projectServiceIndex: index(
            "traces_project_service_idx",
        ).on(
            table.projectId,
            table.serviceName,
        ),
    }),
);