import { createQueueConnection } from "@/infra/bullmq.client";
import { getCorrelationId } from "@/utils/context.util";
import { generateUUIDv7 } from "@/utils/id.util";
import { logger } from "@/utils/logger.util";
import { Queue } from "bullmq";

export interface EmailNotificationPayload {
    templateId: string;
    email: string;
    payload: Record<string, any>;
    correlationId?: string;
}

export interface FileProcessingPayload {
    agreementId: string;
    fileId: string;
    userId: string;
    correlationId?: string;
}

// Queue name
export const MESSAGE_QUEUE_KEY = "message-queue";

// Job names
export const PROCESS_FILE_JOB = "process-file";
export const EMAIL_NOTIFICATION_JOB = "email-notification";

const messageQueue = new Queue(MESSAGE_QUEUE_KEY, {
    connection: createQueueConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: true,
    },
});

/**
 * Enqueues an email notification job with correlationId context.
 */
export const publishEmailNotificationEvent = async (
    data: EmailNotificationPayload,
) => {
    const correlationId =
        data.correlationId || getCorrelationId() || generateUUIDv7();
    const payloadWithTrace = { ...data, correlationId };

    await messageQueue.add(EMAIL_NOTIFICATION_JOB, payloadWithTrace);
    logger.info(
        { jobName: EMAIL_NOTIFICATION_JOB, email: data.email, correlationId },
        "Added job to Message Queue",
    );
};

/**
 * Enqueues a agreement processing job.
 */
export const publishAgreementProcessEvent = async (
    data: FileProcessingPayload,
) => {
    const correlationId =
        data.correlationId || getCorrelationId() || generateUUIDv7();
    const payloadWithTrace = { ...data, correlationId };

    await messageQueue.add(PROCESS_FILE_JOB, payloadWithTrace);
    logger.info(
        {
            jobName: PROCESS_FILE_JOB,
            agreementId: data.agreementId,
            correlationId,
        },
        "Added job to Message Queue",
    );
};

/**
 * Gracefully close the queue client connection.
 */
export const closeMessageQueue = async () => {
    await messageQueue.close();
    logger.info("Message Queue closed");
};
