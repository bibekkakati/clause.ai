import { runSummaryAgent, SummaryAgentOutput } from "@/ai/agents/summary.agent";
import * as AgreementsService from "@/services/agreements.service";
import { logger } from "@/utils/logger.util";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { WorkflowStateSchema } from "./schema";

// Summary Agent - LLM CALL
const summaryAgentStep = createStep({
    id: "summary-agent-step",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state, setState }) => {
        const { agreementId, sections, userId } = state;
        const stepLogger = logger.child({
            step: "summary-agent-step",
            agreementId,
            userId,
        });

        if (!sections || sections.length === 0) {
            stepLogger.info("No sections to generate summary");
            return {};
        }

        const rawContent = sections
            .map((sec) => `## ${sec.heading}\n${sec.content}`)
            .join("\n\n");

        stepLogger.info("Generating agreement summary");
        const result: SummaryAgentOutput = await runSummaryAgent(
            agreementId,
            rawContent,
        );

        if (result.error) {
            stepLogger.warn(
                { error: result.error },
                "Summary agent returned an error",
            );
            return {};
        }

        if (!result.summary || result.summary.length === 0) {
            stepLogger.warn("Summary agent returned no summary");
            return {};
        }

        stepLogger.info("Summary generated successfully");

        // Write to state only
        await setState({ ...state, summary: result.summary });

        return {};
    },
});

// Store Summary - DB CALL
const storeSummaryStep = createStep({
    id: "store-summary-step",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state }) => {
        const { userId, agreementId, summary } = state;
        const stepLogger = logger.child({
            step: "store-summary-step",
            agreementId,
            userId,
        });

        // Persist summary
        if (summary && summary.length > 0) {
            await AgreementsService.updateAgreementSummary(
                agreementId,
                summary,
                userId,
            );
            stepLogger.info("Stored summary successfully");
        }

        return {};
    },
});

// Summary workflow
export const summaryWorkflow = createWorkflow({
    id: "summary-workflow",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
})
    .then(summaryAgentStep)
    .then(storeSummaryStep)
    .commit();
