import { db, client } from "./db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/index.js";
import { errorHandler } from "./core/errors/error-handler.js";
import { logger } from "./core/logger/index.js";
import { notFoundHandler } from "./core/middleware/not-found.js";


import { createAuthRouter } from "./modules/auth/routes/auth.routes.js";
import { createOrganizationRouter } from "./modules/organizations/routes/organization.routes.js";
import { createProjectRouter } from "./modules/projects/routes/project.routes.js";
import { createHttpEndpointRouter } from "./modules/http-monitoring/routes/http-endpoint.routes.js";
import { createHttpCheckResultRouter } from "./modules/http-monitoring/routes/http-check-result.routes.js";
import { createProjectApiKeyRouter } from "./modules/projects/routes/project-api-key.routes.js";
import { createTelemetryRouter } from "./modules/telemetry/routes/telemetry.routes.js";


export const app = express();

app.use(
    pinoHttp({
        logger,
    }),
);

app.use(helmet());

app.use(
    cors({
        origin: env.WEB_URL,
        credentials: true,
    }),
);

app.use(
    "/v1/traces",
    express.raw({
        type: [
            "application/x-protobuf",
            "application/json",
        ],
        limit: "10mb",
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(createTelemetryRouter());
app.use("/auth", createAuthRouter());
app.use("/organizations", createOrganizationRouter());
app.use("/", createProjectRouter());
app.use("/", createHttpEndpointRouter());
app.use("/", createHttpCheckResultRouter());
app.use("/", createProjectApiKeyRouter());

app.get("/health", async (_req, res, next) => {
    try {
        await client`SELECT 1`;

        res.status(200).json({
            status: "ok",
            service: "uptrace-api",
            database: "connected",
        });
    } catch (error) {
        next(error);
    }
});

app.use(notFoundHandler);
app.use(errorHandler);