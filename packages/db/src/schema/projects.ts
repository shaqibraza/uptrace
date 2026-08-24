import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations.js";

export const projects = pgTable(
    "projects",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, {
                onDelete: "cascade",
            }),

        name: varchar("name", {
            length: 100,
        }).notNull(),

        slug: varchar("slug", {
            length: 120,
        }).notNull(),

        description: text("description"),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).defaultNow().notNull(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        }).defaultNow().notNull(),
    },
    (table) => ({
        organizationSlugUnique: unique().on(
            table.organizationId,
            table.slug,
        ),
    }),
);