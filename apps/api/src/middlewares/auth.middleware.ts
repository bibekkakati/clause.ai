import type { Session } from "@/services/session.service.js";
import * as SessionService from "@/services/session.service.js";
import { decodeToken, generateToken, verifyToken } from "@/utils/jwt.util.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getContext } from "@/utils/context.util";
import { logger } from "@/utils/logger.util";

// Extend Express Request interface to include custom properties
declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string;
                sessionId: string;
            };
        }
    }
}

/**
 * Authorization middleware validating JWT header and falling back to Redis session check if expired.
 */
export const authorize = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Unauthorized: Unsupported authorization header",
            });
        }

        // Split bearer token
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            // 1. Validate incoming JWT
            const decoded = verifyToken(token);

            // Token is verified - extract payload
            req.user = decoded;
            const ctx = getContext();
            if (ctx) ctx.userId = decoded.userId;

            // Move to next middleware
            return next();
        } catch (err: unknown) {
            // 2. Handle expired token
            if (err instanceof jwt.TokenExpiredError) {
                // Decode expired token
                const decodedExpired = decodeToken(token);

                // Validate decoded token payload
                if (
                    !decodedExpired ||
                    !decodedExpired.sessionId ||
                    !decodedExpired.userId
                ) {
                    return res.status(401).json({
                        error: "Unauthorized: Invalid expired token payload",
                    });
                }

                // Extract payload
                const { sessionId, userId } = decodedExpired;

                // Get session via Session Service
                const session: Session | null =
                    await SessionService.getSession(sessionId);

                // Handle race condition during token updation through grace period
                // If token is previous token and expiry is within 30 seconds
                const expTimeMs = (decodedExpired.exp || 0) * 1000;
                const reqWithinGracePeriod =
                    session &&
                    session.token !== token &&
                    session.previousToken === token &&
                    Date.now() - expTimeMs < 30000; // 30 seconds

                // Check if session is valid
                // Session exists, user matched, and token is either current or within grace period
                if (
                    !session ||
                    session.userId !== userId ||
                    (session.token !== token && !reqWithinGracePeriod)
                ) {
                    // Destroy session if found (user is using older token or compromised)
                    if (session) await SessionService.destroySession(sessionId);

                    return res.status(401).json({
                        error: "Unauthorized: Session expired or invalid",
                    });
                }

                // Define payload for the token
                const payload = { userId, sessionId };

                // If within grace period, reuse the recently generated token
                // Otherwise generate a new one
                if (!reqWithinGracePeriod) {
                    const newToken = generateToken(payload);
                    await SessionService.updateSession(sessionId, newToken);

                    res.setHeader("x-access-token", newToken);
                    res.setHeader(
                        "Access-Control-Expose-Headers",
                        "x-access-token",
                    );
                }

                req.user = payload;
                const ctx = getContext();
                if (ctx) ctx.userId = userId;

                return next();
            }

            // 3. Any other JWT error
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token" });
        }
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
