import { and, eq } from "drizzle-orm";
import {
    organizations,
    organizationMembers,
} from "@uptrace/db";

import { db } from "../../../db.js";


export class OrganizationRepository {
    async create(data: {
        name: string;
        slug: string;
        ownerId: string;
    }) {
        return await db.transaction(async (tx) => {
            const organizationResult = await tx
                .insert(organizations)
                .values({
                    name: data.name,
                    slug: data.slug,
                })
                .returning();

            const organization = organizationResult[0];

            if (!organization) {
                throw new Error("Failed to create organization");
            }

            await tx
                .insert(organizationMembers)
                .values({
                    organizationId: organization.id,
                    userId: data.ownerId,
                    role: "OWNER",
                });

            return organization;
        });
    }

    async findById(organizationId: string) {
        const result = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, organizationId))
            .limit(1);

        return result[0] ?? null;
    };

    async findBySlug(slug: string) {
        const result = await db
            .select()
            .from(organizations)
            .where(eq(organizations.slug, slug))
            .limit(1);

        return result[0] ?? null;
    };

    async findUserOrganizations(userId: string) {
        const result = await db
            .select({
                id: organizations.id,
                name: organizations.name,
                slug: organizations.slug,
                createdAt: organizations.createdAt,
                updatedAt: organizations.updatedAt,
                role: organizationMembers.role,
            })
            .from(organizationMembers)
            .innerJoin(
                organizations,
                eq(organizationMembers.organizationId, organizations.id)
            )
            .where(eq(organizationMembers.userId, userId));

        return result;
    };

    async isMember(
        organizationId: string,
        userId: string,
    ) {
        const result = await db
            .select({
                id: organizationMembers.id,
            })
            .from(organizationMembers)
            .where(
                and(
                    eq(
                        organizationMembers.organizationId,
                        organizationId,
                    ),
                    eq(
                        organizationMembers.userId,
                        userId,
                    ),
                ),
            )
            .limit(1);

        return !!result[0];
    };

    async update(
        organizationId: string,
        data: {
            name: string;
        },
    ) {
        const result = await db
            .update(organizations)
            .set({
                name: data.name,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, organizationId))
            .returning();

        return result[0] ?? null;
    };

    async getMembership(
        organizationId: string,
        userId: string,
    ) {
        const result = await db
            .select({
                id: organizationMembers.id,
                role: organizationMembers.role,
            })
            .from(organizationMembers)
            .where(
                and(
                    eq(
                        organizationMembers.organizationId,
                        organizationId,
                    ),
                    eq(
                        organizationMembers.userId,
                        userId,
                    ),
                ),
            )
            .limit(1);

        return result[0] ?? null;
    };

    async delete(organizationId: string) {
        const result = await db
            .delete(organizations)
            .where(eq(organizations.id, organizationId))
            .returning({
                id: organizations.id,
            });

        return result[0] ?? null;
    }
};