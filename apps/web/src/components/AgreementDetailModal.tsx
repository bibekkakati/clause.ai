import { agreementService } from "@/services";
import {
    AgreementSummaryItem,
    ChatMessage,
} from "@/services/agreement.service";
import {
    getAgreementStatusDisplayLabel,
    getAgreementTypeDisplayLabel,
} from "@clause-ai/constants";
import React, { useEffect, useRef, useState } from "react";
import { AgreementChatTab } from "./AgreementChatTab";
import { AgreementDetailsTab } from "./AgreementDetailsTab";
import { AgreementRisksTab } from "./AgreementRisksTab";
import { BrandAvatar } from "./BrandLogo";
import {
    IconClose,
    IconDocument,
    IconMessageSquare,
    IconRefresh,
    IconShieldRisk,
    InlineSpinner,
} from "./icons/CustomIcons";
import { showToast } from "./Toast";

interface AgreementDetailModalProps {
    agreement: AgreementSummaryItem | null;
    isOpen: boolean;
    onClose: () => void;
    user?: any;
}

export const AgreementDetailModal: React.FC<AgreementDetailModalProps> = ({
    agreement,
    isOpen,
    onClose,
    user,
}) => {
    const [details, setDetails] = useState<any>(null);
    const [risks, setRisks] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [chatId, setChatId] = useState<string>("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [loadingChat, setLoadingChat] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState("");
    const [sendingQuery, setSendingQuery] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [aiStatusIndex, setAiStatusIndex] = useState(0);
    const [hiddenRestartIds, setHiddenRestartIds] = useState<
        Record<string, boolean>
    >({});
    const [activeTab, setActiveTab] = useState<"details" | "risks" | "chat">(
        "details",
    );
    const [collapsedRisks, setCollapsedRisks] = useState<
        Record<string, boolean>
    >({
        CRITICAL: false,
        HIGH: false,
        MEDIUM: false,
        LOW: false,
        OTHER: false,
    });

    const toggleRiskCollapse = (level: string) => {
        setCollapsedRisks((prev) => ({ ...prev, [level]: !prev[level] }));
    };

    const AI_STATUSES = [
        "Clause AI is reading...",
        "Clause AI is reasoning...",
        "Clause AI is articulating...",
        "Clause AI is typing...",
    ];

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const aiStatusTimerRef = useRef<NodeJS.Timeout | null>(null);
    const chatBottomRef = useRef<HTMLDivElement | null>(null);
    const chatScrollRef = useRef<HTMLDivElement | null>(null);
    const isFetchingOlderRef = useRef(false);

    // Clear polling and status timers on unmount or modal close
    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (aiStatusTimerRef.current) {
            clearInterval(aiStatusTimerRef.current);
            aiStatusTimerRef.current = null;
        }
        setIsAiThinking(false);
    };

    useEffect(() => {
        if (isOpen && agreement?.id) {
            loadAgreementDetails(agreement.id);
            setActiveTab("details");
        } else {
            setDetails(null);
            setRisks([]);
            setChatMessages([]);
            setNextCursor(null);
            setChatId("");
            setSendingQuery(false);
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [isOpen, agreement]);

    // Load chat messages when switching to chat tab if chatId exists
    useEffect(() => {
        if (isOpen && activeTab === "chat" && chatId && agreement?.id) {
            if (chatMessages.length === 0 && !nextCursor) {
                loadChatMessages(chatId, agreement.id);
            }
        }
    }, [activeTab, chatId, isOpen, agreement]);

    // Auto scroll chat to bottom
    useEffect(() => {
        if (activeTab === "chat") {
            chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, sendingQuery, isAiThinking, aiStatusIndex, activeTab]);

    const loadAgreementDetails = async (id: string) => {
        setLoadingDetails(true);
        const res = await agreementService.getAgreementDetails(id);
        setLoadingDetails(false);

        if (res.success && res.data) {
            setDetails(res.data.agreement || null);
            setRisks(res.data.risks || []);
            if (res.data.chatId) {
                setChatId(res.data.chatId);
            }
        }
    };

    const loadChatMessages = async (
        chatIdToUse: string,
        agreementIdToUse: string,
        cursor?: string,
    ) => {
        if (!chatIdToUse || !agreementIdToUse) return;

        const chatContainer = chatScrollRef.current;
        const prevScrollHeight = chatContainer?.scrollHeight || 0;

        if (cursor) {
            setLoadingOlder(true);
            isFetchingOlderRef.current = true;
        } else {
            setLoadingChat(true);
        }

        const res = await agreementService.getChatMessages({
            chatId: chatIdToUse,
            agreementId: agreementIdToUse,
            cursor,
        });

        if (cursor) setLoadingOlder(false);
        else setLoadingChat(false);

        if (res.success && res.data && res.data.messages) {
            const newMessages = res.data.messages;
            if (cursor) {
                setChatMessages((prev) => [...newMessages, ...prev]);
                if (chatContainer) {
                    setTimeout(() => {
                        const newScrollHeight = chatContainer.scrollHeight;
                        chatContainer.scrollTop =
                            newScrollHeight -
                            prevScrollHeight -
                            chatContainer.clientHeight * 0.4;
                        setTimeout(() => {
                            isFetchingOlderRef.current = false;
                        }, 100);
                    }, 0);
                } else {
                    isFetchingOlderRef.current = false;
                }
            } else {
                setChatMessages(res.data.messages);
            }
            setNextCursor(res.data.nextCursor || null);
        } else if (cursor) {
            isFetchingOlderRef.current = false;
        }
    };

    const handleSendQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !agreement?.id || !chatId) return;

        const userMessageText = chatInput.trim();
        setChatInput("");
        setSendingQuery(true);

        const pendingMsgId = "pending-" + Date.now();
        const pendingUserMessage: ChatMessage & { isSending?: boolean } = {
            id: pendingMsgId,
            chatId,
            role: "user",
            content: userMessageText,
            createdAt: new Date().toISOString(),
            isSending: true,
        };

        setChatMessages((prev) => [...prev, pendingUserMessage]);

        const queryRes = await agreementService.sendAgreementQuery({
            agreementId: agreement.id,
            message: userMessageText,
            chatId,
        });

        if (queryRes.success && queryRes.data) {
            const { userMessage, queryId } = queryRes.data;

            stopPolling();

            if (userMessage) {
                setChatMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === pendingMsgId ? userMessage : msg,
                    ),
                );
            } else {
                setChatMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === pendingMsgId
                            ? { ...msg, isSending: false }
                            : msg,
                    ),
                );
            }

            setIsAiThinking(true);
            setAiStatusIndex(0);

            aiStatusTimerRef.current = setInterval(() => {
                setAiStatusIndex((prev) => (prev + 1) % AI_STATUSES.length);
            }, 1800);

            let attempts = 0;
            pollIntervalRef.current = setInterval(async () => {
                attempts++;
                const pollRes = await agreementService.getQueryResult(queryId);
                const data = pollRes.data;
                const statusCode =
                    pollRes.status || (pollRes.success ? 200 : 500);
                const is2xx = statusCode >= 200 && statusCode < 300;

                if (
                    is2xx &&
                    pollRes.success &&
                    data &&
                    data.status === "SUCCESS"
                ) {
                    stopPolling();
                    setSendingQuery(false);
                    if (data.message) {
                        const assistantMsg = data.message;
                        setChatMessages((prev) => [...prev, assistantMsg]);
                    }
                } else if (
                    is2xx &&
                    pollRes.success &&
                    data &&
                    data.status === "PROCESSING"
                ) {
                    if (attempts > 24) {
                        stopPolling();
                        setSendingQuery(false);
                        const failureMsg: ChatMessage & { isError?: boolean } =
                            {
                                id: "error-" + Date.now(),
                                chatId,
                                role: "assistant",
                                content:
                                    "Could not generate any response within the time limit. Please try again.",
                                createdAt: new Date().toISOString(),
                                isError: true,
                            };
                        setChatMessages((prev) => [...prev, failureMsg]);
                    }
                } else {
                    stopPolling();
                    setSendingQuery(false);
                    const failureMsg: ChatMessage & { isError?: boolean } = {
                        id: "error-" + Date.now(),
                        chatId,
                        role: "assistant",
                        content:
                            "Could not generate response. The server reported an error.",
                        createdAt: new Date().toISOString(),
                        isError: true,
                    };
                    setChatMessages((prev) => [...prev, failureMsg]);
                }
            }, 3000);
        } else {
            setChatMessages((prev) =>
                prev.filter((msg) => msg.id !== pendingMsgId),
            );
            const failureMsg: ChatMessage & { isError?: boolean } = {
                id: "error-" + Date.now(),
                chatId,
                role: "assistant",
                content:
                    "Could not send query to the vector pipeline. Please check connection.",
                createdAt: new Date().toISOString(),
                isError: true,
            };
            setChatMessages((prev) => [...prev, failureMsg]);
            setSendingQuery(false);
        }
    };

    if (!isOpen || !agreement) return null;

    const currentAgreement = details || agreement;
    const metadata = details?.metadata || {};
    const property = details?.property || null;
    const payments = details?.payments || null;
    const parties = details?.parties || [];
    const summaryPoints = details?.summary || [];

    const agreementStatusUpper = (currentAgreement?.status || "").toUpperCase();
    const isProcessingOrFailed =
        agreementStatusUpper === "PROCESSING" ||
        agreementStatusUpper === "FAILED";
    const updatedAtStr =
        currentAgreement?.updatedAt || currentAgreement?.createdAt;
    const updatedTime = updatedAtStr ? new Date(updatedAtStr).getTime() : NaN;
    const isMoreThan5Mins =
        !isNaN(updatedTime) && Date.now() - updatedTime > 5 * 60 * 1000;

    const targetAgreementId = currentAgreement?.id;
    const showRestartButton =
        isProcessingOrFailed &&
        isMoreThan5Mins &&
        targetAgreementId &&
        !hiddenRestartIds[targetAgreementId];

    const handleRestartProcess = async () => {
        if (!targetAgreementId) return;
        setHiddenRestartIds((prev) => ({ ...prev, [targetAgreementId]: true }));
        agreementService.processAgreement(targetAgreementId);
        showToast(
            "Clause AI is processing your document. Please check after few minutes.",
            "info",
        );
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Slide-over Container (Responsive: 1100px desktop, 90vw iPad, 100vw mobile) */}
            <div
                className="detail-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "calc(100vw - 250px)",
                    maxWidth: "1150px",
                    background: "var(--bg-card)",
                    borderLeft: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-modal)",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 110,
                    animation: "fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Modal Top Header */}
                <div
                    style={{
                        padding: "16px 24px",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: "var(--bg-sidebar)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            overflow: "hidden",
                        }}
                    >
                        <BrandAvatar size={28} />
                        <div style={{ overflow: "hidden" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        letterSpacing: "-0.02em",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    title={
                                        currentAgreement.title ||
                                        "Agreement Details"
                                    }
                                >
                                    {currentAgreement.title ||
                                        "Agreement Details"}
                                </h2>
                                <span className="badge badge-neutral mobile-hide">
                                    {getAgreementTypeDisplayLabel(
                                        currentAgreement.type,
                                    )}
                                </span>
                            </div>
                            {currentAgreement.status !== "SUCCESS" ? (
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-secondary)",
                                        marginTop: "2px",
                                    }}
                                >
                                    Status:{" "}
                                    <strong
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {getAgreementStatusDisplayLabel(
                                            currentAgreement.status,
                                        )}
                                    </strong>
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        {showRestartButton && (
                            <button
                                className="btn btn-sm"
                                onClick={handleRestartProcess}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "0.78rem",
                                    background: "var(--pastel-yellow-bg)",
                                    color: "var(--pastel-yellow-text)",
                                    border: "1px solid var(--pastel-yellow-border)",
                                }}
                            >
                                <IconRefresh size={13} />
                                Restart Process
                            </button>
                        )}

                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={onClose}
                            style={{
                                padding: "6px",
                                color: "var(--text-muted)",
                            }}
                            aria-label="Close dialog"
                        >
                            <IconClose size={18} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        padding: "8px 24px",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: "var(--bg-secondary)",
                        overflowX: "auto",
                    }}
                >
                    <button
                        className={`btn btn-sm ${activeTab === "details" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setActiveTab("details")}
                        style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                        <IconDocument size={14} /> Agreement Details & Summary
                    </button>

                    <button
                        className={`btn btn-sm ${activeTab === "risks" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setActiveTab("risks")}
                        style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                        <IconShieldRisk size={14} /> Identified Risks (
                        {risks.length})
                    </button>

                    <button
                        className={`btn btn-sm ${activeTab === "chat" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setActiveTab("chat")}
                        style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                        <IconMessageSquare size={14} /> Ask Questions
                    </button>
                </div>

                {/* Modal Scrollable Content Body */}
                <div
                    style={{
                        flex: 1,
                        overflowY: activeTab === "chat" ? "hidden" : "auto",
                        padding: activeTab === "chat" ? "16px 24px" : "24px",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >
                    {loadingDetails ? (
                        <div style={{ textAlign: "center", padding: "80px 0" }}>
                            <InlineSpinner size={24} />
                            <p
                                style={{
                                    marginTop: "12px",
                                    fontSize: "0.88rem",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Parsing contract metadata and risk factors...
                            </p>
                        </div>
                    ) : activeTab === "details" ? (
                        <AgreementDetailsTab
                            metadata={metadata}
                            parties={parties}
                            property={property}
                            payments={payments}
                            summaryPoints={summaryPoints}
                        />
                    ) : activeTab === "risks" ? (
                        <AgreementRisksTab
                            risks={risks}
                            collapsedRisks={collapsedRisks}
                            toggleRiskCollapse={toggleRiskCollapse}
                        />
                    ) : (
                        <AgreementChatTab
                            chatMessages={chatMessages}
                            loadingChat={loadingChat}
                            loadingOlder={loadingOlder}
                            nextCursor={nextCursor}
                            chatInput={chatInput}
                            setChatInput={setChatInput}
                            sendingQuery={sendingQuery}
                            isAiThinking={isAiThinking}
                            aiStatusIndex={aiStatusIndex}
                            aiStatuses={AI_STATUSES}
                            user={user}
                            chatScrollRef={chatScrollRef}
                            chatBottomRef={chatBottomRef}
                            onLoadOlder={() =>
                                loadChatMessages(
                                    chatId,
                                    agreement.id,
                                    nextCursor || undefined,
                                )
                            }
                            onSendMessage={handleSendQuery}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgreementDetailModal;
