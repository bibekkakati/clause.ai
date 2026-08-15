import { CHAT_MESSAGE_ROLES } from "@/constants";
import { generateUUIDv7 } from "@/utils/id.util";
import { sql } from "drizzle-orm";
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { Chats } from "./chats";
import { Users } from "./users";

export const ChatMessageRoleEnum = pgEnum("message_role", CHAT_MESSAGE_ROLES);

export const Messages = pgTable(
    "messages",
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`)
            .notNull()
            // Enforce sequential UUIDv7 at database level
            // This ensures that messages are inserted in order
            // for keyset pagination queries
            .$defaultFn(() => generateUUIDv7()),
        user_id: uuid()
            .references(() => Users.id)
            .notNull(),
        chat_id: uuid()
            .references(() => Chats.id)
            .notNull(),

        role: ChatMessageRoleEnum().notNull(),
        content: text().notNull(),

        created_at: timestamp().defaultNow().notNull(),
    },
    (table) => [
        // Composite index to optimize the keyset pagination query
        index("messages_pagination_idx").on(
            table.chat_id,
            table.user_id,
            table.id,
        ),
    ],
);

export type MessagesSchema = typeof Messages.$inferSelect;
