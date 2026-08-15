import { fileService } from "@/services";
import axios from "axios";
import React, { useRef, useState } from "react";
import {
    IconAlertTriangle,
    IconCheck,
    IconClose,
    IconFilePdf,
    IconUploadCloud,
    InlineSpinner,
} from "./icons/CustomIcons";

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
    isOpen,
    onClose,
    onUploadComplete,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [stepStatus, setStepStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (
            selectedFile.type !== "application/pdf" &&
            !selectedFile.name.toLowerCase().endsWith(".pdf")
        ) {
            setError(
                "Only PDF agreements are supported. Please select a .pdf file.",
            );
            setFile(null);
            return;
        }

        setError(null);
        setFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        if (
            droppedFile.type !== "application/pdf" &&
            !droppedFile.name.toLowerCase().endsWith(".pdf")
        ) {
            setError(
                "Only PDF agreements are supported. Please select a .pdf file.",
            );
            setFile(null);
            return;
        }

        setError(null);
        setFile(droppedFile);
    };

    const handleStartUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            // Step 1: Request presigned upload URL
            setStepStatus("1/3: Requesting secure presigned upload URL...");
            const urlRes = await fileService.getFileUploadUrl(
                file.name,
                "application/pdf",
            );

            if (!urlRes.success || !urlRes.data) {
                throw new Error(
                    urlRes.error || "Failed to generate presigned upload URL.",
                );
            }

            const { fileId, uploadUrl } = urlRes.data;

            // Step 2: Upload file payload to presigned URL via PUT
            setStepStatus("2/3: Uploading PDF document payload...");
            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": "application/pdf",
                },
            });

            // Step 3: Trigger file processing
            setStepStatus(
                "3/3: Initializing vector chunking & agreement creation...",
            );
            const processRes = await fileService.processFile(fileId);

            if (!processRes.success) {
                throw new Error(
                    processRes.error || "Failed to process file after upload.",
                );
            }

            setStepStatus("PDF uploaded & agreement generated successfully!");
            setTimeout(() => {
                setUploading(false);
                onUploadComplete();
                handleClose();
            }, 1000);
        } catch (err: any) {
            setUploading(false);
            setStepStatus(null);
            setError(
                err.response?.data?.error ||
                    err.message ||
                    "Failed to upload and process file. Please try again.",
            );
        }
    };

    const handleClose = () => {
        if (uploading) return;
        setFile(null);
        setError(null);
        setStepStatus(null);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "500px", width: "100%" }}
            >
                {/* Modal Body */}
                <p
                    style={{
                        fontSize: "0.88rem",
                        color: "#64748B",
                        marginBottom: "20px",
                        lineHeight: 1.5,
                    }}
                >
                    Upload your rental agreement, commercial lease, or tenant
                    contract in PDF format.
                </p>

                {/* Error Alert */}
                {error && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "var(--pastel-red-bg)",
                            border: "1px solid var(--pastel-red-border)",
                            color: "var(--pastel-red-text)",
                            fontSize: "0.82rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "18px",
                        }}
                    >
                        <IconAlertTriangle size={15} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Dropzone Area */}
                {!file ? (
                    <div
                        className="dropzone"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            style={{ display: "none" }}
                            onChange={handleFileSelect}
                        />

                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "#0F172A",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 14px auto",
                                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                            }}
                        >
                            <IconFilePdf size={24} />
                        </div>

                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                color: "#0F172A",
                                marginBottom: "4px",
                            }}
                        >
                            Click to upload or drag & drop
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                            PDF documents up to 25MB
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#F8FAFC",
                            border: "1px solid var(--border-medium)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    background: "#FEF2F2",
                                    border: "1px solid #FEE2E2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#DC2626",
                                    flexShrink: 0,
                                }}
                            >
                                <IconFilePdf size={20} />
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "0.88rem",
                                        color: "#0F172A",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    title={file.name}
                                >
                                    {file.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "#64748B",
                                    }}
                                >
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    &bull; Ready to process
                                </div>
                            </div>
                        </div>

                        {!uploading && (
                            <button
                                onClick={() => setFile(null)}
                                className="btn btn-ghost btn-sm"
                                aria-label="Remove selected file"
                                style={{ padding: "4px", color: "#94A3B8" }}
                            >
                                <IconClose size={16} />
                            </button>
                        )}
                    </div>
                )}

                {/* Pipeline Step Status */}
                {stepStatus && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "var(--pastel-blue-bg)",
                            border: "1px solid var(--pastel-blue-border)",
                            color: "var(--pastel-blue-text)",
                            fontSize: "0.82rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "18px",
                        }}
                    >
                        {uploading ? (
                            <InlineSpinner size={14} />
                        ) : (
                            <IconCheck size={14} />
                        )}
                        <span>{stepStatus}</span>
                    </div>
                )}

                {/* Modal Actions */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "24px",
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleClose}
                        disabled={uploading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleStartUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <InlineSpinner size={14} />
                                <span>Processing PDF...</span>
                            </>
                        ) : (
                            <>
                                <IconUploadCloud size={14} />
                                <span>Upload Document</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;
