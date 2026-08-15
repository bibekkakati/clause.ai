import * as AgreementsService from "@/services/agreements.service";
import { logger } from "@/utils/logger.util";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { embeddingWorkflow } from "./embedding.workflow";
import { initiateStateHydration } from "./hydration.workflow";
import { parsingWorkflow } from "./parser.workflow";
import { riskWorkflow } from "./risk.workflow";
import { WorkflowStateSchema } from "./schema";
import { summaryWorkflow } from "./summary.workflow";

// Last step
const finishStep = createStep({
    id: "finish-step",
    inputSchema: z.any(),
    outputSchema: z.object({
        status: z.string(),
    }),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state }) => {
        const { userId, agreementId } = state;
        const stepLogger = logger.child({
            step: "finish-step",
            agreementId,
            userId,
        });

        stepLogger.info(
            "Finishing agreement processing workflow with status SUCCESS",
        );

        await AgreementsService.updateAgreementStatus(
            agreementId,
            "SUCCESS",
            null,
            userId,
        );

        return { status: "SUCCESS" };
    },
});

// Main workflow
export const agentWorkflow = createWorkflow({
    id: "agent-workflow",
    inputSchema: z.any(),
    outputSchema: z.object({
        status: z.string(),
    }),
    stateSchema: WorkflowStateSchema,
})
    .then(initiateStateHydration)
    .branch([[async ({ state }) => !state.skipParserAgent, parsingWorkflow]])
    .branch([[async ({ state }) => !state.skipSummaryAgent, summaryWorkflow]])
    .then(embeddingWorkflow)
    .branch([[async ({ state }) => !state.skipRiskAgent, riskWorkflow]])
    .then(finishStep)
    .commit();
