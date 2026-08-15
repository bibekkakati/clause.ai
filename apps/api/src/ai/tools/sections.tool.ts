import { runEmbeddingAgent } from "@/ai/agents/embedding.agent";
import { TOOL_OUTPUT_MAX_TOKENS } from "@/config/ai.config";
import { fetchSectionsByEmbeddingSimilarity } from "@/services/agreements.service";
import { estimateTokens } from "@/utils/ai.util";
import { logger } from "@/utils/logger.util";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const fetchSectionsTool = createTool({
    id: "fetch-sections-tool",
    description:
        "Searches the agreement for sections semantically relevant to the query using vector similarity. Returns matching sections with their heading, full text content, section reference, and similarity score. Use this tool whenever the user asks a question that could be answered by the agreement. Pass a natural-language search query that captures the user's intent (e.g. 'termination and notice period' rather than just 'termination'). Returns an empty array if no relevant sections are found.",
    inputSchema: z.object({
        query: z
            .string()
            .describe(
                "A detailed natural-language search query describing what to look for in the agreement.",
            ),
    }),
    outputSchema: z.array(
        z.object({
            section: z.string(),
            heading: z.string(),
            content: z.string(),
            similarity: z.number(),
        }),
    ),
    execute: async ({ query }, context) => {
        const agreementId = context?.requestContext?.get(
            "agreementId",
        ) as string;

        if (!query || !agreementId) {
            logger.warn(
                { agreementId },
                "Required params are not passed in tool call",
            );
            throw new Error("Query and Agreement ID are required arguments");
        }

        logger.info({ agreementId, query }, "Querying sections tool");

        const embedding = await runEmbeddingAgent(agreementId, {
            heading: "",
            content: query,
        });
        if (!embedding || embedding.length === 0) {
            logger.warn(
                { agreementId },
                "Embedding generation failed for tool call",
            );
            throw new Error("Could not generate embeddings");
        }

        const sections = await fetchSectionsByEmbeddingSimilarity(
            agreementId,
            embedding,
        );

        if (sections.length === 0) {
            logger.warn(
                { agreementId },
                "Could not fetch sections with embeddings",
            );
            return [];
        }

        // Filter sections within token budget
        let usedTokens = 0;
        let maxTokens = TOOL_OUTPUT_MAX_TOKENS;

        const selectedSections = [];

        for (const s of sections) {
            const tokens =
                estimateTokens(s.content) + estimateTokens(s.heading);

            // Compare with tokens usage
            if (tokens + usedTokens > maxTokens) break;
            usedTokens += tokens;

            // Consider section within token budget
            selectedSections.push({
                section: s.ref,
                heading: s.heading,
                content: s.content,
                similarity: s.similarity,
            });
        }

        return selectedSections;
    },
});
