import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectRepository } from "../../projects/repositories/project.repository.js";

import { HttpEndpointController } from "../controllers/http-endpoint.controller.js";
import { HttpEndpointRepository } from "../repositories/http-endpoint.repository.js";
import { HttpEndpointService } from "../services/http-endpoint.service.js";

export function createHttpEndpointRouter() {
    const router = Router();

    const httpEndpointRepository =
        new HttpEndpointRepository();

    const projectRepository =
        new ProjectRepository();

    const organizationRepository =
        new OrganizationRepository();

    const httpEndpointService =
        new HttpEndpointService(
            httpEndpointRepository,
            projectRepository,
            organizationRepository,
        );

    const httpEndpointController =
        new HttpEndpointController(
            httpEndpointService,
        );

    router.use(requireAuth);

    router.post(
        "/projects/:projectId/http-endpoints",
        httpEndpointController.create,
    );

    router.get(
        "/projects/:projectId/http-endpoints",
        httpEndpointController.list,
    );

    router.get(
        "/http-endpoints/:endpointId",
        httpEndpointController.getById,
    );

    router.patch(
        "/http-endpoints/:endpointId",
        httpEndpointController.update,
    );

    router.delete(
        "/http-endpoints/:endpointId",
        httpEndpointController.delete,
    );

    return router;
}   