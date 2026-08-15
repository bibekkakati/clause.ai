import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";

/**
 * Standard API Response envelope returned to callers.
 * Guarantees callers do not need try/catch blocks.
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
    status?: number;
}

// Default base URL fallback (uses Vite env var or empty string for proxying)
const BASE_URL =
    (typeof import.meta !== "undefined" &&
        (import.meta as any).env?.VITE_API_URL) ||
    "";

/**
 * Create base Axios instance
 */
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

import { getAuthToken, setAuthToken, clearAuth } from "./auth.util";

/**
 * Request interceptor to automatically inject Authorization token if available.
 */
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();

        if (token) {
            config.headers.setAuthorization(`Bearer ${token}`);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * Response interceptor to:
 * 1. Capture and update refreshed auth tokens from response headers (`x-access-token` / `authorization`)
 * 2. Automatically handle 401 Unauthorized by clearing auth and dispatching a logout event
 */
axiosInstance.interceptors.response.use(
    (response) => {
        // Capture new/refreshed access token from headers if present
        const newToken = response.headers["x-access-token"];

        if (newToken) {
            setAuthToken(newToken);
        }

        return response;
    },
    (error: AxiosError) => {
        // Handle 401 Unauthorized responses
        if (error.response?.status === 401) {
            clearAuth();

            // Dispatch global event for auth state changes if running in browser
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
            }
        }
        return Promise.reject(error);
    },
);

/**
 * Centralized request handler that safely executes HTTP requests
 * without throwing errors to the caller.
 */
export const request = async <T = any>(
    config: AxiosRequestConfig,
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> =
            await axiosInstance.request<T>(config);
        return {
            success: true,
            data: response.data,
            error: null,
            status: response.status,
        };
    } catch (err: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        let status: number | undefined;

        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError<any>;
            status = axiosError.response?.status;
            errorMessage =
                axiosError.response?.data?.error ||
                axiosError.response?.data?.message ||
                axiosError.message ||
                errorMessage;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        return {
            success: false,
            data: null,
            error: errorMessage,
            status,
        };
    }
};

/**
 * Convenient HTTP method shortcuts
 */
export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "GET", url }),

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "POST", url, data }),

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "PUT", url, data }),

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "PATCH", url, data }),

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        request<T>({ ...config, method: "DELETE", url }),
};

export default api;
