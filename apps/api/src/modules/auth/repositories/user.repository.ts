import { eq } from "drizzle-orm";
import { users } from "@uptrace/db";
import { db } from "../../../db.js";


export class UserRepository {
    async findByEmail(email: string) {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result[0] ?? null;
    };

    async findById(id: string) {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return result[0] ?? null;
    };

    async create(data: {
        email: string;
        passwordHash: string
    }) {
        const result = await db
            .insert(users)
            .values({
                email: data.email,
                passwordHash: data.passwordHash
            })
            .returning();

        const user = result[0];

        if (!user) {
            throw new Error("Failed to create user");
        }

        return user;
    };

    async markEmailVerified(userId: string){
        const result = await db
            .update(users)
            .set({
                emailVerifiedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
                emailVerifiedAt: users.emailVerifiedAt
            });

        return result[0] ?? null;
    };
};