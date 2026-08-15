import { RISK_LEVELS } from "@/constants";
import { sql } from "drizzle-orm";
import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { Agreements } from "./agreements";

export const RiskLevelEnum = pgEnum("risk_level", RISK_LEVELS);

export const Risks = pgTable(
    "risks",
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`)
            .notNull(),
        agreement_id: uuid()
            .references(() => Agreements.id)
            .notNull(),
        clause: text().notNull(),
        reason: text().notNull(),
        level: RiskLevelEnum().notNull(),
        updated_at: timestamp()
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
        created_at: timestamp().defaultNow().notNull(),
    },
    (table) => [index("risks_agreement_id_idx").on(table.agreement_id)],
);

export type RisksSchema = typeof Risks.$inferSelect;
