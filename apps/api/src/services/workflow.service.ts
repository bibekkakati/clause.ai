import { QueryMessageType, runQueryAgent } from "@/ai/agents/query.agent";
import { agentWorkflow } from "@/ai/workflows/agent.workflow";
import * as AgreementsService from "@/services/agreements.service";
import { QueryResponseCache } from "@/services/cache.service";
import * as ChatService from "@/services/chat.service";
import * as FileService from "@/services/file.service";
import { logger } from "@/utils/logger.util";

/**
 * Triggers the agent workflow for processing a agreement.
 */
export const startAgreementProcessing = async (
    agreementId: string,
    fileId: string,
    userId: string,
    forceRestart: boolean = false,
) => {
    const serviceLogger = logger.child({
        service: "agent.service",
        agreementId,
        fileId,
        userId,
    });

    if (!agreementId || !fileId || !userId) {
        serviceLogger.error("Agreement ID, File ID and User ID are required.");
        return;
    }

    try {
        serviceLogger.info("Starting file processing workflow trigger");

        const agreement = await AgreementsService.fetchAgreement(
            agreementId,
            userId,
        );

        if (!agreement) {
            throw new Error("Agreement not found");
        }

        // if agreement is in processing state, skip it
        if (agreement.status === "PROCESSING") {
            serviceLogger.info("Agreement is already in processing state");
            return;
        }

        // if agreement is in completed state, skip it
        if (agreement.status === "SUCCESS") {
            serviceLogger.info("Agreement is already completed");
            return;
        }

        // Get file download URL
        const {
            downloadUrl,
            mimeType,
            error: fileDownloadError,
        } = await FileService.generateFileDownloadUrl(userId, fileId, 600);

        // Error checks
        if (fileDownloadError) throw new Error(fileDownloadError);
        if (!downloadUrl || !mimeType) {
            throw new Error(
                "Failed to generate download URL. Missing URL or MimeType.",
            );
        }

        // Update agreement status to processing
        await AgreementsService.updateAgreementStatus(
            agreementId,
            "PROCESSING",
            null,
            userId,
        );

        const workflowLogger = serviceLogger.child({ agreementId });
        workflowLogger.info("Starting agent workflow run");

        // Trigger workflow run
        const run = await agentWorkflow.createRun({ runId: agreementId });
        const result = await run.start({
            initialState: {
                userId,
                agreementId,
                fileUrl: downloadUrl,
                mimeType,
                forceRestart,
            },
        });

        // Check if workflow ended in a failed state
        if (result?.status === "failed") {
            const errorMessage =
                (result as any).error?.message || "Workflow failed";

            workflowLogger.error(
                { errorMessage },
                "Workflow run finished with status FAILED",
            );

            await AgreementsService.updateAgreementStatus(
                agreementId,
                "FAILED",
                errorMessage,
                userId,
            );
        } else {
            workflowLogger.info("Workflow run finished successfully");
        }
    } catch (err: any) {
        serviceLogger.error(err.message);

        // Global catch-all: mark agreement as FAILED
        try {
            await AgreementsService.updateAgreementStatus(
                agreementId,
                "FAILED",
                "Internal server error",
                userId,
            );
        } catch (statusErr: any) {
            serviceLogger.error(
                statusErr.message,
                "Failed to update agreement status to FAILED",
            );
        }
    }
};

/**
 * Handle chat queries for agreement
 */
export const processAgreementQuery = async (
    agreementId: string,
    userId: string,
    chatId: string,
    query: string,
) => {
    if (query.length == 0) {
        return { error: "Query cannot be empty" };
    }

    if (!agreementId || !chatId || !userId) {
        throw new Error("Agreement ID, Chat ID and User ID are required.");
    }

    const agreement = await AgreementsService.fetchAgreement(
        agreementId,
        userId,
    );
    if (!agreement) {
        return { error: "Agreement not found" };
    }

    // Agreement status should be SUCCESS
    if (agreement.status !== "SUCCESS") {
        return { error: "Agreement is not processed yet" };
    }

    // Fetch chat details
    const chat = await ChatService.fetchChatById(chatId, userId, agreementId);
    if (!chat) {
        return { error: "Chat not found" };
    }

    const messagesPayload: QueryMessageType[] = [];

    // Inject agreement summary as system message
    if (agreement.summary) {
        messagesPayload.push({
            role: "system",
            content: `Agreement Summary:\n${agreement.summary.join("\n")}`,
        });

        // Add agreement metadata as system message
        messagesPayload.push({
            role: "system",
            content: `Agreement Data:\n${JSON.stringify({
                metadata: agreement.metadata,
                parties: agreement.parties,
                payments: agreement.payments,
                property: agreement.property,
            })}`,
        });
    }

    // Fetch chat messages (newer → older)
    const { messages: chatMessages } = await ChatService.fetchChatMessages(
        chatId,
        userId,
        agreementId,
        10,
    );

    // Prepare the messages payload from chat messages (older → newer)
    for (const m of chatMessages.reverse()) {
        messagesPayload.push({
            role: m.role,
            content: m.content,
        });
    }

    // Insert user message
    const userMessage = await ChatService.insertChatMessage(
        chatId,
        userId,
        agreementId,
        {
            role: "user",
            content: query,
        },
    );

    const queryId = userMessage.id;

    // Set initial processing state in Redis
    await QueryResponseCache.set(queryId, { status: "PROCESSING", error: "" });

    // Run query agent asynchronously
    (async () => {
        try {
            const agentResponse = await runQueryAgent(
                chatId,
                agreementId,
                userId,
                query,
                messagesPayload,
            );

            if (!agentResponse) {
                throw new Error("Failed to generate response");
            }

            // Insert user and agent message
            const agentMessage = await ChatService.insertChatMessage(
                chatId,
                userId,
                agreementId,
                {
                    role: "assistant",
                    content: agentResponse,
                },
            );

            // Update Redis state to SUCCESS
            await QueryResponseCache.set(queryId, {
                status: "SUCCESS",
                message: agentMessage,
                error: "",
            });
        } catch (error: any) {
            logger.error({ error: error.message }, "Query Agent Failed");
            // Update Redis state to ERROR
            await QueryResponseCache.set(queryId, {
                status: "FAILED",
                error: error.message,
            });
        }
    })();

    // Return the result
    return { chatId, userMessage, queryId };
};
