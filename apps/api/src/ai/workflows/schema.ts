import { ParserAgentOutput } from "@/ai/agents/parser.agent";
import { RiskLevelType, SECTION_CLAUSE_TYPES } from "@/constants";
import { z } from "zod";

export const SectionItemSchema = z.object({
    id: z.string().optional(),
    ref: z.string(),
    type: z.enum(SECTION_CLAUSE_TYPES),
    heading: z.string(),
    content: z.string(),
    embedding: z.array(z.number()).nullable().optional(),
});

export const EmbeddingSectionInputSchema = z.object({
    sectionId: z.string(),
    heading: z.string(),
    content: z.string(),
});

export const EmbeddingSectionOutputSchema = z.object({
    sectionId: z.string(),
    embedding: z.array(z.number()),
});

export const RiskItemSchema = z.object({
    clause: z.string(),
    reason: z.string(),
    level: z.custom<RiskLevelType>(),
});

export const PreparedRiskContentSchema = z.object({
    key: z.string(),
    content: z.string(),
});

export const RiskAnalyzeOutputSchema = z.object({
    key: z.string(),
    clause: z.string(),
    reason: z.string(),
    level: z.custom<RiskLevelType>(),
});

export const WorkflowStateSchema = z.object({
    // Initial state (immutable)
    userId: z.string().readonly(),
    agreementId: z.string().readonly(),
    fileUrl: z.string().readonly(),
    mimeType: z.string().readonly(),
    forceRestart: z.boolean().optional(),

    // Running step actions
    skipParserAgent: z.boolean().default(false).optional(),
    skipSummaryAgent: z.boolean().default(false).optional(),
    skipRiskAgent: z.boolean().default(false).optional(),

    // Post parsing data
    title: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    summary: z.array(z.string()).nullable().optional(),
    metadata: z.custom<ParserAgentOutput["metadata"]>().nullable().optional(),
    property: z.custom<ParserAgentOutput["property"]>().nullable().optional(),
    payments: z.custom<ParserAgentOutput["payments"]>().nullable().optional(),
    parties: z.custom<ParserAgentOutput["parties"]>().nullable().optional(),
    sections: z.array(SectionItemSchema).nullable().optional(),
    risks: z.array(RiskItemSchema).nullable().optional(),
});
