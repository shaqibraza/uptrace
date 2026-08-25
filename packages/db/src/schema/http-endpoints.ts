import {
    pgTable,
    uuid,
    varchar,
    integer,
    boolean,
    timestamp,
    text,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

export const httpEndpoints = pgTable("http_endpoints", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, {
            onDelete: "cascade",
        }),

    name: varchar("name", {
        length: 100,
    }).notNull(),

    url: text("url").notNull(),

    method: varchar("method", {
        length: 10,
    }).notNull(),

    expectedStatusCode: integer("expected_status_code")
        .notNull()
        .default(200),

    intervalSeconds: integer("interval_seconds")
        .notNull()
        .default(60),

    timeoutMs: integer("timeout_ms")
        .notNull()
        .default(5000),

    isActive: boolean("is_active")
        .notNull()
        .default(true),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});