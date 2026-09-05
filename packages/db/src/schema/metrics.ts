import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    doublePrecision,
    jsonb,
    index,
} from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const metrics = pgTable(
    "metrics",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, {
                onDelete: "cascade",
            }),

        name: varchar("name", {
            length: 500,
        }).notNull(),

        type: varchar("type", {
            length: 50,
        }).notNull(),

        description: varchar("description", {
            length: 1000,
        }),

        unit: varchar("unit", {
            length: 100,
        }),

        serviceName: varchar("service_name", {
            length: 255,
        }),

        environment: varchar("environment", {
            length: 100,
        }),

        value: doublePrecision("value").notNull(),

        attributes: jsonb("attributes"),

        resourceAttributes: jsonb("resource_attributes"),

        timestamp: timestamp("timestamp", {
            withTimezone: true,
        }).notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        projectTimestampIndex: index(
            "metrics_project_timestamp_idx",
        ).on(table.projectId, table.timestamp),

        projectNameIndex: index(
            "metrics_project_name_idx",
        ).on(table.projectId, table.name),

        projectServiceIndex: index(
            "metrics_project_service_idx",
        ).on(table.projectId, table.serviceName),

        projectTypeIndex: index(
            "metrics_project_type_idx",
        ).on(table.projectId, table.type),

        projectServiceTimestampIndex: index(
            "metrics_project_service_timestamp_idx",
        ).on(
            table.projectId,
            table.serviceName,
            table.timestamp,
        ),
    }),
);