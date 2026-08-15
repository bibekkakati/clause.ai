import api, { ApiResponse } from "@/lib/api.client";

export interface RequestOtpResponse {
    message: string;
    expiryInMins: number;
}

export interface VerifyOtpResponse {
    message: string;
    enableOnboarding: boolean;
}

/**
 * Request a one-time password (OTP) sent to the provided email.
 */
export const requestOtp = async (
    email: string,
): Promise<ApiResponse<RequestOtpResponse>> => {
    return api.post<RequestOtpResponse>("/api/auth/otp/request", { email });
};

/**
 * Verify OTP and authenticate.
 * Automatically saves the received auth token via the api.client interceptor.
 */
export const verifyOtp = async (
    email: string,
    otp: string,
): Promise<ApiResponse<VerifyOtpResponse>> => {
    return api.post<VerifyOtpResponse>("/api/auth/otp/verify", { email, otp });
};

/**
 * Logout the authenticated user
 */
export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
    return api.post<{ message: string }>("/api/auth/logout");
};
