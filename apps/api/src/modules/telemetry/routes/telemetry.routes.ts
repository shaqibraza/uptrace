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

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";
import { TraceController } from "../controllers/trace.controller.js";

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

    const traceController =
        new TraceController(
            traceRepository,
            spanRepository,
        );

    // OTLP telemetry ingestion
    router.post(
        "/v1/traces",
        (req, _res, next) => {
            next();
        },
        createTelemetryAuthMiddleware(
            projectApiKeyService,
        ),
        telemetryController.ingestTraces,
    );

    // List traces for a project
    router.get(
        "/projects/:projectId/traces",
        requireAuth,
        traceController.list,
    );

    // Get a single trace with its spans
    router.get(
        "/projects/:projectId/traces/:traceId",
        requireAuth,
        traceController.getByTraceId,
    );

    return router;
}