import { env } from "@/config/env.config";
import Redis from "ioredis";

const REDIS_MQ_URL = env.REDIS_MQ_URL;

let queueConnection: Redis | null = null;

// Create connection (worker needs unique connection)
export const createWorkerConnection = () =>
    new Redis(REDIS_MQ_URL, {
        maxRetriesPerRequest: null,
        enableOfflineQueue: true, // ops are queued until connection is restored
        retryStrategy: function (times: number) {
            return Math.max(Math.min(Math.exp(times), 20000), 1000);
        },
    });

// Create connection (queue can use shared connection)
export const createQueueConnection = () => {
    if (queueConnection) {
        return queueConnection;
    }

    queueConnection = new Redis(REDIS_MQ_URL, {
        maxRetriesPerRequest: null,
        enableOfflineQueue: false, // immediate failure in queue
        retryStrategy: function (times: number) {
            return Math.max(Math.min(Math.exp(times), 20000), 1000);
        },
    });
    return queueConnection;
};
