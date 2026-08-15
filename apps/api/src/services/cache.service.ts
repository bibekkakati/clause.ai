import { AgreementsSchema } from "@/db/schema/agreements";
import { redis } from "@/infra/redis.client";
import { logger } from "@/utils/logger.util";

// ── Session Cache ──────────────────────────────────────────────
const SESSION_PREFIX = "session";

export const SessionCache = {
    set: async (
        sessionId: string,
        data: Record<string, any>,
        ttlSeconds: number,
    ) => {
        try {
            await redis.set(
                `${SESSION_PREFIX}:${sessionId}`,
                JSON.stringify(data),
                "EX",
                ttlSeconds,
            );
        } catch (error: any) {
            logger.error(`SessionCache.set error: ${error.message}`);
        }
    },
    get: async <T = Record<string, any>>(
        sessionId: string,
    ): Promise<T | null> => {
        try {
            const result = await redis.get(`${SESSION_PREFIX}:${sessionId}`);
            return result ? (JSON.parse(result) as T) : null;
        } catch (error: any) {
            logger.error(`SessionCache.get error: ${error.message}`);
            return null;
        }
    },
    del: async (sessionId: string) => {
        try {
            await redis.del(`${SESSION_PREFIX}:${sessionId}`);
        } catch (error: any) {
            logger.error(`SessionCache.del error: ${error.message}`);
        }
    },
};

// ── OTP Cache ──────────────────────────────────────────────────
const OTP_PREFIX = "otp";

export const OtpCache = {
    set: async (key: string, data: Record<string, any>, ttlSeconds: number) => {
        try {
            await redis.set(
                `${OTP_PREFIX}:${key}`,
                JSON.stringify(data),
                "EX",
                ttlSeconds,
            );
        } catch (error: any) {
            logger.error(`OtpCache.set error: ${error.message}`);
        }
    },
    get: async <T = Record<string, any>>(key: string): Promise<T | null> => {
        try {
            const result = await redis.get(`${OTP_PREFIX}:${key}`);
            return result ? (JSON.parse(result) as T) : null;
        } catch (error: any) {
            logger.error(`OtpCache.get error: ${error.message}`);
            return null;
        }
    },
    del: async (key: string) => {
        try {
            await redis.del(`${OTP_PREFIX}:${key}`);
        } catch (error: any) {
            logger.error(`OtpCache.del error: ${error.message}`);
        }
    },
};

// ── Chat Cache ─────────────────────────────────────────────────
const CHAT_PREFIX = "chat";
const CHAT_TTL_SECONDS = 60 * 60 * 1; // 1 hour

export const ChatCache = {
    set: async (
        chatId: string,
        data: Record<string, any>,
        ttlSeconds: number = CHAT_TTL_SECONDS,
    ) => {
        try {
            await redis.set(
                `${CHAT_PREFIX}:${chatId}`,
                JSON.stringify(data),
                "EX",
                ttlSeconds,
            );
        } catch (error: any) {
            logger.error(`ChatCache.set error: ${error.message}`);
        }
    },
    get: async <T = Record<string, any>>(chatId: string): Promise<T | null> => {
        try {
            const result = await redis.get(`${CHAT_PREFIX}:${chatId}`);
            return result ? (JSON.parse(result) as T) : null;
        } catch (error: any) {
            logger.error(`ChatCache.get error: ${error.message}`);
            return null;
        }
    },
};

// ── Query Response Cache ───────────────────────────────────────
const QUERY_RESPONSE_PREFIX = "queryresponse";
const QUERY_RESPONSE_TTL_SECONDS = 600; // 10 minutes

interface QueryResponse {
    status: "SUCCESS" | "PROCESSING" | "FAILED";
    error: string;
    message?: Record<string, any>;
}

export const QueryResponseCache = {
    set: async (
        queryId: string,
        data: QueryResponse,
        ttlSeconds: number = QUERY_RESPONSE_TTL_SECONDS,
    ) => {
        try {
            await redis.set(
                `${QUERY_RESPONSE_PREFIX}:${queryId}`,
                JSON.stringify(data),
                "EX",
                ttlSeconds,
            );
        } catch (error: any) {
            logger.error(`QueryResponseCache.set error: ${error.message}`);
        }
    },
    get: async (queryId: string): Promise<QueryResponse | null> => {
        try {
            const result = await redis.get(
                `${QUERY_RESPONSE_PREFIX}:${queryId}`,
            );
            return result ? JSON.parse(result) : null;
        } catch (error: any) {
            logger.error(`QueryResponseCache.get error: ${error.message}`);
            return null;
        }
    },
};

// ── Agreement Cache ────────────────────────────────────────────
const AGREEMENT_PREFIX = "agreement";
const AGREEMENT_TTL_SECONDS = 60 * 60 * 1; // 1 hour

export const AgreementCache = {
    set: async (
        agreementId: string,
        data: Record<string, any>,
        ttlSeconds: number = AGREEMENT_TTL_SECONDS,
    ) => {
        try {
            await redis.set(
                `${AGREEMENT_PREFIX}:${agreementId}`,
                JSON.stringify(data),
                "EX",
                ttlSeconds,
            );
        } catch (error: any) {
            logger.error(`AgreementCache.set error: ${error.message}`);
        }
    },
    get: async <T = Record<string, any>>(
        agreementId: string,
    ): Promise<T | null> => {
        try {
            const result = await redis.get(
                `${AGREEMENT_PREFIX}:${agreementId}`,
            );
            return result ? JSON.parse(result) : null;
        } catch (error: any) {
            logger.error(`AgreementCache.get error: ${error.message}`);
            return null;
        }
    },
    del: async (agreementId: string) => {
        try {
            await redis.del(`${AGREEMENT_PREFIX}:${agreementId}`);
        } catch (error: any) {
            logger.error(`AgreementCache.del error: ${error.message}`);
        }
    },
};

// ── Agreement User Map Cache ───────────────────────────────────
const AGREEMENT_USER_PREFIX = "agreement_user";
const AGREEMENT_USER_TTL_SECONDS = 60 * 60 * 24; // 1 day

export const AgreementUserMapCache = {
    set: async (
        agreementId: string,
        userId: string,
        ttlSeconds: number = AGREEMENT_USER_TTL_SECONDS,
    ) => {
        try {
            await redis.set(
                `${AGREEMENT_USER_PREFIX}:${agreementId}`,
                userId,
                "EX",
                ttlSeconds,
            );
        } catch (error: any) {
            logger.error(`AgreementUserMapCache.set error: ${error.message}`);
        }
    },
    get: async (agreementId: string): Promise<string | null> => {
        try {
            return await redis.get(`${AGREEMENT_USER_PREFIX}:${agreementId}`);
        } catch (error: any) {
            logger.error(`AgreementUserMapCache.get error: ${error.message}`);
            return null;
        }
    },
};

// ── Chat Messages List Cache ───────────────────────────────────
const CHAT_MESSAGES_PREFIX = "chat_messages";
const CHAT_MESSAGES_CACHE_LIMIT = 20;
const CHAT_MESSAGES_TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week

export const ChatMessagesCache = {
    limit: CHAT_MESSAGES_CACHE_LIMIT,
    push: async (chatId: string, message: Record<string, any>) => {
        try {
            const key = `${CHAT_MESSAGES_PREFIX}:${chatId}`;
            const pipeline = redis.pipeline();
            pipeline.lpush(key, JSON.stringify(message));
            pipeline.ltrim(key, 0, CHAT_MESSAGES_CACHE_LIMIT - 1);
            pipeline.expire(key, CHAT_MESSAGES_TTL_SECONDS);
            await pipeline.exec();
        } catch (error: any) {
            logger.error(`ChatMessagesCache.push error: ${error.message}`);
        }
    },

    setMany: async (chatId: string, messages: Record<string, any>[]) => {
        try {
            if (messages.length === 0) return;
            const key = `${CHAT_MESSAGES_PREFIX}:${chatId}`;
            const pipeline = redis.pipeline();
            pipeline.del(key);
            // messages are in newest -> oldest order
            const payload = messages
                .slice(0, CHAT_MESSAGES_CACHE_LIMIT)
                .map((m) => JSON.stringify(m));
            pipeline.rpush(key, ...payload);
            pipeline.expire(key, CHAT_MESSAGES_TTL_SECONDS);
            await pipeline.exec();
        } catch (error: any) {
            logger.error(`ChatMessagesCache.setMany error: ${error.message}`);
        }
    },

    getRecent: async <T = Record<string, any>>(
        chatId: string,
        limit: number = CHAT_MESSAGES_CACHE_LIMIT,
    ): Promise<T[] | null> => {
        try {
            const key = `${CHAT_MESSAGES_PREFIX}:${chatId}`;
            const exists = await redis.exists(key);
            if (!exists) return null;

            const rawMessages = await redis.lrange(key, 0, limit - 1);
            return rawMessages.map((m) => JSON.parse(m) as T);
        } catch (error: any) {
            logger.error(`ChatMessagesCache.getLatest error: ${error.message}`);
            return null;
        }
    },

    del: async (chatId: string) => {
        try {
            await redis.del(`${CHAT_MESSAGES_PREFIX}:${chatId}`);
        } catch (error: any) {
            logger.error(`ChatMessagesCache.del error: ${error.message}`);
        }
    },
};
