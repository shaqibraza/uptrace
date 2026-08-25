import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";

import { ProjectRepository } from "../../projects/repositories/project.repository.js";

import { HttpCheckResultController } from "../controllers/http-check-result.controller.js";

import { HttpEndpointRepository } from "../repositories/http-endpoint.repository.js";

import { HttpCheckResultRepository } from "../repositories/http-check-result.repository.js";

import { HttpCheckResultService } from "../services/http-check-result.service.js";

export function createHttpCheckResultRouter() {
    const router = Router();

    const httpCheckResultRepository =
        new HttpCheckResultRepository();

    const httpEndpointRepository =
        new HttpEndpointRepository();

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

    const httpCheckResultController =
        new HttpCheckResultController(
            httpCheckResultService,
        );

    router.use(requireAuth);

    router.get(
        "/http-endpoints/:endpointId/check-results/latest",
        httpCheckResultController.getLatestByEndpointId,
    );

    router.get(
        "/http-endpoints/:endpointId/check-results",
        httpCheckResultController.getByEndpointId,
    );

    return router;
}