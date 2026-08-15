import { env } from "@/config/env.config";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    userId: string;
    sessionId: string;
}

const JWT_SECRET = env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN as any;

/**
 * Generate a new JWT token for a given user and session ID.
 */
export const generateToken = (payload: {
    userId: string;
    sessionId: string;
}): string => {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify and decode an incoming JWT token.
 * Throws an error (e.g. TokenExpiredError or JsonWebTokenError) if invalid/expired.
 */
export const verifyToken = (token: string): CustomJwtPayload => {
    return jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
};

/**
 * Decode a token without signature verification (useful to extract payload from expired tokens).
 */
export const decodeToken = (token: string): CustomJwtPayload | null => {
    return jwt.decode(token) as CustomJwtPayload | null;
};
