import { SUPPORTED_MIME_TYPES } from "@/constants";
import { logger } from "@/utils/logger.util";
import * as FileService from "@/services/file.service";
import { Request, Response } from "express";

/**
 * Generate Presigned URL for uploading a file directly from client
 */
export const getFileUploadUrl = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { fileName, mimeType } = req.query as {
            fileName: string;
            mimeType: string;
        };

        if (!fileName || !mimeType) {
            return res
                .status(400)
                .json({ error: "Filename and mime type are required" });
        }

        if (!SUPPORTED_MIME_TYPES.hasOwnProperty(mimeType)) {
            return res
                .status(400)
                .json({ error: `Unsupported file type: ${mimeType}` });
        }

        const { success, fileId, uploadUrl } =
            await FileService.generateFileUploadUrl(userId, fileName, mimeType);

        if (!success) {
            return res
                .status(400)
                .json({ error: "Failed to generate presigned URL" });
        }

        return res.status(200).json({ fileId, uploadUrl });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Generate Presigned URL for downloading a file directly from client
 */
export const getFileDownloadUrl = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { fileId } = req.query as { fileId: string };

        if (!fileId) {
            return res.status(400).json({ error: "File ID is required" });
        }

        const { success, downloadUrl, error } =
            await FileService.generateFileDownloadUrl(userId, fileId);

        if (!success) {
            return res.status(400).json({ error });
        }

        return res.status(200).json({ fileId, downloadUrl });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Process uploaded file
 */
export const processFile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { fileId } = req.body as { fileId: string };

        if (!fileId) {
            return res.status(400).json({ error: "File ID is required" });
        }

        const { success, error } = await FileService.processFile(
            userId,
            fileId,
        );

        if (!success) {
            return res.status(400).json({ error });
        }

        return res.status(200).json({ success });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get all user uploaded files
 */
export const getUserFiles = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        const { files } = await FileService.fetchFilesByUser(userId);

        return res.status(200).json({
            files,
        });
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
