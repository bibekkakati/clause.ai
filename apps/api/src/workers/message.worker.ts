import { createWorkerConnection } from "@/infra/bullmq.client";
import {
    EMAIL_NOTIFICATION_JOB,
    EmailNotificationPayload,
    FileProcessingPayload,
    MESSAGE_QUEUE_KEY,
    PROCESS_FILE_JOB,
} from "@/queues/message.queue";
import * as NotificationService from "@/services/notification.service";
import * as WorkflowService from "@/services/workflow.service";
import { asyncLocalStorage } from "@/utils/context.util";
import { generateUUIDv7 } from "@/utils/id.util";
import { logger } from "@/utils/logger.util";
import { Job, Worker } from "bullmq";

let messageWorker: Worker | null = null;

/**
 * Initializes the worker for event message processing.
 */
export const initMessageWorker = (): Worker => {
    if (messageWorker) {
        return messageWorker;
    }

    messageWorker = new Worker(
        MESSAGE_QUEUE_KEY,
        async (job: Job) => {
            const correlationId = job.data.correlationId || generateUUIDv7();
            const userId = job.data.userId;

            await asyncLocalStorage.run({ correlationId, userId }, async () => {
                logger.info(
                    { jobId: job.id, jobName: job.name },
                    "Message Worker processing job",
                );

                if (job.name === EMAIL_NOTIFICATION_JOB) {
                    const {
                        templateId,
                        email,
                        payload,
                    }: EmailNotificationPayload = job.data;
                    await NotificationService.sendEmailNotification(
                        templateId,
                        email,
                        payload,
                    );
                } else if (job.name === PROCESS_FILE_JOB) {
                    const {
                        fileId,
                        agreementId,
                        userId: userId,
                    }: FileProcessingPayload = job.data;
                    await WorkflowService.startAgreementProcessing(
                        agreementId,
                        fileId,
                        userId,
                    );
                } else {
                    logger.error(
                        { jobName: job.name },
                        "Message Worker job not recognized",
                    );
                }
            });
        },
        {
            connection: createWorkerConnection(),
            concurrency: 50,
        },
    );

    messageWorker.on("completed", (job) => {
        logger.info(
            {
                jobId: job.id,
                jobName: job.name,
                correlationId: job.data.correlationId,
            },
            "Message Worker job completed successfully",
        );
    });

    messageWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                jobName: job?.name,
                correlationId: job?.data?.correlationId,
                error: err,
            },
            "Message Worker job failed",
        );
    });

    messageWorker.on("error", (err) => {
        logger.error(err, "Message Worker error");
    });

    messageWorker.on("stalled", (jobId) => {
        logger.warn(
            { jobId },
            "Message Worker job stalled and will be re-processed",
        );
    });

    logger.info("Message Worker initialized");

    return messageWorker;
};

/**
 * Gracefully shuts down the worker.
 */
export const closeMessageWorker = async (): Promise<void> => {
    if (messageWorker) {
        await messageWorker.close();
        messageWorker = null;
        logger.info("Message Worker closed");
    }
};
