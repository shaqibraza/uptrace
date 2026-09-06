import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectRepository } from "../../projects/repositories/project.repository.js";
import { ProjectService } from "../../projects/services/project.service.js";
import { OverviewController } from "../controllers/overview.controller.js";
import { OverviewRepository } from "../repositories/overview.repository.js";
import { OverviewService } from "../services/overview.service.js";

export function createOverviewRouter() {
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

    const overviewRepository =
        new OverviewRepository();

    const overviewService =
        new OverviewService(
            overviewRepository,
            projectService,
        );

    const overviewController =
        new OverviewController(
            overviewService,
        );

    router.use(requireAuth);

    router.get(
        "/projects/:projectId/overview",
        overviewController.getSummary.bind(
            overviewController,
        ),
    );

    return router;
}