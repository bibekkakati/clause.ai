import { AGREEMENT_STATUS, AGREEMENT_TYPES } from "@/constants";
import { sql } from "drizzle-orm";
import {
    index,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { Files } from "./files";
import { Users } from "./users";

export const AgreementTypeEnum = pgEnum("agreement_type", AGREEMENT_TYPES);
export const AgreementStatusEnum = pgEnum("agreement_status", AGREEMENT_STATUS);

export const Agreements = pgTable(
    "agreements",
    {
        // Required primary fields
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`)
            .notNull(),
        user_id: uuid()
            .references(() => Users.id)
            .notNull(),
        file_id: uuid()
            .references(() => Files.id)
            .unique()
            .notNull(),

        // Post-process data
        title: text(),
        type: AgreementTypeEnum(),
        metadata: jsonb().default(null).$type<Record<string, any>>(),
        property: jsonb().default(null).$type<Record<string, any>>(),
        payments: jsonb().default(null).$type<Record<string, any>>(),
        parties: jsonb().default(null).$type<Record<string, any>[]>(),
        summary: text().array(),

        // Audit fields
        status: AgreementStatusEnum().default("PENDING").notNull(),
        error: text(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
        created_at: timestamp().defaultNow().notNull(),
    },
    (table) => [index("agreement_user_id_idx").on(table.user_id)],
);

export type AgreementsSchema = typeof Agreements.$inferSelect;
