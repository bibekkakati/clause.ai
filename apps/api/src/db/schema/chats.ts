import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { Agreements } from "./agreements";
import { Users } from "./users";

export const Chats = pgTable(
    "chats",
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`)
            .notNull(),
        user_id: uuid()
            .references(() => Users.id)
            .notNull(),
        agreement_id: uuid()
            .unique()
            .references(() => Agreements.id)
            .notNull(),

        created_at: timestamp().defaultNow().notNull(),
    },
    (table) => [
        index("chats_user_id_idx").on(table.user_id),
        index("chats_agreement_id_idx").on(table.agreement_id),
    ],
);

export type ChatsSchema = typeof Chats.$inferSelect;
