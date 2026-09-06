import { Router } from "express";

import { requireAuth } from "../../auth/middlewares/auth.middleware.js";

import { OrganizationRepository } from "../../organizations/repositories/organization.repository.js";

import { ProjectRepository } from "../../projects/repositories/project.repository.js";

import { ProjectService } from "../../projects/services/project.service.js";

import { MetricController } from "../controllers/metric.controller.js";

import { MetricRepository } from "../repositories/metric.repository.js";

import { MetricService } from "../services/metric.service.js";

export function createMetricRouter() {
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

    const metricRepository =
        new MetricRepository();

    const metricService =
        new MetricService(
            metricRepository,
            projectService,
        );

    const metricController =
        new MetricController(
            metricService,
        );

    router.use(requireAuth);

    router.get(
        "/projects/:projectId/metrics/summary",
        metricController.getSummary,
    );

    router.get(
        "/projects/:projectId/metrics/sources",
        metricController.getSources,
    );

    router.get(
        "/projects/:projectId/metrics/:metricName/time-series",
        metricController.getTimeSeries,
    );

    router.get(
        "/projects/:projectId/metrics/:metricName",
        metricController.getDetail,
    );

    router.get(
        "/projects/:projectId/metrics",
        metricController.list,
    );

    return router;
}