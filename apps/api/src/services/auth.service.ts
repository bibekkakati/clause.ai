import * as OtpService from "@/services/otp.service";
import * as SessionService from "@/services/session.service";
import * as UserService from "@/services/user.service";
import { generateToken } from "@/utils/jwt.util";
import { logger } from "@/utils/logger.util";

/**
 * Send OTP to the given communication medium
 */
export const sendOTP = async (email: string) => {
    return await OtpService.sendEmailOTP(email);
};

/**
 * Verify OTP, find or create user, create session, and return token
 */
export const authenticateWithOTP = async (email: string, otp: string) => {
    // 1. Validate OTP
    const { error } = await OtpService.verifyEmailOTP(email, otp);
    if (error) {
        return { success: false, error };
    }

    // 2. Create user if not exists
    const { userId, created } = await UserService.createUser(email);

    // 3. Create session & generate JWT
    const { sessionId } = await SessionService.createSession(userId);

    const token = generateToken({ userId, sessionId });
    await SessionService.updateSession(sessionId, token);

    // 4. Clear OTP session (fire-and-forget)
    OtpService.deleteOtpSession(email);

    return {
        success: true,
        token,
        enableOnboarding: created,
    };
};

/**
 * Logout user
 */
export const logoutUser = async (sessionId: string) => {
    try {
        await SessionService.destroySession(sessionId);
    } catch (error: any) {
        logger.error("Failed to logout user", error.message);
    }
};
