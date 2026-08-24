import { and, eq } from "drizzle-orm";

import { projects } from "@uptrace/db";

import { db } from "../../../db.js";


export class ProjectRepository {
    async create(data: {
        organizationId: string;
        name: string;
        slug: string;
        description?: string;
    }){
        const result = await db
            .insert(projects)
            .values({
                organizationId: data.organizationId,
                name: data.name,
                slug: data.slug,
                description: data.description
            })
            .returning();

        const project = result[0];
        if (!project) {
            throw new Error("Failed to create project");
        };

        return project;
    };

    async findById(
        projectId: string
    ){
        const result = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        return result[0] ?? null;
    };

    async findBySlug(
        organizationId: string,
        slug: string
    ){
        const result = await db
            .select()
            .from(projects)
            .where(and(
                eq(projects.organizationId, organizationId),
                eq(projects.slug, slug)
            ))
            .limit(1);

        return result[0] ?? null;
    };

    async findOrganizationProjects(
        organizationId: string
    ){
        return await db
            .select()
            .from(projects)
            .where(eq(projects.organizationId, organizationId));
    };

    async update(
        projectId: string,
        data: {
            name?: string;
            description?: string | null;
        }
    ){
        const result = await db
            .update(projects)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, projectId))
            .returning();

        return result[0] ?? null
    };

    async delete(
        projectId: string
    ){
        const result = await db
            .delete(projects)
            .where(eq(projects.id, projectId))
            .returning({ id: projects.id });

        return result[0] ?? null;
    }
}
