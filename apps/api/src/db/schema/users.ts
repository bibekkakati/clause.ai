import { sql } from "drizzle-orm";
import {
    boolean,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const Users = pgTable(
    "users",
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`)
            .notNull(),
        name: varchar({ length: 255 }).notNull(),
        email: varchar({ length: 255 }).unique().notNull(),
        is_verified: boolean().default(false).notNull(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
        created_at: timestamp().defaultNow().notNull(),
    },
    (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export type UsersSchema = typeof Users.$inferSelect;
