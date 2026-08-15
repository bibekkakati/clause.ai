import { TOOL_OUTPUT_MAX_TOKENS } from "@/config/ai.config";
import { RISK_LEVELS } from "@/constants";
import { fetchRisksByAgreement } from "@/services/agreements.service";
import { estimateTokens } from "@/utils/ai.util";
import { logger } from "@/utils/logger.util";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const fetchRisksTool = createTool({
    id: "fetch-risks-tool",
    description:
        "Retrieves pre-identified risks from the agreement that are relevant to the user's query. Returns matching sections with their clause, risk reason, and risk level. Use this tool whenever the user asks about critical risks and unfavorable conditions in the agreement. The query should clearly describe the type of risks to look for. Returns an empty array if no relevant sections are found.",
    inputSchema: z.any(),
    outputSchema: z.array(
        z.object({
            clause: z.string().describe("Section where risk is identified."),
            reason: z.string().describe("Explanation of the risk identified."),
            risk_level: z.enum(RISK_LEVELS),
        }),
    ),
    execute: async ({}, context) => {
        const agreementId = context?.requestContext?.get(
            "agreementId",
        ) as string;
        const userId = context?.requestContext?.get("userId") as string;

        if (!agreementId || !userId) {
            logger.warn(
                { agreementId },
                "Required params are not passed in tool call",
            );
            throw new Error("Agreement ID and User ID are required");
        }

        logger.info({ agreementId }, "Querying risks tool");

        const risks = await fetchRisksByAgreement(agreementId, userId);

        if (risks.length === 0) {
            logger.warn({ agreementId }, "Could not fetch agreement risks");
            return [];
        }

        // Filter sections within token budget
        let usedTokens = 0;
        let maxTokens = TOOL_OUTPUT_MAX_TOKENS;

        const selectedRisks = [];

        for (const s of risks) {
            const tokens = estimateTokens(s.clause) + estimateTokens(s.reason);

            // Compare with tokens usage
            if (tokens + usedTokens > maxTokens) break;
            usedTokens += tokens;

            // Consider risks within token budget
            selectedRisks.push({
                clause: s.clause,
                reason: s.reason,
                risk_level: s.level,
            });
        }

        return selectedRisks;
    },
});
