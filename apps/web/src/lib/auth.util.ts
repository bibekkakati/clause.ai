export const TOKEN_STORAGE_KEY = "authToken";

/**
 * Helper to get the current authentication token
 */
export const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Helper to set or update the authentication token
 */
export const setAuthToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

/**
 * Helper to clear authentication state (logout)
 */
export const clearAuth = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/**
 * Initialize global event listeners for auth state changes.
 * Handles cross-tab synchronization and unauthorized events.
 * 
 * @param onUnauthorized Callback triggered when token is cleared or unauthorized
 * @param onAuthRestored Callback triggered when a new token is set in another tab
 * @returns Cleanup function to remove listeners
 */
export const initAuthListeners = (
    onUnauthorized: () => void,
    onAuthRestored: () => void
) => {
    if (typeof window === "undefined") return () => {};

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === TOKEN_STORAGE_KEY) {
            if (!e.newValue) {
                // Token removed in another tab (logout)
                onUnauthorized();
            } else {
                // Token updated/added in another tab (login/refresh)
                onAuthRestored();
            }
        }
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    window.addEventListener("storage", handleStorageChange);

    return () => {
        window.removeEventListener("auth:unauthorized", onUnauthorized);
        window.removeEventListener("storage", handleStorageChange);
    };
};
