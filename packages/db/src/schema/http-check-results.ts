import {
    pgEnum,
    pgTable,
    uuid,
    integer,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

import { index } from "drizzle-orm/pg-core";

import { httpEndpoints } from "./http-endpoints.js";

export const httpCheckStatusEnum = pgEnum(
    "http_check_status",
    ["UP", "DOWN"],
);

export const httpCheckResults = pgTable("http_check_results", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    endpointId: uuid("endpoint_id")
        .notNull()
        .references(() => httpEndpoints.id, {
            onDelete: "cascade",
        }),

    status: httpCheckStatusEnum("status")
        .notNull(),

    statusCode: integer("status_code"),

    responseTimeMs: integer("response_time_ms"),

    errorMessage: text("error_message"),

    checkedAt: timestamp("checked_at", {
        withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
}, (table) => [
    index("http_check_results_endpoint_checked_at_idx").on(
        table.endpointId,
        table.checkedAt,
    ),
]);