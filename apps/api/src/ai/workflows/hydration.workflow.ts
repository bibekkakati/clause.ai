import { ParserAgentOutput } from "@/ai/agents/parser.agent";
import * as AgreementsService from "@/services/agreements.service";
import { logger } from "@/utils/logger.util";
import { MastraNonRetryableError } from "@mastra/core/error";
import { createStep } from "@mastra/core/workflows";
import { z } from "zod";
import {
    RiskItemSchema,
    SectionItemSchema,
    WorkflowStateSchema,
} from "./schema";

/**
 * Shared helper function to fetch agreement & section data from DB
 * and update the workflow state.
 */
const hydrateWorkflowState = async (
    agreementId: string,
    userId: string,
    state: z.infer<typeof WorkflowStateSchema>,
): Promise<z.infer<typeof WorkflowStateSchema>> => {
    // Fetch agreement data from DB
    const agreement = await AgreementsService.fetchAgreement(
        agreementId,
        userId,
    );

    if (!agreement) {
        throw new MastraNonRetryableError("Agreement not found");
    }

    const [dbSections, dbRisks] = await Promise.all([
        AgreementsService.fetchSectionsByAgreement(agreementId, userId),
        AgreementsService.fetchRisksByAgreement(agreementId, userId),
    ]);

    const sections: z.infer<typeof SectionItemSchema>[] = (
        dbSections || []
    ).map((sec) => ({
        id: sec.id,
        ref: sec.ref,
        type: sec.type,
        heading: sec.heading,
        content: sec.content,
        embedding: sec.embedding,
    }));

    const risks: z.infer<typeof RiskItemSchema>[] = (dbRisks || []).map(
        (risk) => ({
            clause: risk.clause,
            reason: risk.reason,
            level: risk.level,
        }),
    );

    return {
        ...state,
        // DB State
        title: agreement.title,
        type: agreement.type,
        summary: agreement.summary || [],
        metadata: agreement.metadata as ParserAgentOutput["metadata"],
        property: agreement.property as ParserAgentOutput["property"],
        payments: agreement.payments as ParserAgentOutput["payments"],
        parties: agreement.parties as ParserAgentOutput["parties"],
        sections: sections.length > 0 ? sections : state.sections,
        risks: risks.length > 0 ? risks : state.risks,
        // Actions state
        skipParserAgent: Boolean(
            agreement.title &&
            agreement.type &&
            agreement.metadata &&
            agreement.parties &&
            sections.length > 0, // sections are generated in parser agent
        ),
        skipSummaryAgent: Boolean(agreement.summary),
        skipRiskAgent: Boolean(risks.length > 0),
    };
};

// Initiate State Hydration (DB Read Upfront)
export const initiateStateHydration = createStep({
    id: "initiate-state-hydration-step",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state, setState }) => {
        const { userId, agreementId, forceRestart } = state;
        const stepLogger = logger.child({
            step: "initiate-state-hydration-step",
            agreementId,
            userId,
        });

        stepLogger.info("Initiating upfront state hydration from database");

        if (forceRestart) {
            stepLogger.info(
                "Flag `forceRestart` is enabled. Skipping state pre-hydration",
            );
            return {};
        }

        const updatedState = await hydrateWorkflowState(
            agreementId,
            userId,
            state,
        );
        setState(updatedState);

        return {};
    },
});
