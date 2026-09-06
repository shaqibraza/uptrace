import {
    pgTable,
    uuid,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    name: varchar("name", {
        length: 100,
    }),

    email: varchar("email", {
        length: 255,
    })
        .notNull()
        .unique(),

    profileImageUrl: varchar("profile_image_url", {
        length: 500,
    }),

    passwordHash: varchar("password_hash", {
        length: 255,
    }),

    emailVerifiedAt: timestamp("email_verified_at", {
        withTimezone: true,
    }),

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