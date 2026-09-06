import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    jsonb,
    index,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

export const logs = pgTable(
    "logs",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, {
                onDelete: "cascade",
            }),

        timestamp: timestamp("timestamp", {
            withTimezone: true,
        }).notNull(),

        observedTimestamp: timestamp(
            "observed_timestamp",
            {
                withTimezone: true,
            },
        ),

        severityNumber: varchar(
            "severity_number",
            {
                length: 20,
            },
        ),

        severityText: varchar(
            "severity_text",
            {
                length: 50,
            },
        ),

        body: text("body"),

        traceId: varchar("trace_id", {
            length: 32,
        }),

        spanId: varchar("span_id", {
            length: 16,
        }),

        serviceName: varchar(
            "service_name",
            {
                length: 255,
            },
        ),

        environment: varchar(
            "environment",
            {
                length: 100,
            },
        ),

        attributes: jsonb("attributes"),

        resourceAttributes: jsonb(
            "resource_attributes",
        ),

        scopeName: varchar("scope_name", {
            length: 255,
        }),

        scopeVersion: varchar(
            "scope_version",
            {
                length: 100,
            },
        ),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        projectTimestampIndex: index(
            "logs_project_timestamp_idx",
        ).on(
            table.projectId,
            table.timestamp,
        ),

        projectServiceIndex: index(
            "logs_project_service_idx",
        ).on(
            table.projectId,
            table.serviceName,
        ),

        projectSeverityIndex: index(
            "logs_project_severity_idx",
        ).on(
            table.projectId,
            table.severityText,
        ),

        projectTraceIndex: index(
            "logs_project_trace_idx",
        ).on(
            table.projectId,
            table.traceId,
        ),

        projectEnvironmentIndex: index(
            "logs_project_environment_idx",
        ).on(
            table.projectId,
            table.environment,
        ),
    }),
);