import * as UserService from "@/services/user.service";
import { logger } from "@/utils/logger.util";
import { Request, Response } from "express";

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const user = await UserService.fetchUserProfile(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
