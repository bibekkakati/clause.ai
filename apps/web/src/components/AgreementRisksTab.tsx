import React from "react";
import {
    IconAlertTriangle,
    IconChevronDown,
    IconChevronRight,
    IconInfoCircle,
    IconShieldRisk,
} from "./icons/CustomIcons";

interface AgreementRisksTabProps {
    risks: any[];
    collapsedRisks: Record<string, boolean>;
    toggleRiskCollapse: (level: string) => void;
}

export const AgreementRisksTab: React.FC<AgreementRisksTabProps> = ({
    risks,
    collapsedRisks,
    toggleRiskCollapse,
}) => {
    const criticalRisks = risks.filter(
        (r) => (r.level || "").toUpperCase() === "CRITICAL",
    );
    const highRisks = risks.filter(
        (r) => (r.level || "").toUpperCase() === "HIGH",
    );
    const medRisks = risks.filter(
        (r) => (r.level || "").toUpperCase() === "MEDIUM",
    );
    const lowRisks = risks.filter(
        (r) => (r.level || "").toUpperCase() === "LOW",
    );
    const otherRisks = risks.filter((r) => {
        const lvl = (r.level || "").toUpperCase();
        return (
            lvl !== "CRITICAL" &&
            lvl !== "HIGH" &&
            lvl !== "MEDIUM" &&
            lvl !== "LOW"
        );
    });

    const renderRiskCard = (risk: any, idx: number) => {
        const level = (risk.level || "LOW").toUpperCase();
        const badgeClass =
            level === "CRITICAL"
                ? "badge-error"
                : level === "HIGH"
                  ? "badge-error"
                  : level === "MEDIUM"
                    ? "badge-warning"
                    : "badge-info";

        return (
            <div
                key={risk.id || idx}
                className="bento-card"
                style={{
                    padding: "16px 20px",
                    background: "var(--bg-card)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                        gap: "8px",
                    }}
                >
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "var(--text-primary)",
                        }}
                    >
                        Clause
                    </span>
                    <span className={`badge ${badgeClass}`}>
                        {level === "CRITICAL" || level === "HIGH" ? (
                            <IconShieldRisk size={12} />
                        ) : level === "MEDIUM" ? (
                            <IconAlertTriangle size={12} />
                        ) : (
                            <IconInfoCircle size={12} />
                        )}
                        {level} RISK
                    </span>
                </div>

                {risk.clause && (
                    <div
                        style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            padding: "10px 14px",
                            borderRadius: "var(--radius-xs)",
                            fontSize: "0.82rem",
                            fontFamily: "var(--font-mono)",
                            color: "var(--text-primary)",
                            marginBottom: "10px",
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        "{risk.clause}"
                    </div>
                )}

                {risk.reason && (
                    <p
                        style={{
                            fontSize: "0.84rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        <strong style={{ color: "var(--text-primary)" }}>
                            Impact Analysis:
                        </strong>{" "}
                        {risk.reason}
                    </p>
                )}
            </div>
        );
    };

    if (risks.length === 0) {
        return (
            <div
                style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    padding: "48px 24px",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "center",
                }}
            >
                No risk flags detected in this agreement document.
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Critical Risks */}
            {criticalRisks.length > 0 && (
                <div>
                    <div
                        onClick={() => toggleRiskCollapse("CRITICAL")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                            paddingBottom: "6px",
                            borderBottom: "1px solid var(--pastel-red-border)",
                            cursor: "pointer",
                        }}
                    >
                        {collapsedRisks["CRITICAL"] ? (
                            <IconChevronRight size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                        <IconShieldRisk
                            size={16}
                            color="var(--pastel-red-text)"
                        />
                        <h3
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--pastel-red-text)",
                            }}
                        >
                            Critical Risk Exposure ({criticalRisks.length})
                        </h3>
                    </div>
                    {!collapsedRisks["CRITICAL"] && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {criticalRisks.map((risk, idx) =>
                                renderRiskCard(risk, idx),
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* High Risks */}
            {highRisks.length > 0 && (
                <div>
                    <div
                        onClick={() => toggleRiskCollapse("HIGH")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                            paddingBottom: "6px",
                            borderBottom: "1px solid var(--pastel-red-border)",
                            cursor: "pointer",
                        }}
                    >
                        {collapsedRisks["HIGH"] ? (
                            <IconChevronRight size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                        <IconShieldRisk
                            size={16}
                            color="var(--pastel-red-text)"
                        />
                        <h3
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--pastel-red-text)",
                            }}
                        >
                            High Risk Exposure ({highRisks.length})
                        </h3>
                    </div>
                    {!collapsedRisks["HIGH"] && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {highRisks.map((risk, idx) =>
                                renderRiskCard(risk, idx),
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Medium Risks */}
            {medRisks.length > 0 && (
                <div>
                    <div
                        onClick={() => toggleRiskCollapse("MEDIUM")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                            paddingBottom: "6px",
                            borderBottom:
                                "1px solid var(--pastel-yellow-border)",
                            cursor: "pointer",
                        }}
                    >
                        {collapsedRisks["MEDIUM"] ? (
                            <IconChevronRight size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                        <IconAlertTriangle
                            size={16}
                            color="var(--pastel-yellow-text)"
                        />
                        <h3
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--pastel-yellow-text)",
                            }}
                        >
                            Medium Risk Factors ({medRisks.length})
                        </h3>
                    </div>
                    {!collapsedRisks["MEDIUM"] && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {medRisks.map((risk, idx) =>
                                renderRiskCard(risk, idx),
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Low Risks */}
            {lowRisks.length > 0 && (
                <div>
                    <div
                        onClick={() => toggleRiskCollapse("LOW")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                            paddingBottom: "6px",
                            borderBottom: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                        }}
                    >
                        {collapsedRisks["LOW"] ? (
                            <IconChevronRight size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                        <IconInfoCircle size={16} />
                        <h3
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                            }}
                        >
                            Low Risk Considerations ({lowRisks.length})
                        </h3>
                    </div>
                    {!collapsedRisks["LOW"] && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {lowRisks.map((risk, idx) =>
                                renderRiskCard(risk, idx),
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Other Risks */}
            {otherRisks.length > 0 && (
                <div>
                    <div
                        onClick={() => toggleRiskCollapse("OTHER")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                            paddingBottom: "6px",
                            borderBottom: "1px solid var(--border-subtle)",
                            cursor: "pointer",
                        }}
                    >
                        {collapsedRisks["OTHER"] ? (
                            <IconChevronRight size={16} />
                        ) : (
                            <IconChevronDown size={16} />
                        )}
                        <IconInfoCircle size={16} />
                        <h3
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                            }}
                        >
                            Other Factors ({otherRisks.length})
                        </h3>
                    </div>
                    {!collapsedRisks["OTHER"] && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                            }}
                        >
                            {otherRisks.map((risk, idx) =>
                                renderRiskCard(risk, idx),
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgreementRisksTab;
