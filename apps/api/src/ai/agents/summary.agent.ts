import { AI_MODELS } from "@/config/ai.config";
import { logger } from "@/utils/logger.util";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

const Instructions = `
    You are an expert legal document summarizer.
    Your task is to review a combined text from a rental agreement and extract a clear, concise summary of the most critical points.
    Each line should be a summarized point covering property details, parties, payments, usage, maintenance, eviction, and other critical points.
    No markdown. No heading. No extra spaces.

    ### REQUIRED SUMMARY CATEGORIES
    You must extract and summarize the important points based on the following topics:
    - Property Location, Type, Size
    - Parties Involved
    - Payments (Rent, Deposit, Penalties)
    - Usage
    - Occupancy Limit
    - Maintenance
    - Eviction
    - Termination
    - Inspection
    - Notice Period
    - Any other critical points

    ### RULES
    1. Do not invent or hallucinate information. If a category is not mentioned in the text, do not invent details for it.
    2. Format the summarized output line by line preserving the context. DO NOT use markdown formatting, bullet points, bold text, or line breaks.
    3. Keep the summary points concise and to the point.
    4. Focus on facts, obligations, numbers, and dates.
    5. PLAIN ENGLISH: Strip away all legal jargon (e.g., "heretofore", "indemnify", "lessor/lessee"). Explain everything in extremely simple, everyday language so that a person with no legal background can easily understand their rights and obligations. Use terms like "Landlord" and "Tenant".
`;

const ResponseSchema = z.object({
    summary: z
        .array(
            z
                .string()
                .describe(
                    "Keep the point simple and concise within 240 characters.",
                ),
        )
        .nullable()
        .describe(
            "Maximum 20 summary points. Minimum 3 summary points. Best is 8-12 points.",
        ),
    error: z
        .string()
        .nullable()
        .describe(
            "Error message if provided content does not belong to a valid agreement.",
        ),
});

export type SummaryAgentOutput = z.infer<typeof ResponseSchema>;

const summaryAgent: Agent = new Agent({
    id: "summary-agent",
    name: "Summary Agent",
    instructions: Instructions,
    model: AI_MODELS.map((model) => ({
        id: model,
        model: model,
        modelSettings: {
            reasoning: "low",
            temperature: 0.6,
            topP: 0.85,
        },
    })),
});

export const runSummaryAgent = async (
    runId: string,
    content: string,
): Promise<SummaryAgentOutput> => {
    logger.info({ runId }, "Starting summary agent");

    try {
        const response = await summaryAgent.generate(
            [
                {
                    role: "user",
                    content: content,
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
        logger.info({ runId, tokenUsage }, "Completed summary agent");

        const result = response.object;

        if (!result)
            throw new Error("Summary agent process failed. Service error.");

        return result;
    } catch (error: any) {
        logger.error({ runId, error: error.message });
        throw new Error("Summary agent process failed. Service error.");
    }
};
