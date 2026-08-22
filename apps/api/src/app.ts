import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { env } from "./config/index.js";
import { errorHandler } from "./core/errors/error-handler.js";
import { logger } from "./core/logger/index.js";
import { notFoundHandler } from "./core/middleware/not-found.js";

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

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "uptrace-api",
    });
});

app.use(notFoundHandler);
app.use(errorHandler);