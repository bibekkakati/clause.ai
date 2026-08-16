import {
    AGREEMENT_DEPOSIT_TYPES,
    AGREEMENT_PARTY_ROLES,
    AGREEMENT_TYPES,
    SECTION_CLAUSE_TYPES,
} from "@/constants";
import { getAvailableModels, markModelRateLimited } from "@/utils/ai.util";
import { logger } from "@/utils/logger.util";
import { APICallError } from "@ai-sdk/provider";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

const Instructions = `
    You are an expert legal document structuring AI agent.
    Your primary task is to extract information from rental agreement documents and structure it strictly into the provided JSON schema.

    ### CRITICAL INSTRUCTIONS
    1. EXTRACT, DO NOT GENERATE: Only use information explicitly stated in the document. If a piece of information is missing, return null.
    2. NO SUMMARIZATION: Preserve the exact original intent, terms, and legal wording in the 'sections' content.
    3. NO RISK ANALYSIS: Your job is purely extraction and structuring. Do not evaluate or analyze the content.
    4. ACCURACY: Correct obvious spelling mistakes in the text while preserving the legal meaning.

    ### DATA EXTRACTION RULES
    - DATES: Always format dates strictly as "YYYY-MM-DD". "End date", "renewal date", or "expiry date" should map to the expiry field.
    - SECTIONS: Break the agreement down into logical sections based on clause types. Ensure section headings are clean and concise.
    - PARAGRAPHS: Replace any newlines between paragraphs with a single empty space to keep the content continuous.
    - MISSING VALUES: If any field, value, or information is missing from the document, you MUST return null for that field. Do not invent data.

    ### FAILURE CONDITIONS
    If the uploaded file is:
    - Corrupted or unreadable
    - Completely blank
    - NOT a valid rental or lease agreement
    
    You MUST return ONLY the following JSON and nothing else:
    { "error": "File is not a valid rental agreement" }
`;

const ResponseSchema = z.object({
    title: z
        .string()
        .nullable()
        .describe(
            "Pick a title from the document if provided. Else, generate one short relevant title.",
        ),
    type: z
        .enum(AGREEMENT_TYPES)
        .nullable()
        .describe("Identify the type of document."),
    metadata: z
        .object({
            effectiveDate: z
                .string()
                .nullable()
                .describe(
                    "If there is any effective from or starting date mentioned. Format: YYYY-MM-DD",
                ),
            expiryDate: z
                .string()
                .nullable()
                .describe(
                    "If there is any expiry or renewal date is mentioned. Format: YYYY-MM-DD",
                ),
            autoRenewal: z
                .boolean()
                .nullable()
                .describe(
                    "Identify if there is any auto-renewal clause is mentioned in the document.",
                ),
            governingLaw: z
                .string()
                .nullable()
                .describe(
                    "Identify where this document is prepared and which country and state law does it follows. Example: Delhi, India",
                ),
        })
        .nullable(),
    property: z
        .object({
            type: z
                .enum([
                    "Flat",
                    "House",
                    "Office",
                    "Shop",
                    "Warehouse",
                    "Building",
                ])
                .nullable()
                .describe("Type of the property mentioned in the document."),
            country: z
                .string()
                .nullable()
                .describe(
                    "Country where this document is drafted and applicable. Default is NULL.",
                ),
            state: z
                .string()
                .nullable()
                .describe(
                    "State or province where this document is drafted or appliacble. Default is NULL.",
                ),
            address: z
                .string()
                .nullable()
                .describe(
                    "Extract the full address of the property mentioned in the document. Example: 12/145, Westend Marg, Saket, Delhi - 110030",
                ),
            size: z
                .string()
                .nullable()
                .describe(
                    "Size of the property mentioned in the document. Example: 500 sq ft, 1000 sq ft, 10000 sq m etc. If missing, return NULL.",
                ),
            usageTerm: z
                .string()
                .nullable()
                .describe(
                    "Usage type of the property mentioned in the document. Example: Residential, Commercial, Industrial, Retail etc. If missing, return NULL.",
                ),
        })
        .nullable(),
    payments: z
        .object({
            currency: z
                .string()
                .nullable()
                .describe(
                    "Currency of the deposit amount. Example: USD, INR, EUR, etc.",
                ),
            depositAmount: z
                .number()
                .nullable()
                .describe("Deposit amount mentioned in the document."),
            depositType: z
                .enum(AGREEMENT_DEPOSIT_TYPES)
                .nullable()
                .describe(
                    "Deposit type mentioned in the document. If missing, return NULL.",
                ),
            rentAmount: z
                .number()
                .nullable()
                .describe("Rent amount mentioned in the document."),
            rentCycle: z.enum([
                "Monthly",
                "Quarterly",
                "Yearly",
                "Half Yearly",
                "Every 2 Months",
            ]),
        })
        .nullable(),
    parties: z
        .array(
            z.object({
                name: z
                    .string()
                    .describe(
                        "Name of the person or entity involved as a first or second party in the document.",
                    ),
                role: z
                    .enum(AGREEMENT_PARTY_ROLES)
                    .describe(`Role of the party.`),
                address: z
                    .string()
                    .nullable()
                    .describe(
                        "Provided address of the party in the document. If missing, return NULL.",
                    ),
            }),
        )
        .nullable(),
    sections: z
        .array(
            z.object({
                ref: z
                    .string()
                    .describe(
                        "Section reference number of the clause/section/part. If not provided in document, use serial numbers starting from (1.0).",
                    ),
                type: z
                    .enum(SECTION_CLAUSE_TYPES)
                    .describe(
                        "Identify the type of clause/section from given enum.",
                    ),
                heading: z
                    .string()
                    .describe(
                        "Heading/Title of the section/clause/part mentioned in the document. If not provided, create a short relevant heading for the section.",
                    ),
                content: z
                    .string()
                    .describe(
                        "The content/body of the sections/clause mentioned in the document. Content should be formatted cleanly with punctuations.",
                    ),
            }),
        )
        .nullable(),
    error: z
        .string()
        .nullable()
        .describe(
            "If uploaded file is not a valid document, return only error.",
        ),
});

export type ParserAgentOutput = z.infer<typeof ResponseSchema>;

const parserAgent: Agent = new Agent({
    id: "parser-agent",
    name: "Parser Agent",
    instructions: Instructions,
    model: getAvailableModels().map((model) => ({
        id: model,
        model: model,
        modelSettings: {
            reasoning: "low",
            temperature: 0.2,
            topP: 0.85,
        },
    })),
});

export const runParserAgent = async (
    agreementId: string,
    {
        parsedText,
        fileUrl,
        mimeType,
    }: {
        parsedText?: string;
        fileUrl: string;
        mimeType: string;
    },
): Promise<ParserAgentOutput> => {
    logger.info({ agreementId, mimeType }, "Starting parser agent");

    try {
        const response = await parserAgent.generate(
            [
                {
                    role: "user",
                    content: [
                        parsedText
                            ? {
                                  type: "text",
                                  text: parsedText,
                              }
                            : {
                                  type: "file",
                                  mimeType,
                                  data: fileUrl,
                              },
                    ],
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
        logger.info({ agreementId, tokenUsage }, "Completed parser agent");

        const result = response.object;

        if (!result) throw new Error("Parser agent failed. Service error.");

        return result;
    } catch (error: any) {
        handleError(error);
        logger.error({ agreementId, error: error.message });
        throw new Error("Parser agent failed. Service error.");
    }
};

const handleError = (error: any) => {
    // Check if model quota exhausted
    if (APICallError.isInstance(error) && error.statusCode === 429) {
        const { model, modelId } = (error.requestBodyValues as any) || {};
        const headers = error.responseHeaders || {};
        const retryAfter = headers["retry-after"];

        markModelRateLimited(Number(retryAfter), model || modelId);
        logger.warn({ model }, "Model rate-limited");
    }
};
