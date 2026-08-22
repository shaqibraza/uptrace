import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({
    path: resolve(process.cwd(), "../../.env"),
});
import { sql } from "./client.js";

try {
    const result = await sql`SELECT NOW() AS current_time`;

    console.log("PostgreSQL connection successful:", result[0]);

    await sql.end();
} catch (error) {
    console.error("PostgreSQL connection failed:", error);
    process.exit(1);
}