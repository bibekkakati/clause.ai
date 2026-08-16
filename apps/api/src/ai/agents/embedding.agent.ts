import { env } from "@/config/env.config";
import { logger } from "@/utils/logger.util";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });

export const runEmbeddingAgent = async (
    agreementId: string,
    section: {
        heading: string;
        content: string;
    },
): Promise<number[]> => {
    logger.info({ agreementId }, "Starting embedding generation");

    const message: string[] = [
        "task: sentence similarity",
        `query: ${section.content}`,
    ];
    if (section.heading) {
        message.push(`title: ${section.heading}`);
    }

    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: message.join(" | "),
            config: {
                outputDimensionality: 1536,
            },
        });

        if (!response || !response.embeddings || !response.embeddings.length) {
            logger.error({ agreementId }, "Model failed");
            throw new Error("Model failed");
        }

        const tokenCount = response.embeddings[0].statistics?.tokenCount;
        logger.info(
            { agreementId, tokenCount },
            "Completed embedding generation",
        );

        return response.embeddings[0].values || [];
    } catch (error: any) {
        logger.error({ agreementId, error: error.message });
        throw new Error("Embedding generation process failed. Service error.");
    }
};
