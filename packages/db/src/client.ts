import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

export function createDb(databaseUrl: string) {
    const client = postgres(databaseUrl, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
    });

    const db = drizzle(client);

    return {
        db,
        client,
    };
}