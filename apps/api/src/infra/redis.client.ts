import { env } from "@/config/env.config";
import { logger } from "@/utils/logger.util";
import Redis from "ioredis";

const REDIS_URL = env.REDIS_URL;

export const redis = new Redis(REDIS_URL, {
    enableOfflineQueue: false, // Commands fail instantly if Redis is disconnected
    retryStrategy: function (times: number) {
        return Math.max(Math.min(Math.exp(times), 20000), 1000);
    },
});

// Successfully connected to the server
redis.on("connect", () => {
    logger.info("Redis connection established successfully");
});

// An error occurred (e.g., connection refused)
redis.on("error", (err) => {
    logger.error(err, "Redis error encountered");
});

// Connection closed
redis.on("close", () => {
    logger.info("Redis connection closed");
});

/**
 * Close the redis connection
 * Waits for pending commands
 */
export const closeRedisConnection = async () => {
    if (redis.status !== "end") {
        await redis.quit();
    }
};
