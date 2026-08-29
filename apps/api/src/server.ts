import "./telemetry.js";
import "dotenv/config";
import "./modules/telemetry/instrumentation.js";
import { app } from "./app.js";
import { env } from "./config/index.js";
import { logger } from "./core/logger/logger.js";


const server = app.listen(env.PORT, () => {
    logger.info(
        { port: env.PORT },
        "Uptrace API started",
    );
});

const shutdown = (signal: string) => {
    logger.info(
        { signal },
        "Shutdown signal received",
    );

    server.close(() => {
        console.log("HTTP Server Closed.");
        process.exit(0);
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));