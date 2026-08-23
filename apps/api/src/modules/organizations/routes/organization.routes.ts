import { Router } from "express";

import { OrganizationController } from "../controllers/organization.controller.js";
import { OrganizationService } from "../services/organization.service.js";
import { OrganizationRepository } from "../repositories/organization.repository.js";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";


export function createOrganizationRouter(){
    const router = Router();

    const organizationRepository = new OrganizationRepository();

    const organizationService = new OrganizationService(organizationRepository);

    const organizationController = new OrganizationController(organizationService);

    router.use(requireAuth);

    router.post("/", organizationController.create);

    router.get("/", organizationController.list);

    router.get("/:organizationId", organizationController.getById);

    router.patch("/:organizationId", organizationController.update);

    router.delete("/:organizationId", organizationController.delete);

    return router;
};