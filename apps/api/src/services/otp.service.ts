import { env } from "@/config/env.config";
import { publishEmailNotificationEvent } from "@/queues/message.queue";
import { OtpCache } from "@/services/cache.service";
import { logger } from "@/utils/logger.util";

interface OtpPayload {
    email: string;
    otp: string;
    retry: number;
    expiryTime: number;
}

const DEVELOPMENT_OTP = env.DEVELOPMENT_OTP;
const OTP_RETRY_LIMIT = env.OTP_RETRY_LIMIT;
const OTP_EXPIRY_MINUTES = env.OTP_EXPIRY_MINUTES!;

/**
 * Generate a 6 digit OTP
 *
 * @returns number
 */
const generateOTP = (): string => {
    if (DEVELOPMENT_OTP) return DEVELOPMENT_OTP;
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send email with OTP
 * If existing OTP found within retry limit, same OTP will be triggered
 *
 * @param email string
 */
export const sendEmailOTP = async (
    email: string,
): Promise<{
    success: boolean;
    error?: string;
    expiryInMins?: number;
}> => {
    if (!email) {
        throw new Error("Email is required.");
    }

    let otp: string;
    let expiryTime: number;
    let retry: number = 0;

    // Check if OTP session already exists
    const existingPayload = await OtpCache.get<OtpPayload>(email);
    if (existingPayload) {
        otp = existingPayload.otp;
        retry = existingPayload.retry;
    } else {
        otp = generateOTP();
    }

    if (retry >= OTP_RETRY_LIMIT) {
        return {
            error: "Too many retries. Please try again later.",
            success: false,
        };
    }

    // Prepare the expiry time
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + OTP_EXPIRY_MINUTES);
    expiryTime = expiryDate.getTime();

    // Increment the retry count
    retry += 1;

    // Prepare the payload
    const payload: OtpPayload = { email, otp, expiryTime, retry };
    // Set the payload in Redis with expiry time
    await OtpCache.set(email, payload, OTP_EXPIRY_MINUTES * 60);

    // Trigger email through event
    await publishEmailNotificationEvent({
        email,
        type: "OTP",
        payload: { otp, expiryMins: OTP_EXPIRY_MINUTES },
    });

    return { success: true, expiryInMins: OTP_EXPIRY_MINUTES };
};

/**
 * Verify OTP
 *
 * @param email string
 * @param otp string
 * @returns Promise<{ success: boolean; error?: string }>
 */
export const verifyEmailOTP = async (
    email: string,
    otp: string,
): Promise<{ success: boolean; error?: string }> => {
    if (!email || !otp) {
        throw new Error("Email and OTP is required.");
    }

    const payload = await OtpCache.get<OtpPayload>(email);

    // Check if OTP session already exists
    if (!payload) {
        return {
            success: false,
            error: "OTP is expired",
        };
    }

    // Check if email is same
    if (payload.email !== email) {
        return {
            success: false,
            error: "Request is not valid",
        };
    }

    // Check if OTP is valid
    if (payload.otp !== otp) {
        return {
            success: false,
            error: "OTP is not valid",
        };
    }

    return {
        success: true,
    };
};

/**
 * Deletes the OTP session
 *
 * @param email string
 */
export const deleteOtpSession = async (email: string) => {
    if (!email) {
        throw new Error("Email is required.");
    }

    try {
        await OtpCache.del(email);
    } catch (error: any) {
        logger.error(error.message);
    }
};
