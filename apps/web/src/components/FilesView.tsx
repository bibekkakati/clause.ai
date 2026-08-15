import { UserFileItem } from "@/services/file.service";
import { getFileStatusDisplayLabel } from "@clause-ai/constants";
import React from "react";
import {
    IconFilePdf,
    IconPlus,
    IconRefresh,
    IconUploadCloud,
    InlineSpinner,
} from "./icons/CustomIcons";

interface FilesViewProps {
    files: UserFileItem[];
    loading: boolean;
    onRefresh: () => void;
    onOpenUploadModal: () => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
    files,
    loading,
    onRefresh,
    onOpenUploadModal,
}) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = (status?: string) => {
        const s = (status || "UPLOADED").toUpperCase();
        const label = getFileStatusDisplayLabel(status);
        if (s === "UPLOADED") {
            return <span className="badge badge-success">{label}</span>;
        }
        if (s === "PENDING") {
            return <span className="badge badge-warning">{label}</span>;
        }
        return <span className="badge badge-info">{label}</span>;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* View Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <h1
                            style={{
                                fontSize: "1.6rem",
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                                color: "#0F172A",
                            }}
                        >
                            Files History
                        </h1>
                        <span
                            className="badge badge-neutral"
                            style={{ fontWeight: 600 }}
                        >
                            {files.length} Stored
                        </span>
                    </div>
                    <p
                        style={{
                            fontSize: "0.88rem",
                            color: "#64748B",
                            marginTop: "4px",
                        }}
                    >
                        Uploaded PDF documents, presigned status, and automated
                        processing pipelines.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onRefresh}
                        disabled={loading}
                        style={{ padding: "8px 14px" }}
                    >
                        {loading ? (
                            <InlineSpinner size={14} />
                        ) : (
                            <IconRefresh size={14} />
                        )}
                        <span>Refresh</span>
                    </button>

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={onOpenUploadModal}
                        style={{ padding: "8px 16px" }}
                    >
                        <IconPlus size={14} />
                        <span>Upload PDF</span>
                    </button>
                </div>
            </div>

            {/* Files Table / Empty State */}
            {files.length === 0 && !loading ? (
                <div
                    className="bento-card"
                    style={{
                        padding: "64px 24px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            background: "#0F172A",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "18px",
                        }}
                    >
                        <IconUploadCloud size={26} />
                    </div>

                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            marginBottom: "8px",
                            color: "#0F172A",
                        }}
                    >
                        No Files Uploaded Yet
                    </h3>
                    <p
                        style={{
                            fontSize: "0.9rem",
                            color: "#64748B",
                            maxWidth: "420px",
                            marginBottom: "28px",
                            lineHeight: 1.6,
                        }}
                    >
                        Upload lease and rental contracts as PDF to start vector
                        processing, AI metadata extraction, and agreement
                        generation.
                    </p>

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={onOpenUploadModal}
                    >
                        <IconUploadCloud size={18} /> Upload Your First PDF
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: "42%" }}>File Name</th>
                                <th style={{ width: "20%" }}>MIME Type</th>
                                <th style={{ width: "18%" }}>Upload Status</th>
                                <th style={{ width: "20%" }}>Uploaded At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.id}>
                                    <td>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "34px",
                                                    height: "34px",
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
                                                <IconFilePdf size={18} />
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: "#0F172A",
                                                    }}
                                                >
                                                    {file.fileName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className="badge badge-neutral"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {file.mimeType || "application/pdf"}
                                        </span>
                                    </td>

                                    <td>{getStatusBadge(file.status)}</td>

                                    <td
                                        style={{
                                            fontSize: "0.82rem",
                                            color: "#64748B",
                                        }}
                                    >
                                        {formatDate(file.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FilesView;
