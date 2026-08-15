import { runParserAgent } from "@/ai/agents/parser.agent";
import * as AgreementsService from "@/services/agreements.service";
import { logger } from "@/utils/logger.util";
import { downloadPDF, parsePDF } from "@/utils/pdf.util";
import { MastraNonRetryableError } from "@mastra/core/error";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { WorkflowStateSchema } from "./schema";

// Parse Agent - LLM CALL
const parseAgentStep = createStep({
    id: "parse-agent-step",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state, setState }) => {
        const { fileUrl, mimeType, agreementId, userId } = state;

        const stepLogger = logger.child({
            step: "parse-agent-step",
            agreementId,
            userId,
        });

        if (!fileUrl || !mimeType) {
            stepLogger.error("Missing parser agent parameters");
            throw new MastraNonRetryableError(
                "Missing parser agent parameters.",
            );
        }

        // Try parsing PDF natively
        let parsedText: string = "";
        try {
            if (mimeType === "application/pdf") {
                const pdfBuffer = (await downloadPDF(
                    agreementId,
                    fileUrl,
                    "buffer",
                )) as Buffer;

                const { text, ocrRequired } = await parsePDF(
                    agreementId,
                    pdfBuffer,
                );

                if (!ocrRequired) {
                    parsedText = text;
                }
            }
        } catch (error: any) {
            // Terminate process in case of error
            stepLogger.error("PDF parser failed");
            throw new MastraNonRetryableError(
                error?.message ?? "Failed to parse PDF",
            );
        }

        stepLogger.info("Starting document parsing step");

        const res = await runParserAgent(agreementId, {
            parsedText,
            fileUrl,
            mimeType,
        });

        if (res.error) {
            stepLogger.warn({ error: res.error }, "Document Error");
            throw new MastraNonRetryableError(res.error);
        }

        stepLogger.info("Parsing completed successfully");

        // Write parsed result to state only — no DB writes
        await setState({
            ...state,
            title: res.title,
            type: res.type,
            metadata: res.metadata,
            property: res.property,
            payments: res.payments,
            parties: res.parties,
            sections: res.sections?.map((sec) => ({
                ref: sec.ref,
                type: sec.type,
                heading: sec.heading,
                content: sec.content,
            })),
        });

        return {};
    },
});

// Store Parser Result - DB CALL
const storeParserResultStep = createStep({
    id: "store-parser-result-step",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state, setState }) => {
        const {
            userId,
            agreementId,
            title,
            type,
            metadata,
            property,
            payments,
            parties,
            sections,
        } = state;

        const stepLogger = logger.child({
            step: "store-parser-result-step",
            agreementId,
            userId,
        });

        // Check if sections already exists in DB
        const existingSections =
            await AgreementsService.fetchSectionsByAgreement(
                agreementId,
                userId,
            );

        stepLogger.info("Storing parser results into database");

        // Update parsed data into agreement
        await AgreementsService.updateAgreement(
            agreementId,
            { title, type, metadata, property, payments, parties },
            userId,
        );

        if (sections && existingSections.length === 0) {
            // Insert the sections
            const sectionIds = await AgreementsService.createSections(
                agreementId,
                sections,
                userId,
            );

            // Update section IDs in state on successfull insertion
            if (sectionIds.length > 0) {
                await setState({
                    ...state,
                    sections: sections.map((sec, index) => ({
                        ...sec,
                        id: sectionIds[index].id,
                    })),
                });
            }
        }

        stepLogger.info("Stored parser results successfully");

        return {};
    },
});

// Parsing workflow
export const parsingWorkflow = createWorkflow({
    id: "parsing-workflow",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
})
    .then(parseAgentStep)
    .then(storeParserResultStep)
    .commit();
