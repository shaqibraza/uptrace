import { db, client } from "./db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { createDb } from "@uptrace/db";
import { env } from "./config/index.js";
import { errorHandler } from "./core/errors/error-handler.js";
import { logger } from "./core/logger/index.js";
import { notFoundHandler } from "./core/middleware/not-found.js";


import { createAuthRouter } from "./modules/auth/routes/auth.routes.js";
import { createOrganizationRouter } from "./modules/organizations/routes/organization.routes.js";


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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/auth", createAuthRouter());
app.use("/organizations", createOrganizationRouter());

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