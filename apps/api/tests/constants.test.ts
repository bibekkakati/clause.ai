import {
    AGREEMENT_DEPOSIT_TYPE_DISPLAY_LABELS,
    AGREEMENT_PARTY_ROLE_DISPLAY_LABELS,
    AGREEMENT_STATUS,
    AGREEMENT_STATUS_DISPLAY_LABELS,
    AGREEMENT_TYPE_DISPLAY_LABELS,
    AGREEMENT_TYPES,
    CHAT_MESSAGE_ROLE_DISPLAY_LABELS,
    FILE_STATUS_DISPLAY_LABELS,
    getAgreementStatusDisplayLabel,
    getAgreementTypeDisplayLabel,
    getChatMessageRoleDisplayLabel,
    getClauseTypeDisplayLabel,
    getDepositTypeDisplayLabel,
    getFileStatusDisplayLabel,
    getPartyRoleDisplayLabel,
    getRiskLevelDisplayLabel,
    RISK_LEVEL_DISPLAY_LABELS,
    RISK_LEVELS,
    SECTION_CLAUSE_TYPE_DISPLAY_LABELS,
    SECTION_CLAUSE_TYPES,
} from "@clause-ai/constants";
import { describe, expect, it } from "vitest";

describe("Shared Constants & Display Labels", () => {
    it("should export agreement types and display labels", () => {
        expect(AGREEMENT_TYPES).toContain("HOUSE_RENTAL");
        expect(getAgreementTypeDisplayLabel("HOUSE_RENTAL")).toBe(
            "House Rental Agreement",
        );
        expect(getAgreementTypeDisplayLabel(null)).toBe("Document");
        expect(AGREEMENT_TYPE_DISPLAY_LABELS.OFFICE_RENTAL).toBe(
            "Office Rental Agreement",
        );
    });

    it("should export agreement status and display labels", () => {
        expect(AGREEMENT_STATUS).toContain("SUCCESS");
        expect(getAgreementStatusDisplayLabel("SUCCESS")).toBe("Success");
        expect(getAgreementStatusDisplayLabel(null)).toBe("Pending");
        expect(AGREEMENT_STATUS_DISPLAY_LABELS.PROCESSING).toBe("Processing");
    });

    it("should export party roles and deposit types display labels", () => {
        expect(getPartyRoleDisplayLabel("LANDLORD")).toBe("Landlord");
        expect(getPartyRoleDisplayLabel("TENANT")).toBe("Tenant");
        expect(getPartyRoleDisplayLabel(null)).toBe("Other");

        expect(getDepositTypeDisplayLabel("SECURITY_DEPOSIT")).toBe(
            "Security Deposit",
        );
        expect(getDepositTypeDisplayLabel("ADVANCE_RENT")).toBe("Advance Rent");
        expect(getDepositTypeDisplayLabel(null)).toBe("Deposit");
        expect(AGREEMENT_PARTY_ROLE_DISPLAY_LABELS.LANDLORD).toBe("Landlord");
        expect(AGREEMENT_DEPOSIT_TYPE_DISPLAY_LABELS.SECURITY_DEPOSIT).toBe(
            "Security Deposit",
        );
    });

    it("should export section clause types and display labels", () => {
        expect(SECTION_CLAUSE_TYPES).toContain("RENT_PAYMENT");
        expect(getClauseTypeDisplayLabel("RENT_PAYMENT")).toBe("Rent Payment");
        expect(getClauseTypeDisplayLabel("NOTICE_PERIOD")).toBe("Notice Period");
        expect(getClauseTypeDisplayLabel(null)).toBe("General");
        expect(SECTION_CLAUSE_TYPE_DISPLAY_LABELS.EVICTION).toBe("Eviction");
    });

    it("should export risk levels and display labels", () => {
        expect(RISK_LEVELS).toContain("CRITICAL");
        expect(getRiskLevelDisplayLabel("CRITICAL")).toBe("Critical Risk");
        expect(getRiskLevelDisplayLabel("HIGH")).toBe("High Risk");
        expect(getRiskLevelDisplayLabel("MEDIUM")).toBe("Medium Risk");
        expect(getRiskLevelDisplayLabel("LOW")).toBe("Low Risk");
        expect(getRiskLevelDisplayLabel(null)).toBe("Low Risk");
        expect(RISK_LEVEL_DISPLAY_LABELS.CRITICAL).toBe("Critical Risk");
    });

    it("should export file and chat display labels", () => {
        expect(getFileStatusDisplayLabel("UPLOADED")).toBe("Uploaded");
        expect(getFileStatusDisplayLabel(null)).toBe("Pending");
        expect(FILE_STATUS_DISPLAY_LABELS.PENDING).toBe("Pending");

        expect(getChatMessageRoleDisplayLabel("assistant")).toBe("Clause AI");
        expect(getChatMessageRoleDisplayLabel("user")).toBe("You");
        expect(CHAT_MESSAGE_ROLE_DISPLAY_LABELS.system).toBe("System");
    });
});
