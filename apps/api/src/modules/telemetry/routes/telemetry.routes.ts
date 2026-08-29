import { Router } from "express";

import { createTelemetryAuthMiddleware } from "../middlewares/telemetry-auth.middleware.js";
import { TelemetryController } from "../controllers/telemetry.controller.js";
import { ProjectApiKeyService } from "../../projects/services/project-api-key.service.js";
import { ProjectRepository } from "../../projects/repositories/project.repository.js";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectApiKeyRepository } from "../../projects/repositories/project-api-key.repository.js";
import { TraceRepository } from "../repositories/trace.repository.js";
import { SpanRepository } from "../repositories/span.repository.js";
import { TraceIngestionService } from "../services/trace-ingestion.service.js";

export function createTelemetryRouter() {
    const router = Router();

    const projectRepository =
        new ProjectRepository();

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

    const traceRepository =
        new TraceRepository();

    const spanRepository =
        new SpanRepository();

    const traceIngestionService =
        new TraceIngestionService(
            traceRepository,
            spanRepository,
        );

    const telemetryController =
        new TelemetryController(
            traceIngestionService,
        );

    router.post(
        "/v1/traces",
        createTelemetryAuthMiddleware(
            projectApiKeyService,
        ),
        telemetryController.ingestTraces,
    );

    return router;
}