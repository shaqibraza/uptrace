import { Router } from "express";

import { createTelemetryAuthMiddleware } from "../../telemetry/middlewares/telemetry-auth.middleware.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectRepository } from "../../projects/repositories/project.repository.js";
import { ProjectApiKeyRepository } from "../../projects/repositories/project-api-key.repository.js";
import { ProjectApiKeyService } from "../../projects/services/project-api-key.service.js";

import { MetricIngestionController } from "../controllers/metric-ingestion.controller.js";
import { MetricRepository } from "../repositories/metric.repository.js";
import { MetricIngestionService } from "../services/metric-ingestion.service.js";

export function createMetricIngestionRouter() {
    const router = Router();

    const projectRepository = new ProjectRepository();

    const organizationRepository =
        new OrganizationRepository();

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

    const metricRepository = new MetricRepository();

    const metricIngestionService =
        new MetricIngestionService(
            metricRepository,
        );

    const metricIngestionController =
        new MetricIngestionController(
            metricIngestionService,
        );

    router.post(
        "/v1/metrics",
        telemetryAuthMiddleware,
        metricIngestionController.ingest,
    );

    return router;
}