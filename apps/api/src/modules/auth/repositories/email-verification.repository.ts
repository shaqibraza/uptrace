import { and, eq, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";

import { db } from "../../../db.js";
import { emailVerificationTokens } from "@uptrace/db";


export class EmailVerificationRepository {
    async create(userId: string) {
        const rawToken = randomBytes(32).toString("hex");

        const tokenHash = createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await db.insert(emailVerificationTokens).values({
            userId,
            tokenHash,
            expiresAt
        });

        return {
            rawToken,
            expiresAt,
        };
    };

    async findValidToken(rawToken: string) {
        const tokenHash = createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const result = await db
            .select()
            .from(emailVerificationTokens)
            .where(and(
                eq(emailVerificationTokens.tokenHash, tokenHash),
                isNull(emailVerificationTokens.usedAt),
            ),)
            .limit(1);

        const token = result[0];
        if (!token || token.expiresAt <= new Date()) {
            return null
        };

        return token;
    };

    async markUsed(id: string){
        await db
            .update(emailVerificationTokens)
            .set({
                usedAt: new Date(),
            })
            .where(eq(emailVerificationTokens.id, id));
    }
}