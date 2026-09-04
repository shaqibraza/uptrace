import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectRepository } from "../../projects/repositories/project.repository.js";
import { ProjectService } from "../../projects/services/project.service.js";

import { ServiceController } from "../controllers/service.controller.js";
import { ServiceRepository } from "../repositories/service.repository.js";
import { ServiceService } from "../services/service.service.js";

export function createServiceRouter() {
    const router = Router();

    const organizationRepository =
        new OrganizationRepository();

    const projectRepository =
        new ProjectRepository();

    const projectService =
        new ProjectService(
            organizationRepository,
            projectRepository,
        );

    const serviceRepository =
        new ServiceRepository();

    const serviceService =
        new ServiceService(
            serviceRepository,
            projectService,
        );

    const serviceController =
        new ServiceController(
            serviceService,
        );

    router.use(requireAuth);

    // Services list
    router.get(
        "/projects/:projectId/services",
        serviceController.list.bind(
            serviceController,
        ),
    );

    // Service detail
    router.get(
        "/projects/:projectId/services/:serviceName",
        serviceController.getDetail.bind(
            serviceController,
        ),
    );

    return router;
}