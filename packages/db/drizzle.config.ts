import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const env = config().parsed;

export default defineConfig({
    schema: "./src/schema/**/*.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: env?.DATABASE_URL!,
    },
});