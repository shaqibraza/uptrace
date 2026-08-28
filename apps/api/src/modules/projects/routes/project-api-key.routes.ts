import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";
import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";
import { ProjectApiKeyController } from "../controllers/project-api-key.controller.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectApiKeyRepository } from "../repositories/project-api-key.repository.js";
import { ProjectApiKeyService } from "../services/project-api-key.service.js";

export function createProjectApiKeyRouter() {
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

    const projectApiKeyController =
        new ProjectApiKeyController(
            projectApiKeyService,
        );

    router.use(requireAuth);

    router.post(
        "/projects/:projectId/api-keys",
        projectApiKeyController.create,
    );

    router.get(
        "/projects/:projectId/api-keys",
        projectApiKeyController.list,
    );

    router.delete(
        "/projects/:projectId/api-keys/:apiKeyId",
        projectApiKeyController.revoke,
    );

    return router;
}