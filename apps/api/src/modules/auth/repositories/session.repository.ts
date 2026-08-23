import { and, eq, isNull } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";

import { sessions } from "@uptrace/db";
import { db } from "../../../db.js";


function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
};

export class SessionRepository {
    async create(userId: string, familyId?: string) {
        const rawToken = randomBytes(32).toString("hex");
        const refreshTokenHash = hashToken(rawToken);

        const sessionFamilyId = familyId ?? randomUUID();

        const expiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
        );

        const result = await db
            .insert(sessions)
            .values({
                userId,
                familyId: sessionFamilyId,
                refreshTokenHash,
                expiresAt
            })
            .returning({
                id: sessions.id,
                familyId: sessions.familyId,
                expiresAt: sessions.expiresAt
            });

        const session = result[0];
        if (!session) {
            throw new Error("Failed to create session");
        };

        return {
            id: session.id,
            familyId: session.familyId,
            rawToken,
            expiresAt: session.expiresAt
        };
    };

    async findByRefreshToken(rawToken: string) {
        const refreshTokenHash = hashToken(rawToken);

        const result = await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(sessions.refreshTokenHash, refreshTokenHash),
                    isNull(sessions.revokedAt)
                )
            )
            .limit(1);

        const session = result[0];
        if (!session || session.expiresAt <= new Date()) {
            return null;
        };

        return session;
    };

    async revoke(sessionId: string) {
        await db
            .update(sessions)
            .set({
                revokedAt: new Date(),
            })
            .where(eq(sessions.id, sessionId));

    };

    async updateLastUsed(sessionId: string) {
        await db
            .update(sessions)
            .set({
                lastUsedAt: new Date(),
            })
            .where(eq(sessions.id, sessionId));
    };

    async rotate(refreshToken: string) {
        const refreshTokenHash = hashToken(refreshToken);

        const result = await db
            .select()
            .from(sessions)
            .where(eq(sessions.refreshTokenHash, refreshTokenHash))
            .limit(1);

        const currentSession = result[0];

        if (!currentSession) {
            return {
                status: "invalid" as const,
            };
        }

        if (
            currentSession.revokedAt ||
            currentSession.expiresAt <= new Date()
        ) {
            return {
                status: "reused" as const,
                userId: currentSession.userId,
                familyId: currentSession.familyId,
            };
        }

        await this.revoke(currentSession.id);

        const newSession = await this.create(
            currentSession.userId,
            currentSession.familyId,
        );

        return {
            status: "rotated" as const,
            userId: currentSession.userId,
            ...newSession,
        };
    }

    async revokeFamily(familyId: string) {
        await db
            .update(sessions)
            .set({
                revokedAt: new Date(),
            })
            .where(
                and(
                    eq(sessions.familyId, familyId),
                    isNull(sessions.revokedAt),
                ),
            );
    }

    async revokeByRefreshToken(rawToken: string) {
        const refreshTokenHash = hashToken(rawToken);

        await db
            .update(sessions)
            .set({
                revokedAt: new Date(),
            })
            .where(
                eq(
                    sessions.refreshTokenHash,
                    refreshTokenHash,
                ),
            );
    }
}