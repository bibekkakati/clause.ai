import { createQueueConnection } from "@/infra/bullmq.client";
import { logger } from "@/utils/logger.util";
import { Queue } from "bullmq";

// Queue name
export const SCHEDULER_QUEUE_KEY = "job-scheduler";

// Job names
export const FILE_CLEANUP_JOB = "cleanup-stale-files";

const schedulerQueue = new Queue(SCHEDULER_QUEUE_KEY, {
    connection: createQueueConnection(),
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: true,
    },
});

/**
 * Register a scheduler job
 */
export const scheduleFileCleanup = async () => {
    await schedulerQueue.upsertJobScheduler(
        FILE_CLEANUP_JOB, // Static key is required to avoid deduplication or race condition
        {
            pattern: "0 * * * *", // Hourly
        },
        {
            name: FILE_CLEANUP_JOB,
        },
    );
    logger.info({ jobName: FILE_CLEANUP_JOB }, "Scheduled job in Scheduler Queue");
};

/**
 * Gracefully close the queue client connection.
 */
export const closeSchedulerQueue = async () => {
    await schedulerQueue.close();
    logger.info("Scheduler Queue closed");
};
