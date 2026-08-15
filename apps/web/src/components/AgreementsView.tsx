import { AgreementSummaryItem } from "@/services/agreement.service";
import {
    getAgreementStatusDisplayLabel,
    getAgreementTypeDisplayLabel,
} from "@clause-ai/constants";
import React, { useMemo, useState } from "react";
import AgreementDetailModal from "./AgreementDetailModal";
import {
    IconDocument,
    IconEye,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconSparkles,
    IconUploadCloud,
    InlineSpinner,
} from "./icons/CustomIcons";

interface AgreementsViewProps {
    agreements: AgreementSummaryItem[];
    loading: boolean;
    onRefresh: () => void;
    onOpenUploadModal: () => void;
    user: any;
}

export const AgreementsView: React.FC<AgreementsViewProps> = ({
    agreements,
    loading,
    onRefresh,
    onOpenUploadModal,
    user,
}) => {
    const [selectedAgreement, setSelectedAgreement] =
        useState<AgreementSummaryItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

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
        const s = (status || "PENDING").toUpperCase();
        const label = getAgreementStatusDisplayLabel(status);
        if (s === "SUCCESS") {
            return <span className="badge badge-success">{label}</span>;
        }
        if (s === "PROCESSING" || s === "RESTART" || s === "PENDING") {
            return <span className="badge badge-warning">{label}</span>;
        }
        if (s === "FAILED") {
            return <span className="badge badge-error">{label}</span>;
        }
        return <span className="badge badge-info">{label}</span>;
    };

    const filteredAgreements = useMemo(() => {
        return agreements.filter((item) => {
            const typeLabel = getAgreementTypeDisplayLabel(item.type);
            const titleMatch =
                (item.title || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (item.type || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

            const currentStatus = (item.status || "PENDING").toUpperCase();
            if (statusFilter === "ALL") return titleMatch;
            if (statusFilter === "SUCCESS")
                return titleMatch && currentStatus === "SUCCESS";
            if (statusFilter === "PROCESSING")
                return (
                    titleMatch &&
                    (currentStatus === "PROCESSING" ||
                        currentStatus === "RESTART" ||
                        currentStatus === "PENDING")
                );
            if (statusFilter === "FAILED")
                return titleMatch && currentStatus === "FAILED";
            return titleMatch;
        });
    }, [agreements, searchQuery, statusFilter]);

    const handleOpenDetail = (agreement: AgreementSummaryItem) => {
        setSelectedAgreement(agreement);
        setIsDetailOpen(true);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Top Header */}
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
                            Agreements
                        </h1>
                        <span
                            className="badge badge-neutral"
                            style={{ fontWeight: 600 }}
                        >
                            {agreements.length} Total
                        </span>
                    </div>
                    <p
                        style={{
                            fontSize: "0.88rem",
                            color: "#64748B",
                            marginTop: "4px",
                        }}
                    >
                        Auto-created agreements, extracted clauses, and AI risk
                        scoring.
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
                        <span>Upload Agreement PDF</span>
                    </button>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            {agreements.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* Search Box */}
                    <div
                        style={{
                            position: "relative",
                            maxWidth: "360px",
                            width: "100%",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search by title or type..."
                            className="input-field"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                paddingLeft: "36px",
                                fontSize: "0.85rem",
                                height: "38px",
                                borderRadius: "9999px",
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94A3B8",
                                display: "flex",
                            }}
                        >
                            <IconSearch size={16} />
                        </span>
                    </div>

                    {/* Status Tabs */}
                    <div
                        style={{
                            display: "flex",
                            gap: "4px",
                            background: "#F1F5F9",
                            padding: "4px",
                            borderRadius: "9999px",
                        }}
                    >
                        {(
                            ["ALL", "SUCCESS", "PROCESSING", "FAILED"] as const
                        ).map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`btn btn-sm ${statusFilter === st ? "btn-primary" : "btn-ghost"}`}
                                style={{
                                    padding: "4px 12px",
                                    fontSize: "0.74rem",
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                }}
                            >
                                {st === "ALL"
                                    ? "All"
                                    : st === "SUCCESS"
                                      ? "Completed"
                                      : st === "PROCESSING"
                                        ? "Processing"
                                        : "Failed"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {agreements.length === 0 && !loading ? (
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
                        <IconSparkles size={26} />
                    </div>

                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            marginBottom: "8px",
                            color: "#0F172A",
                        }}
                    >
                        No Agreements Available
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
                        Agreements are automatically generated whenever a PDF
                        file is uploaded and processed through the vector
                        engine.
                    </p>

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={onOpenUploadModal}
                    >
                        <IconUploadCloud size={18} /> Upload PDF to Create
                        Agreement
                    </button>
                </div>
            ) : filteredAgreements.length === 0 && !loading ? (
                <div
                    className="bento-card"
                    style={{
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#64748B",
                        fontSize: "0.9rem",
                    }}
                >
                    No agreements matched your search or status filter.
                </div>
            ) : (
                <>
                    {/* Desktop & iPad Technical Data Table */}
                    <div className="table-container mobile-hide">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "38%" }}>
                                        Agreement Title
                                    </th>
                                    <th style={{ width: "20%" }}>
                                        Contract Type
                                    </th>
                                    <th style={{ width: "16%" }}>Status</th>
                                    <th style={{ width: "16%" }}>Created At</th>
                                    <th
                                        style={{
                                            width: "10%",
                                            textAlign: "right",
                                        }}
                                    >
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAgreements.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleOpenDetail(item)}
                                        style={{ cursor: "pointer" }}
                                    >
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
                                                        background: "#F8FAFC",
                                                        border: "1px solid var(--border-medium)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        color: "#4F46E5",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <IconDocument size={18} />
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            color: "#0F172A",
                                                        }}
                                                    >
                                                        {item.title ||
                                                            "Untitled Agreement"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className="badge badge-neutral"
                                                style={{ fontSize: "0.75rem" }}
                                            >
                                                {getAgreementTypeDisplayLabel(
                                                    item.type,
                                                )}
                                            </span>
                                        </td>

                                        <td>{getStatusBadge(item.status)}</td>

                                        <td
                                            style={{
                                                fontSize: "0.82rem",
                                                color: "#64748B",
                                            }}
                                        >
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDetail(item);
                                                }}
                                                style={{ padding: "5px 10px" }}
                                            >
                                                <IconEye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div
                        className="mobile-show-block"
                        style={{ display: "none" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}
                        >
                            {filteredAgreements.map((item) => (
                                <div
                                    key={item.id}
                                    className="bento-card"
                                    onClick={() => handleOpenDetail(item)}
                                    style={{
                                        padding: "16px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                fontSize: "0.95rem",
                                                color: "#0F172A",
                                            }}
                                        >
                                            {item.title || "Untitled Agreement"}
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        <span
                                            className="badge badge-neutral"
                                            style={{ fontSize: "0.72rem" }}
                                        >
                                            {getAgreementTypeDisplayLabel(
                                                item.type,
                                            )}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#94A3B8",
                                            }}
                                        >
                                            {formatDate(item.createdAt)}
                                        </span>
                                    </div>

                                    <button
                                        className="btn btn-secondary btn-sm"
                                        style={{
                                            width: "100%",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <IconEye size={14} /> Open Agreement
                                        Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            <AgreementDetailModal
                agreement={selectedAgreement}
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedAgreement(null);
                    onRefresh();
                }}
                user={user}
            />
        </div>
    );
};

export default AgreementsView;
