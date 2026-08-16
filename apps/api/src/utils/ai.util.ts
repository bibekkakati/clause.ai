import { AI_MODELS } from "@/config/ai.config";

const ModelCooldownState = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export const getAvailableModels = () => {
    const now = Date.now();
    const available = AI_MODELS.filter(
        (m) => (ModelCooldownState.get(m) ?? 0) <= now,
    );

    // fallback: if all are cooling down, use the full list anyway
    return available.length > 0 ? available : AI_MODELS;
};

export const markModelRateLimited = (
    retryAfter: number,
    model: (typeof AI_MODELS)[number] | null,
) => {
    if (!model) return;
    ModelCooldownState.set(model, Date.now() + (retryAfter || COOLDOWN_MS));
};

// Rule of thumb: ~4 chars/token for English text.
export const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
};
