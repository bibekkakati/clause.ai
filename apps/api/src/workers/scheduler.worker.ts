import { createWorkerConnection } from "@/infra/bullmq.client";
import {
    FILE_CLEANUP_JOB,
    SCHEDULER_QUEUE_KEY,
} from "@/queues/scheduler.queue";
import * as FileService from "@/services/file.service";
import { asyncLocalStorage } from "@/utils/context.util";
import { generateUUIDv7 } from "@/utils/id.util";
import { logger } from "@/utils/logger.util";
import { Job, Worker } from "bullmq";

let schedulerWorker: Worker | null = null;

/**
 * Initializes the worker for scheduled tasks processing.
 */
export const initSchedulerWorker = (): Worker => {
    if (schedulerWorker) {
        return schedulerWorker;
    }

    schedulerWorker = new Worker(
        SCHEDULER_QUEUE_KEY,
        async (job: Job) => {
            const correlationId = job.data.correlationId || generateUUIDv7();

            await asyncLocalStorage.run({ correlationId }, async () => {
                logger.info(
                    { jobId: job.id, jobName: job.name },
                    "Scheduler Worker running job",
                );

                switch (job.name) {
                    case FILE_CLEANUP_JOB:
                        await FileService.cleanup();
                        break;

                    default:
                        logger.warn(
                            { jobName: job.name },
                            "Scheduler Worker job not recognized",
                        );
                        break;
                }
            });
        },
        {
            connection: createWorkerConnection(),
            concurrency: 10, // At most parallel executions
        },
    );

    schedulerWorker.on("completed", (job) => {
        logger.info(
            { jobId: job.id, jobName: job.name },
            "Scheduler Worker job completed successfully",
        );
    });

    schedulerWorker.on("failed", (job, err) => {
        logger.error(
            { jobId: job?.id, jobName: job?.name, error: err },
            "Scheduler Worker job failed",
        );
    });

    schedulerWorker.on("error", (err) => {
        logger.error(err, "Scheduler Worker error");
    });

    schedulerWorker.on("stalled", (jobId) => {
        logger.warn(
            { jobId },
            "Scheduler Worker job stalled and will be re-processed",
        );
    });

    logger.info("Scheduler Worker initialized");

    return schedulerWorker;
};

/**
 * Gracefully shuts down the worker.
 */
export const closeSchedulerWorker = async (): Promise<void> => {
    if (schedulerWorker) {
        await schedulerWorker.close();
        schedulerWorker = null;
        logger.info("Scheduler Worker closed");
    }
};
