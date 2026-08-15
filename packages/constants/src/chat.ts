export const CHAT_MESSAGE_ROLES = ["user", "assistant", "system"] as const;
export type ChatMessageRole = (typeof CHAT_MESSAGE_ROLES)[number];

// === Display Labels ===
export const CHAT_MESSAGE_ROLE_DISPLAY_LABELS: Record<ChatMessageRole, string> =
    {
        user: "You",
        assistant: "Clause AI",
        system: "System",
    };

// === Helper Functions ===
export function getChatMessageRoleDisplayLabel(role?: string | null): string {
    if (!role) return "User";
    return CHAT_MESSAGE_ROLE_DISPLAY_LABELS[role as ChatMessageRole] || role;
}
