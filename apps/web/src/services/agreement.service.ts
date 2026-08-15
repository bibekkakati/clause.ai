import api, { ApiResponse } from "@/lib/api.client";

export interface AgreementSummaryItem {
    id: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

export interface GetUserAgreementsResponse {
    agreements: AgreementSummaryItem[];
}

export interface AgreementDetailsResponse {
    chatId: string;
    agreement: Record<string, any>;
    risks: any[];
}

export interface ProcessAgreementResponse {
    message: string;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
}

export interface SendAgreementQueryResponse {
    queryId: string;
    userMessage: ChatMessage;
}

export interface GetQueryResultResponse {
    status: "SUCCESS" | "PROCESSING" | "FAILED";
    message?: ChatMessage;
    error?: string;
}

export interface GetChatMessagesResponse {
    messages: ChatMessage[];
    nextCursor: string | null;
}

/**
 * Fetch all agreements belonging to the authenticated user
 */
export const getUserAgreements = async (): Promise<
    ApiResponse<GetUserAgreementsResponse>
> => {
    return api.get<GetUserAgreementsResponse>("/api/agreement/all");
};

/**
 * Fetch agreement details and associated risk analysis by agreement ID
 */
export const getAgreementDetails = async (
    id: string,
): Promise<ApiResponse<AgreementDetailsResponse>> => {
    return api.get<AgreementDetailsResponse>("/api/agreement", {
        params: { id },
    });
};

/**
 * Force trigger analysis / processing workflow for an agreement
 */
export const processAgreement = async (
    id: string,
): Promise<ApiResponse<ProcessAgreementResponse>> => {
    return api.post<ProcessAgreementResponse>("/api/agreement/process", { id });
};

/**
 * Send a chat query / message for an agreement (Asynchronous)
 */
export const sendAgreementQuery = async (params: {
    agreementId: string;
    message: string;
    chatId: string;
}): Promise<ApiResponse<SendAgreementQueryResponse>> => {
    return api.post<SendAgreementQueryResponse>("/api/agreement/query", params);
};

/**
 * Poll the status and response of an asynchronous agreement query
 */
export const getQueryResult = async (
    queryId: string,
): Promise<ApiResponse<GetQueryResultResponse>> => {
    return api.get<GetQueryResultResponse>("/api/agreement/query/result", {
        params: { queryId },
    });
};

/**
 * Fetch chat messages for an agreement using keyset pagination
 */
export const getChatMessages = async (params: {
    chatId: string;
    agreementId: string;
    limit?: number;
    cursor?: string;
}): Promise<ApiResponse<GetChatMessagesResponse>> => {
    return api.get<GetChatMessagesResponse>("/api/agreement/chat/messages", {
        params,
    });
};
