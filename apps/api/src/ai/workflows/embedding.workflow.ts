import { runEmbeddingAgent } from "@/ai/agents/embedding.agent";
import * as AgreementsService from "@/services/agreements.service";
import { logger } from "@/utils/logger.util";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
    EmbeddingSectionInputSchema,
    EmbeddingSectionOutputSchema,
    WorkflowStateSchema,
} from "./schema";

// Prepare Embedding Sections - PROCESSING
const prepareEmbeddingSectionsStep = createStep({
    id: "prepare-embedding-sections-step",
    inputSchema: z.any(),
    outputSchema: z.array(EmbeddingSectionInputSchema),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ state }) => {
        const { agreementId, sections, userId } = state;
        const stepLogger = logger.child({
            step: "prepare-embedding-sections-step",
            agreementId,
            userId,
        });

        if (!sections || sections.length === 0) {
            stepLogger.info("No sections to generate embeddings");
            return [];
        }

        const sectionsToEmbed = [];
        for (const sec of sections) {
            if (sec.id && (!sec.embedding || sec.embedding.length === 0)) {
                sectionsToEmbed.push({
                    sectionId: sec.id!,
                    heading: sec.heading,
                    content: sec.content,
                });
            }
        }

        if (sectionsToEmbed.length === 0) {
            stepLogger.info("All sections already have embeddings, skipping");
            return [];
        }

        stepLogger.info(
            { count: sectionsToEmbed.length },
            "Prepared sections for embedding generation",
        );

        return sectionsToEmbed;
    },
});

// Embedding Per-Section Generation - LLM CALL
const embeddingGenerateStep = createStep({
    id: "embedding-generate-step",
    inputSchema: EmbeddingSectionInputSchema,
    outputSchema: EmbeddingSectionOutputSchema,
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ inputData, state }) => {
        const { agreementId, userId } = state;
        const { sectionId, heading, content } = inputData;
        const stepLogger = logger.child({
            step: "embedding-generate-step",
            agreementId,
            userId,
            sectionId,
        });

        stepLogger.info(`Generating embedding for section: ${heading}`);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const embedding = await runEmbeddingAgent(agreementId, {
            heading,
            content,
        });

        stepLogger.info("Embedding generation completed");

        return { sectionId, embedding };
    },
});

// Embedding Store Per-Section Result - DB CALL
const storeEmbeddingResultStep = createStep({
    id: "store-embedding-result-step",
    inputSchema: EmbeddingSectionOutputSchema,
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
    retries: 2,
    execute: async ({ inputData, state, setState }) => {
        const { agreementId, userId, sections } = state;
        const { sectionId, embedding } = inputData;
        const stepLogger = logger.child({
            step: "store-embedding-result-step",
            agreementId,
            userId,
            sectionId,
        });

        if (!embedding || embedding.length === 0) {
            stepLogger.info("No embedding to store for section");
            return {};
        }

        await AgreementsService.updateSectionEmbedding(
            agreementId,
            sectionId,
            embedding,
            userId,
        );

        const updatedSections = (sections || []).map((sec) =>
            sec.id === sectionId ? { ...sec, embedding } : sec,
        );

        await setState({ ...state, sections: updatedSections });

        stepLogger.info("Stored embedding for section");

        return {};
    },
});

// Embedding per-section workflow
const embeddingPerSectionWorkflow = createWorkflow({
    id: "embedding-per-section-workflow",
    inputSchema: EmbeddingSectionInputSchema,
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
})
    .then(embeddingGenerateStep)
    .then(storeEmbeddingResultStep)
    .commit();

// Embedding workflow
export const embeddingWorkflow = createWorkflow({
    id: "embedding-workflow",
    inputSchema: z.any(),
    outputSchema: z.any(),
    stateSchema: WorkflowStateSchema,
})
    .then(prepareEmbeddingSectionsStep)
    .foreach(embeddingPerSectionWorkflow)
    .commit();
