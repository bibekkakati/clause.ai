import { FILE_STATUS } from "@/constants";
import { sql } from "drizzle-orm";
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { Users } from "./users";

export const FileStatusEnum = pgEnum("file_status", FILE_STATUS);

export const Files = pgTable(
    "files",
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`)
            .notNull(),
        user_id: uuid()
            .references(() => Users.id)
            .notNull(),
        file_name: varchar({ length: 255 }).notNull(),
        mime_type: varchar({ length: 60 }).notNull(),
        key: text().default("").notNull(),
        status: FileStatusEnum().notNull(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
        created_at: timestamp().defaultNow().notNull(),
    },
    (table) => [
        index("files_user_status_created_idx").on(
            table.user_id,
            table.status,
            table.created_at,
        ),
        index("files_status_created_idx").on(table.status, table.created_at),
    ],
);

export type FilesSchema = typeof Files.$inferSelect;
