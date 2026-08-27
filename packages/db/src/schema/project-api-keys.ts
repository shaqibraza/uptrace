import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

export const projectApiKeys = pgTable(
    "project_api_keys",
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
            length: 100,
        }).notNull(),

        keyPrefix: varchar("key_prefix", {
            length: 16,
        }).notNull(),

        keyHash: varchar("key_hash", {
            length: 255,
        }).notNull().unique(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),

        lastUsedAt: timestamp("last_used_at", {
            withTimezone: true,
        }),

        revokedAt: timestamp("revoked_at", {
            withTimezone: true,
        }),
    },
    (table) => ({
        projectIdIndex: index(
            "project_api_keys_project_id_idx",
        ).on(table.projectId),

        projectActiveKeysIndex: index(
            "project_api_keys_project_revoked_idx",
        ).on(
            table.projectId,
            table.revokedAt,
        ),
    }),
);