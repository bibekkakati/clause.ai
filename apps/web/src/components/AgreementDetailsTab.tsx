import React from "react";
import {
    IconBuilding,
    IconCalendar,
    IconCheck,
    IconCreditCard,
    IconDocument,
    IconMapPin,
    IconScale,
    IconUsers,
} from "./icons/CustomIcons";
import { getDepositTypeDisplayLabel } from "@clause-ai/constants";

interface AgreementDetailsTabProps {
    metadata: {
        effectiveDate?: string;
        expiryDate?: string;
        autoRenewal?: boolean;
        governingLaw?: string;
        [key: string]: any;
    };
    parties: Array<{
        name: string;
        role: string;
        address?: string;
        [key: string]: any;
    }>;
    property: {
        type?: string;
        size?: string;
        usageTerm?: string;
        address?: string;
        [key: string]: any;
    } | null;
    payments: {
        rentAmount?: number;
        currency?: string;
        rentCycle?: string;
        depositAmount?: number;
        depositType?: string;
        [key: string]: any;
    } | null;
    summaryPoints: string[];
}

export const AgreementDetailsTab: React.FC<AgreementDetailsTabProps> = ({
    metadata,
    parties,
    property,
    payments,
    summaryPoints,
}) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* 1. Key Metadata Banner */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <IconCalendar size={13} /> Effective Date
                    </div>
                    <div
                        style={{
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            marginTop: "4px",
                        }}
                    >
                        {metadata.effectiveDate || "N/A"}
                    </div>
                </div>

                <div>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <IconCalendar size={13} /> Expiry Date
                    </div>
                    <div
                        style={{
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            marginTop: "4px",
                        }}
                    >
                        {metadata.expiryDate || "N/A"}
                    </div>
                </div>

                <div>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <IconCheck size={13} /> Auto Renewal
                    </div>
                    <div
                        style={{
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            marginTop: "4px",
                        }}
                    >
                        {metadata.autoRenewal !== undefined
                            ? metadata.autoRenewal
                                ? "Yes"
                                : "No"
                            : "N/A"}
                    </div>
                </div>

                <div>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <IconScale size={13} /> Governing Jurisdiction
                    </div>
                    <div
                        style={{
                            fontSize: "0.92rem",
                            fontWeight: 600,
                            marginTop: "4px",
                        }}
                    >
                        {metadata.governingLaw || "N/A"}
                    </div>
                </div>
            </div>

            {/* 2. Parties Involved */}
            {parties.length > 0 && (
                <div>
                    <h3
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <IconUsers size={16} /> Parties Involved (
                        {parties.length})
                    </h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "12px",
                        }}
                    >
                        {parties.map((p, idx) => (
                            <div
                                key={idx}
                                className="bento-card"
                                style={{ padding: "14px" }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {p.name}
                                    </span>
                                    <span className="badge badge-info">
                                        {p.role}
                                    </span>
                                </div>
                                {p.address && (
                                    <div
                                        style={{
                                            fontSize: "0.78rem",
                                            color: "var(--text-secondary)",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "6px",
                                        }}
                                    >
                                        <IconMapPin
                                            size={13}
                                            style={{
                                                flexShrink: 0,
                                                marginTop: "2px",
                                            }}
                                        />
                                        <span>{p.address}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Property & Payments Financial Grid */}
            {(property || payments) && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {property && (
                        <div className="bento-card" style={{ padding: "16px" }}>
                            <h4
                                style={{
                                    fontSize: "0.92rem",
                                    fontWeight: 600,
                                    marginBottom: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <IconBuilding size={16} /> Property
                                Specifications
                            </h4>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    fontSize: "0.825rem",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <div>
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Type:
                                    </strong>{" "}
                                    {property.type || "N/A"}
                                </div>
                                <div>
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Size:
                                    </strong>{" "}
                                    {property.size || "N/A"}
                                </div>
                                <div>
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Usage:
                                    </strong>{" "}
                                    {property.usageTerm || "Commercial"}
                                </div>
                                <div>
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Address:
                                    </strong>{" "}
                                    {property.address || "N/A"}
                                </div>
                            </div>
                        </div>
                    )}

                    {payments && (
                        <div className="bento-card" style={{ padding: "16px" }}>
                            <h4
                                style={{
                                    fontSize: "0.92rem",
                                    fontWeight: 600,
                                    marginBottom: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <IconCreditCard size={16} /> Financial Terms
                            </h4>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    fontSize: "0.825rem",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <div>
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Rent Amount:
                                    </strong>{" "}
                                    <span
                                        style={{
                                            color: "var(--pastel-green-text)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {payments.currency || "INR"}{" "}
                                        {payments.rentAmount?.toLocaleString()}{" "}
                                        ({payments.rentCycle})
                                    </span>
                                </div>
                                <div>
                                    <strong
                                        style={{
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Deposit:
                                    </strong>{" "}
                                    <span>
                                        {payments.currency || "INR"}{" "}
                                        {payments.depositAmount?.toLocaleString()}{" "}
                                        (
                                        {getDepositTypeDisplayLabel(
                                            payments.depositType,
                                        )}
                                        )
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 4. Executive Summary */}
            {summaryPoints.length > 0 && (
                <div>
                    <h3
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <IconDocument size={16} /> Executive Summary Key Points
                    </h3>
                    <div
                        style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            padding: "16px 20px",
                        }}
                    >
                        <ul
                            style={{
                                paddingLeft: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                fontSize: "0.84rem",
                                color: "var(--text-secondary)",
                                lineHeight: 1.6,
                            }}
                        >
                            {summaryPoints.map((point: string, idx: number) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgreementDetailsTab;
