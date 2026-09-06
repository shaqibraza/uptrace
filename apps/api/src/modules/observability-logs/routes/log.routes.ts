import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";

import { ProjectRepository } from "../../projects/repositories/project.repository.js";

import { ProjectApiKeyRepository } from "../../projects/repositories/project-api-key.repository.js";

import { ProjectApiKeyService } from "../../projects/services/project-api-key.service.js";

import { ProjectService } from "../../projects/services/project.service.js";

import { createTelemetryAuthMiddleware } from "../../telemetry/middlewares/telemetry-auth.middleware.js";

import { LogController } from "../controllers/log.controller.js";

import { LogRepository } from "../repositories/log.repository.js";

import { LogIngestionService } from "../services/log-ingestion.service.js";

import { LogService } from "../services/log.service.js";

export function createLogRouter() {
    const router = Router();

    /*
     * Shared project dependencies
     */
    const projectRepository =
        new ProjectRepository();

    const organizationRepository =
        new OrganizationRepository();

    const projectService =
        new ProjectService(
            organizationRepository,
            projectRepository,
        );

    /*
     * Telemetry API-key authentication
     *
     * Used ONLY for POST /v1/logs.
     */
    const projectApiKeyRepository =
        new ProjectApiKeyRepository();

    const projectApiKeyService =
        new ProjectApiKeyService(
            projectRepository,
            organizationRepository,
            projectApiKeyRepository,
        );

    const telemetryAuthMiddleware =
        createTelemetryAuthMiddleware(
            projectApiKeyService,
        );

    /*
     * Log dependencies
     */
    const logRepository =
        new LogRepository();

    const logIngestionService =
        new LogIngestionService(
            logRepository,
        );

    const logService =
        new LogService(
            logRepository,
            projectService,
        );

    const logController =
        new LogController(
            logIngestionService,
            logService,
        );

    /*
     * ---------------------------------------------------------
     * OTLP INGESTION
     * ---------------------------------------------------------
     *
     * POST /v1/logs
     *
     * Auth:
     * x-uptrace-api-key
     */
    router.post(
        "/v1/logs",
        telemetryAuthMiddleware,
        logController.ingest,
    );

    /*
     * ---------------------------------------------------------
     * LOG READ APIs
     * ---------------------------------------------------------
     *
     * Auth:
     * Bearer access token
     */

    router.get(
        "/projects/:projectId/logs/summary",
        requireAuth,
        logController.getSummary,
    );

    router.get(
        "/projects/:projectId/logs/sources",
        requireAuth,
        logController.getSources,
    );

    router.get(
        "/projects/:projectId/logs/:logId",
        requireAuth,
        logController.getById,
    );

    router.get(
        "/projects/:projectId/logs",
        requireAuth,
        logController.list,
    );

    return router;
}