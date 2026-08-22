import pino from "pino";

import { env } from "../../config/index.js";

const developmentTransport =
    env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
            },
        }
        : undefined;

export const logger = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",

    ...(developmentTransport
        ? {
            transport: developmentTransport,
        }
        : {}),

    base: {
        service: "uptrace-api",
    },
});