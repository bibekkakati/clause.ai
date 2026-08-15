// src/services/file.service.ts
import { env } from "@/config/env.config";
import { FILE_STATUS } from "@/constants";
import { Files } from "@/db/schema/files";
import { db } from "@/infra/db.client";
import {
    doesObjectExist,
    getObjectDownloadUrl,
    getObjectUploadUrl,
} from "@/infra/s3.client";
import { publishAgreementProcessEvent } from "@/queues/message.queue";
import { and, desc, eq, lt } from "drizzle-orm";
import * as AgreementService from "./agreements.service";

const BUCKET_NAME = env.FILES_BUCKET;

/**
 * Generates the Storage object key for a given user and file.
 */
const getFileObjectKey = (userId: string, fileId: string) => {
    return `files/${userId}/${fileId}`;
};

/**
 * Creates the file instance in database and returns a presigned URL for uploading a file.
 */
export const generateFileUploadUrl = async (
    userId: string,
    fileName: string,
    mimeType: string,
) => {
    return await db.transaction(async (tx) => {
        // 1. Save file metadata in DB
        const [file] = await tx
            .insert(Files)
            .values({
                user_id: userId,
                file_name: fileName,
                mime_type: mimeType,
                status: FILE_STATUS[0], // "PENDING"
            })
            .returning({ id: Files.id });

        const key = getFileObjectKey(userId, file.id);

        // Update key in db
        await tx
            .update(Files)
            .set({
                key: key,
            })
            .where(eq(Files.id, file.id));

        // 2. Generate Presigned URL (rolls back insert on failure)
        const uploadUrl = await getObjectUploadUrl(BUCKET_NAME, key, 300);

        return {
            success: true,
            fileId: file.id,
            uploadUrl,
        };
    });
};

/**
 * Validates file ID and returns a presigned URL for downloading a file.
 */
export const generateFileDownloadUrl = async (
    userId: string,
    fileId: string,
    expiryInSeconds: number = 300,
) => {
    // 1. Find file and check ownership
    const [file] = await db
        .select({
            id: Files.id,
            file_name: Files.file_name,
            mime_type: Files.mime_type,
            key: Files.key,
        })
        .from(Files)
        .where(and(eq(Files.id, fileId), eq(Files.user_id, userId)));

    if (!file) {
        return {
            success: false,
            error: "File not found",
        };
    }

    // 2. Generate presigned download URL
    const downloadUrl = await getObjectDownloadUrl(
        BUCKET_NAME,
        file.key,
        file.file_name,
        expiryInSeconds,
    );

    return {
        success: true,
        downloadUrl,
        mimeType: file.mime_type,
    };
};

/**
 * Fetch files by user ID
 */
export const fetchFilesByUser = async (userId: string) => {
    const files = await db
        .select({
            id: Files.id,
            fileName: Files.file_name,
            mimeType: Files.mime_type,
            status: Files.status,
            createdAt: Files.created_at,
        })
        .from(Files)
        .where(and(eq(Files.user_id, userId), eq(Files.status, FILE_STATUS[1])))
        .orderBy(desc(Files.created_at));

    return {
        success: true,
        files,
    };
};

/**
 * Update file status and enqueue background job to process the file.
 */
export const processFile = async (userId: string, fileId: string) => {
    // Verify file exists and belongs to user
    const [file] = await db
        .select({
            status: Files.status,
            key: Files.key,
        })
        .from(Files)
        .where(and(eq(Files.id, fileId), eq(Files.user_id, userId)));

    // File not found
    if (!file) {
        return {
            success: false,
            error: "File not found",
        };
    }

    // Check if file exists in storage
    const isUploaded = await doesObjectExist(BUCKET_NAME, file.key);
    if (!isUploaded) {
        return {
            success: false,
            error: "File is not uploaded yet",
        };
    }

    // Mark file status in DB as "UPLOADED" if is "PENDING"
    if (file.status === "PENDING") {
        await db
            .update(Files)
            .set({ status: "UPLOADED" })
            .where(eq(Files.id, fileId));
    }

    // Check if file is processed
    const isProcessed = await AgreementService.isFileProcessed(fileId, userId);

    // If true, return error
    if (isProcessed) {
        return { success: false, error: "File is already processed" };
    }

    // Else, create the agreement
    const agreementId: string = await AgreementService.createAgreement(
        userId,
        fileId,
    );

    // Emit agreement proccesing event
    await publishAgreementProcessEvent({
        agreementId,
        fileId,
        userId,
    });

    return { success: true };
};

/**
 * Delete files entry with pending state older than 1 hours from now
 */
export const cleanup = async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Delete stale pending records
    await db
        .delete(Files)
        .where(
            and(
                eq(Files.status, FILE_STATUS[0]),
                lt(Files.created_at, oneHourAgo),
            ),
        );
};
