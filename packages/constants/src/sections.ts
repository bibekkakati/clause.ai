export const SECTION_CLAUSE_TYPES = [
    "GENERAL",
    "PARTIES",
    "TERM",
    "RENT_PAYMENT",
    "DEPOSIT",
    "MAINTENANCE",
    "REPAIRS",
    "TERMINATION",
    "NOTICE_PERIOD",
    "RESTRICTIONS",
    "UTILITIES",
    "INSURANCE",
    "EVICTION",
    "DISPUTE_RESOLUTION",
    "INDEMNIFICATION",
    "RENEWAL",
] as const;

export type SectionClauseType = (typeof SECTION_CLAUSE_TYPES)[number];

export const SECTION_CLAUSE_TYPE_DISPLAY_LABELS: Record<
    SectionClauseType,
    string
> = {
    GENERAL: "General",
    PARTIES: "Parties",
    TERM: "Term",
    RENT_PAYMENT: "Rent Payment",
    DEPOSIT: "Deposit",
    MAINTENANCE: "Maintenance",
    REPAIRS: "Repairs",
    TERMINATION: "Termination",
    NOTICE_PERIOD: "Notice Period",
    RESTRICTIONS: "Restrictions",
    UTILITIES: "Utilities",
    INSURANCE: "Insurance",
    EVICTION: "Eviction",
    DISPUTE_RESOLUTION: "Dispute Resolution",
    INDEMNIFICATION: "Indemnification",
    RENEWAL: "Renewal",
};

// === Helper Functions ===
export function getClauseTypeDisplayLabel(type?: string | null): string {
    if (!type) return "General";
    return (
        SECTION_CLAUSE_TYPE_DISPLAY_LABELS[type as SectionClauseType] || type
    );
}
