export const AGREEMENT_TYPES = [
    "HOUSE_RENTAL",
    "OFFICE_RENTAL",
    "SHORT_TERM_RENTAL",
    "SHOP_RENTAL",
    "OTHERS",
] as const;

export const AGREEMENT_STATUS = [
    "PENDING",
    "PROCESSING",
    "RESTART",
    "SUCCESS",
    "FAILED",
] as const;

export const AGREEMENT_PARTY_ROLES = ["LANDLORD", "TENANT", "OTHER"] as const;

export const AGREEMENT_DEPOSIT_TYPES = [
    "SECURITY_DEPOSIT",
    "ADVANCE_RENT",
    "UTILITY_FEE",
    "OTHER",
] as const;

export type AgreementType = (typeof AGREEMENT_TYPES)[number];
export type AgreementStatus = (typeof AGREEMENT_STATUS)[number];
export type AgreementPartyRole = (typeof AGREEMENT_PARTY_ROLES)[number];
export type AgreementDepositType = (typeof AGREEMENT_DEPOSIT_TYPES)[number];

// === Display Labels ===
export const AGREEMENT_TYPE_DISPLAY_LABELS: Record<AgreementType, string> = {
    HOUSE_RENTAL: "House Rental Agreement",
    OFFICE_RENTAL: "Office Rental Agreement",
    SHORT_TERM_RENTAL: "Short-Term Rental Agreement",
    SHOP_RENTAL: "Shop Rental Agreement",
    OTHERS: "Others",
};

export const AGREEMENT_STATUS_DISPLAY_LABELS: Record<AgreementStatus, string> =
    {
        PENDING: "Pending",
        PROCESSING: "Processing",
        RESTART: "Restart",
        SUCCESS: "Success",
        FAILED: "Failed",
    };

export const AGREEMENT_DEPOSIT_TYPE_DISPLAY_LABELS: Record<
    AgreementDepositType,
    string
> = {
    SECURITY_DEPOSIT: "Security Deposit",
    ADVANCE_RENT: "Advance Rent",
    UTILITY_FEE: "Utility Fee",
    OTHER: "Others",
};

export const AGREEMENT_PARTY_ROLE_DISPLAY_LABELS: Record<
    AgreementPartyRole,
    string
> = {
    LANDLORD: "Landlord",
    TENANT: "Tenant",
    OTHER: "Other",
};

// === Helper Functions ===
export function getAgreementTypeDisplayLabel(type?: string | null): string {
    if (!type) return "Document";
    return AGREEMENT_TYPE_DISPLAY_LABELS[type as AgreementType] || type;
}

export function getAgreementStatusDisplayLabel(status?: string | null): string {
    if (!status) return "Pending";
    return AGREEMENT_STATUS_DISPLAY_LABELS[status as AgreementStatus] || status;
}

export function getPartyRoleDisplayLabel(role?: string | null): string {
    if (!role) return "Other";
    return (
        AGREEMENT_PARTY_ROLE_DISPLAY_LABELS[role as AgreementPartyRole] || role
    );
}

export function getDepositTypeDisplayLabel(
    depositType?: string | null,
): string {
    if (!depositType) return "Deposit";
    return (
        AGREEMENT_DEPOSIT_TYPE_DISPLAY_LABELS[
            depositType as AgreementDepositType
        ] || depositType
    );
}
