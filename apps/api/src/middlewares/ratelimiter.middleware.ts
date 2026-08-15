import { redis } from "@/infra/redis.client";
import { Request } from "express";
import { rateLimit } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";

/**
 * Waits for Redis to be ready before sending commands.
 * This avoids the "Stream isn't writeable" error when rate limiters
 * are initialized at module load time before Redis has connected.
 */
const sendCommand = async (
    command: string,
    ...args: string[]
): Promise<RedisReply> => {
    if (redis.status !== "ready") {
        await new Promise<void>((resolve) => {
            redis.once("ready", resolve);
        });
    }
    return redis.call(command, ...args) as Promise<RedisReply>;
};

const createRedisStore = (prefix: string) =>
    new RedisStore({ prefix, sendCommand });

/**
 * Key generator for authenticated routes — rate limit by userId, not IP.
 */
const getRequestUserKey = (req: Request): string => {
    return req.user?.userId;
};

/**
 * General API rate limiter — applies to all authenticated routes.
 * 200 requests per 15-minute window per user.
 */
const api = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRequestUserKey,
    skipFailedRequests: true,
    store: createRedisStore("rl:api:"),
    message: { error: "Too many requests, please try again later." },
});

/**
 * Strict rate limiter for AI-powered endpoints (/query, /process).
 * These are expensive (LLM calls, embeddings) and must be tightly controlled.
 * 20 requests per 15-minute window per user.
 */
const ai = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRequestUserKey,
    skipFailedRequests: true,
    store: createRedisStore("rl:ai:"),
    message: {
        error: "AI query rate limit reached. Please wait before trying again.",
    },
});

/**
 * Auth endpoint limiter — prevents brute-force login/signup attempts.
 * 10 requests per 15-minute window per IP.
 */
const auth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
    store: createRedisStore("rl:auth:"),
    message: { error: "Too many attempts, please try again later." },
});

/**
 * Rate limiter middleware object
 */
const RateLimiter = {
    api,
    auth,
    ai,
};

export default RateLimiter;
