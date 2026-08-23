import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { organizations } from "./organizations.js";

export const organizationMembers = pgTable(
    "organization_members",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, {
                onDelete: "cascade",
            }),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        role: varchar("role", { length: 20 })
            .notNull()
            .$type<"OWNER" | "ADMIN" | "MEMBER">(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).defaultNow().notNull(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        }).defaultNow().notNull(),
    },
    (table) => ({
        organizationUserUnique: unique().on(
            table.organizationId,
            table.userId,
        ),
    }),
);