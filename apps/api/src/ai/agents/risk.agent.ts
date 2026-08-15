import { AI_MODELS } from "@/config/ai.config";
import { RiskLevelType } from "@/constants";
import { logger } from "@/utils/logger.util";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

const Instructions = `
    You are a Risk Evaluator for residential/commercial rental agreements.
    You review one categorized section of a lease at a time and identify genuine legal, financial, or practical risks to the tenant (or the Lessor).

    ### CORE PRINCIPLE:
    Absence of risk is valid and expected outcome.
    Most clauses in most leases are standard, fair, and non-risky. Finding zero risks in a section is not a failure of your analysis — it is the most common correct outcome.
    You are not being evaluated on how many risks you find. You are being evaluated on whether every risk you DO flag is real.

    ### CRITICAL: ONLY Flag Genuine Risks
    Do NOT flag a clause as risky unless it meets ALL these criteria:

    1. There is a clear, specific downside.
    2. The downside affects tenant livelihood, money, property, or rights.
    3. The risk is caused by something in the text (not by external market factors).
    4. The risk is not offset by other clearly favorable clauses.

    “Risky enough to mention in a legal memo” is the threshold. Not “risky enough to warn a friend”.

    ### ABSOLUTELY DO NOT FLAG:
        - Standard business clauses that are common in leases
        - Clauses that only favor the Lessor (this is normal in a lease)
        - Terms that are legally binding but not unfair
        - Missing information unless it creates immediate ambiguity
        - Clauses that are simply worded in long-form
        - Normal costs and charges (rent, deposit, utilities, taxes, etc.)
        - Legal jurisdiction/governing law clauses
        - Renewal terms unless they lack notice period or have hidden penalties
        - Clauses that are clear and balanced
        - Clauses that protect both parties equally

    Acceptable risks are rare, significant, and clearly stated in the lease.

    ### LEGAL & VALID clauses:
        - Lessor has superior rights (normal in lease)
        - Notice period is set (even if short)
        - Payment dates are fixed
        - Usage is restricted to specific purpose
        - Parties must maintain insurance
        - Tenant is responsible for maintenance
        - Security deposit is refundable upon conditions
        - Renewal is subject to mutual consent

    All above are NOT risks. They are standard legal terms.

    ### FOCUS ON:
        - Auto-renewal without reminder
        - Very short termination notice
        - One-sided liability
        - Unlimited indemnity
        - High commission with unclear terms
        - One-sided cancellation
        - Platform can terminate anytime
        - No insurance clarity
        - Ownership transfer of content
        - Arbitration in distant country
        - Missing damage protection
        - Hidden penalty fees

    ### SCORING RULES
    Return score as an integer 0-100:
        - 0-20: negligible - no meaningful risk indicators
        - 21-40: low - minor issues, unlikely to cause harm
        - 41-60: moderate - plausible negative impact, warrants review
        - 61-80: high - clear risk indicators, likely needs action
        - 81-100: critical - severe or urgent risk, immediate attention required

    ### RULES:
        - Quote exact risky sentence.
        - Keep explanation short and simple.
        - Focus mostly on High and Critical risk conditions.
        - If no serious risk found, return empty array.
        - Never invent risk.
`;

const ResponseSchema = z.object({
    risks: z
        .array(
            z.object({
                score: z
                    .number()
                    .min(0)
                    .max(100)
                    .nullable()
                    .describe("Risk score from 0-100."),
                clause: z
                    .string()
                    .describe(
                        "Sentence or clause related to the identified risk.",
                    ),
                reason: z
                    .string()
                    .nullable()
                    .describe(
                        "Reason for the identified risk. Keep it simple and concise.",
                    ),
            }),
        )
        .nullable(),
    error: z.string().nullable().describe("Error message if any."),
});

export type RiskAgentOutput = {
    risks: {
        score: number;
        clause: string;
        reason: string;
        level: RiskLevelType;
    }[];
    error: string | null;
};

const parserAgent: Agent = new Agent({
    id: "risk-agent",
    name: "Risk Agent",
    instructions: Instructions,
    model: AI_MODELS.map((model) => ({
        id: model,
        model: model,
        modelSettings: {
            reasoning: "medium",
            temperature: 0.4,
            topP: 0.85,
        },
    })),
});

export const runRiskAgent = async (
    runId: string,
    key: string,
    content: string,
): Promise<RiskAgentOutput> => {
    logger.info({ runId, key }, "Starting risk agent");

    try {
        const response = await parserAgent.generate(
            [
                {
                    role: "user",
                    content,
                },
            ],
            {
                structuredOutput: {
                    schema: ResponseSchema,
                },
            },
        );

        const { inputTokens, outputTokens, totalTokens, reasoningTokens } =
            response.totalUsage;
        const tokenUsage = {
            inputTokens,
            outputTokens,
            totalTokens,
            reasoningTokens,
        };
        logger.info({ runId, key, tokenUsage }, "Completed risk agent");

        const result = response.object as RiskAgentOutput;

        if (!result) {
            throw new Error("Risk agent process failed. Service error.");
        }

        result.risks?.forEach((risk) => {
            // If no score, set to 0
            if (risk.score == null) {
                risk.score = 0;
            }

            // Inject risk level
            if (risk.score <= 40) {
                risk.level = "LOW";
            } else if (risk.score <= 60) {
                risk.level = "MEDIUM";
            } else if (risk.score <= 80) {
                risk.level = "HIGH";
            } else {
                risk.level = "CRITICAL";
            }
        });

        return result;
    } catch (error: any) {
        logger.error({ runId, error: error.message });
        throw new Error("Risk agent process failed. Service error.");
    }
};
