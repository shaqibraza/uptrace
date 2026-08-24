import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";

import { ProjectController } from "../controllers/project.controller.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectService } from "../services/project.service.js";

export function createProjectRouter() {
    const router = Router();

    const projectRepository =
        new ProjectRepository();

    const organizationRepository =
        new OrganizationRepository();

    const projectService =
        new ProjectService(
            organizationRepository,
            projectRepository,
        );

    const projectController =
        new ProjectController(
            projectService,
        );

    router.use(requireAuth);

    router.post(
        "/organizations/:organizationId/projects",
        projectController.create,
    );

    router.get(
        "/organizations/:organizationId/projects",
        projectController.list,
    );

    router.get(
        "/projects/:projectId",
        projectController.getById,
    );

    router.patch(
        "/projects/:projectId",
        projectController.update,
    );

    router.delete(
        "/projects/:projectId",
        projectController.delete,
    );

    return router;
}