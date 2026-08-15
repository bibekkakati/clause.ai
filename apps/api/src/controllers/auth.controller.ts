import { logger } from "@/utils/logger.util";
import * as AuthService from "@/services/auth.service";
import { isEmail } from "@/utils/validator.util";
import { Request, Response } from "express";

/**
 * Request OTP for login / signup
 */
export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!isEmail(email)) {
            return res.status(400).json({ error: "Email is invalid" });
        }

        const { error, expiryInMins } = await AuthService.sendOTP(email);

        if (error) {
            return res.status(400).json({ error });
        }

        return res.status(200).json({
            message: "OTP sent successfully",
            expiryInMins,
        });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Verify OTP and issue JWT + Session ID
 */
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res
                .status(400)
                .json({ error: "Email and OTP are required" });
        }

        const { success, error, token, enableOnboarding } =
            await AuthService.authenticateWithOTP(email, otp);

        if (!success) {
            return res.status(400).json({ error });
        }

        // Set token header
        res.setHeader("x-access-token", token!);
        res.setHeader("Access-Control-Expose-Headers", "x-access-token");

        return res.status(200).json({
            message: "OTP verified successfully",
            enableOnboarding,
        });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.user;

        await AuthService.logoutUser(sessionId);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
