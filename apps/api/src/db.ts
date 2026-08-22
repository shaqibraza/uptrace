import { createDb } from "@uptrace/db";

import { env } from "./config/index.js";

export const { db, client } = createDb(env.DATABASE_URL);