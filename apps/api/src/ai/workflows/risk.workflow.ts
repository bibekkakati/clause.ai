import { RiskAgentOutput, runRiskAgent } from "@/ai/agents/risk.agent";
import { SectionClauseType } from "@/constants";
import * as AgreementsService from "@/services/agreements.service";
import { logger } from "@/utils/logger.util";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { PreparedRiskContentSchema, WorkflowStateSchema } from "./schema";

// Prepare Content for Risk Analysis - PROCESSING
const prepareRiskSectionsStep = createStep({
    id: "prepare-risk-sections-step",
    inputSchema: z.any(),
    outputSchema: z.array(PreparedRiskContentSchema),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state }) => {
        const { agreementId, sections, userId } = state;
        const stepLogger = logger.child({
            step: "prepare-risk-sections-step",
            agreementId,
            userId,
        });

        if (!sections || sections.length === 0) {
            stepLogger.info("No content to analyze for risks");
            return [];
        }

        // Group sections by section type
        const sectionsByType = {} as Record<
            SectionClauseType,
            { heading: string; content: string }[]
        >;
        for (const sec of sections) {
            if (sectionsByType[sec.type] === undefined) {
                sectionsByType[sec.type] = [];
            }

            sectionsByType[sec.type].push({
                heading: sec.heading,
                content: sec.content,
            });
        }

        // Form single section per group by concatenating the content
        const sectionsToAnalyze = Object.values(sectionsByType).map(
            (sections, index) => ({
                key: (index + 1).toString(),
                content: sections
                    .map((sec) => `## ${sec.heading}\n${sec.content}`)
                    .join("\n\n"),
            }),
        );

        stepLogger.info(
            { count: sectionsToAnalyze.length },
            "Prepared content for risk analysis",
        );

        return sectionsToAnalyze;
    },
});

// Analyze Risk for Prepared Content - LLM CALL
const riskAnalyzeStep = createStep({
    id: "risk-analyze-step",
    inputSchema: PreparedRiskContentSchema,
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ inputData, state, setState }) => {
        const { agreementId, userId } = state;
        const { key, content } = inputData;
        const stepLogger = logger.child({
            step: "risk-analyze-step",
            agreementId,
            userId,
        });

        stepLogger.info(`Processing risk analysis #${key}`);

        const result: RiskAgentOutput = await runRiskAgent(
            agreementId,
            key,
            content,
        );

        if (result.error) {
            stepLogger.warn(
                { error: result.error },
                `Risk agent returned error #${key}`,
            );
        }

        // Update the valid risks in state
        if (result.risks) {
            const currentRisks = state.risks || [];
            for (const risk of result.risks) {
                currentRisks.push({
                    clause: risk.clause,
                    reason: risk.reason.replaceAll("\\", ""),
                    level: risk.level,
                });
            }

            await setState({
                ...state,
                risks: currentRisks,
            });
        }

        return {};
    },
});

// Store All Identified Risks - DB CALL
const storeRiskResultStep = createStep({
    id: "store-risk-result-step",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state, setState }) => {
        const { agreementId, userId, risks } = state;
        const stepLogger = logger.child({
            step: "store-risk-result-step",
            agreementId,
            userId,
        });

        if (!risks || risks.length == 0) {
            stepLogger.info("No risks to store in database");
            return {};
        }

        const riskIds = await AgreementsService.insertAgreementRisks(
            userId,
            agreementId,
            risks,
        );

        if (riskIds.length > 0) {
            stepLogger.info(`Stored ${riskIds.length} analyzed risks`);
        }

        return {};
    },
});

// Risk workflow
export const riskWorkflow = createWorkflow({
    id: "risk-workflow",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
})
    .then(prepareRiskSectionsStep)
    .foreach(riskAnalyzeStep)
    .then(storeRiskResultStep)
    .commit();
