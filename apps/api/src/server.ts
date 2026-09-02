import "./telemetry.js";

import "dotenv/config";

import "./modules/telemetry/instrumentation.js";

import { app } from "./app.js";

import { env } from "./config/index.js";

import { logger } from "./core/logger/logger.js";

import { HttpEndpointRepository } from "./modules/http-monitoring/repositories/http-endpoint.repository.js";

import { HttpCheckResultRepository } from "./modules/http-monitoring/repositories/http-check-result.repository.js";

import { HttpCheckResultService } from "./modules/http-monitoring/services/http-check-result.service.js";

import { HttpCheckWorker } from "./modules/http-monitoring/workers/http-check.worker.js";

import { HttpCheckScheduler } from "./modules/http-monitoring/scheduler/http-check.scheduler.js";

import { ProjectRepository } from "./modules/projects/repositories/project.repository.js";

import { OrganizationRepository } from "./modules/organizations/repositories/organization.repository.js";

const httpEndpointRepository =
    new HttpEndpointRepository();

const httpCheckResultRepository =
    new HttpCheckResultRepository();

const projectRepository =
    new ProjectRepository();

const organizationRepository =
    new OrganizationRepository();

const httpCheckResultService =
    new HttpCheckResultService(
        httpCheckResultRepository,
        httpEndpointRepository,
        projectRepository,
        organizationRepository,
    );

const httpCheckWorker =
    new HttpCheckWorker(
        httpCheckResultService,
    );

const httpCheckScheduler =
    new HttpCheckScheduler(
        httpEndpointRepository,
        httpCheckWorker,
    );

await httpCheckScheduler.start();

const server = app.listen(
    env.PORT,
    () => {
        logger.info(
            {
                port: env.PORT,
            },
            "Uptrace API started",
        );
    },
);

const shutdown = (signal: string) => {
    logger.info(
        {
            signal,
        },
        "Shutdown signal received",
    );

    httpCheckScheduler.stop();

    server.close(() => {
        console.log(
            "HTTP Server Closed.",
        );

        process.exit(0);
    });
};

process.on(
    "SIGINT",
    () => shutdown("SIGINT"),
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM"),
);