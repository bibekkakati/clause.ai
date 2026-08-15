// Rule of thumb: ~4 chars/token for English text.
export const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
};
