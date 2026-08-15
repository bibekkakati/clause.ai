import { env } from "@/config/env.config";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    HeadObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ENDPOINT = env.S3_ENDPOINT;
const ACCESS_KEY = env.S3_ACCESS_KEY;
const SECRET_KEY = env.S3_SECRET_KEY;

const s3Client = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

/**
 * Get presigned URL for uploading an object
 */
export const getObjectUploadUrl = async (
    bucket: string,
    key: string,
    expiryInSeconds: number,
): Promise<string> => {
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(s3Client, cmd, { expiresIn: expiryInSeconds });
};

/**
 * Get presigned URL for downloading an object
 */
export const getObjectDownloadUrl = async (
    bucket: string,
    key: string,
    fileName: string,
    expiryInSeconds: number,
): Promise<string> => {
    const cmd = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
    return getSignedUrl(s3Client, cmd, { expiresIn: expiryInSeconds });
};

/**
 * Checks if key exists in storage bucket
 */
export const doesObjectExist = async (
    bucket: string,
    key: string,
): Promise<boolean> => {
    const cmd = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    try {
        await s3Client.send(cmd);
        return true;
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((error as { name: string }).name === "NotFound") {
            return false;
        }
        throw error;
    }
};

/**
 * Delete an object from storage
 */
export const deleteObject = async (
    bucket: string,
    key: string,
): Promise<void> => {
    const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await s3Client.send(cmd);
};
