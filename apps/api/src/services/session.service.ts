import { env } from "@/config/env.config";
import { SessionCache } from "@/services/cache.service";
import { generateUUIDv7 } from "@/utils/id.util";
import { logger } from "@/utils/logger.util";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * env.SESSION_TTL_DAYS!;

export interface Session {
    userId: string;
    token: string;
    previousToken?: string;
    updatedAt?: number;
}

/**
 * Create a new session in Redis and return the sessionId.
 */
export const createSession = async (
    userId: string,
): Promise<{ sessionId: string }> => {
    // Generate session ID
    const sessionId = generateUUIDv7();

    await SessionCache.set(sessionId, { userId }, SESSION_TTL_SECONDS);

    return { sessionId };
};

/**
 * Updates an existing session in Redis and return the sessionId.
 */
export const updateSession = async (
    sessionId: string,
    token: string,
): Promise<void> => {
    const session = await getSession(sessionId);
    if (!session) {
        throw new Error("Session not found");
    }

    session.previousToken = session.token;
    session.updatedAt = Date.now();
    session.token = token;

    await SessionCache.set(sessionId, session, SESSION_TTL_SECONDS);
};

/**
 * Return if a session exists and is not expired in Redis.
 */
export const getSession = async (sessionId: string) => {
    try {
        const session = await SessionCache.get<Session>(sessionId);
        if (!session) {
            return null;
        }

        return session;
    } catch (error: any) {
        logger.error(error.message);
        return null;
    }
};

/**
 * Destroy a session in Redis (e.g. on logout).
 */
export const destroySession = async (sessionId: string): Promise<void> => {
    try {
        await SessionCache.del(sessionId);
    } catch (error: any) {
        logger.error(error.message);
    }
};
