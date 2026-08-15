import api, { ApiResponse } from "@/lib/api.client";

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface GetProfileResponse {
    user: UserProfile;
}

/**
 * Fetch current authenticated user profile
 */
export const getProfile = async (): Promise<
    ApiResponse<GetProfileResponse>
> => {
    return api.get<GetProfileResponse>("/api/user/me");
};
