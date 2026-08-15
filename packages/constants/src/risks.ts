export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevelType = (typeof RISK_LEVELS)[number];

// === Display Labels ===
export const RISK_LEVEL_DISPLAY_LABELS: Record<RiskLevelType, string> = {
    LOW: "Low Risk",
    MEDIUM: "Medium Risk",
    HIGH: "High Risk",
    CRITICAL: "Critical Risk",
};

// === Helper Functions ===
export function getRiskLevelDisplayLabel(level?: string | null): string {
    if (!level) return "Low Risk";
    return RISK_LEVEL_DISPLAY_LABELS[level as RiskLevelType] || level;
}
