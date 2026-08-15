export const FILE_STATUS = ["PENDING", "UPLOADED"] as const;
export const SUPPORTED_MIME_TYPES = {
    "application/pdf": "PDF",
} as const;

export type FileStatus = (typeof FILE_STATUS)[number];

// === Display Labels ===
export const FILE_STATUS_DISPLAY_LABELS: Record<FileStatus, string> = {
    PENDING: "Pending",
    UPLOADED: "Uploaded",
};

// === Helper Functions ===
export function getFileStatusDisplayLabel(status?: string | null): string {
    if (!status) return "Pending";
    return FILE_STATUS_DISPLAY_LABELS[status as FileStatus] || status;
}
