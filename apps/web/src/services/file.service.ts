import api, { ApiResponse } from "@/lib/api.client";

export interface FileUploadUrlResponse {
    fileId: string;
    uploadUrl: string;
}

export interface FileDownloadUrlResponse {
    fileId: string;
    downloadUrl: string;
}

export interface ProcessFileResponse {
    success: boolean;
}

export interface UserFileItem {
    id: string;
    fileName?: string;
    mimeType?: string;
    status: string;
    createdAt?: string;
    [key: string]: any;
}

export interface GetUserFilesResponse {
    files: UserFileItem[];
}

/**
 * Generate a presigned URL to upload a file directly to storage
 */
export const getFileUploadUrl = async (
    fileName: string,
    mimeType: string,
): Promise<ApiResponse<FileUploadUrlResponse>> => {
    return api.get<FileUploadUrlResponse>("/api/files/upload/url", {
        params: { fileName, mimeType },
    });
};

/**
 * Generate a presigned URL to download an uploaded file
 */
export const getFileDownloadUrl = async (
    fileId: string,
): Promise<ApiResponse<FileDownloadUrlResponse>> => {
    return api.get<FileDownloadUrlResponse>("/api/files/download/url", {
        params: { fileId },
    });
};

/**
 * Trigger file processing after upload is complete
 */
export const processFile = async (
    fileId: string,
): Promise<ApiResponse<ProcessFileResponse>> => {
    return api.post<ProcessFileResponse>("/api/files/process", { fileId });
};

/**
 * Get all files uploaded by the authenticated user
 */
export const getUserFiles = async (): Promise<
    ApiResponse<GetUserFilesResponse>
> => {
    return api.get<GetUserFilesResponse>("/api/files");
};
