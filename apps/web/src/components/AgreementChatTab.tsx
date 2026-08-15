import React from "react";
import { ChatMessage } from "@/services/agreement.service";
import { IconSend, InlineSpinner } from "./icons/CustomIcons";

interface AgreementChatTabProps {
    chatMessages: ChatMessage[];
    loadingChat: boolean;
    loadingOlder: boolean;
    nextCursor: string | null;
    chatInput: string;
    setChatInput: (val: string) => void;
    sendingQuery: boolean;
    isAiThinking: boolean;
    aiStatusIndex: number;
    aiStatuses: string[];
    user?: any;
    chatScrollRef: React.RefObject<any>;
    chatBottomRef: React.RefObject<any>;
    onLoadOlder: () => void;
    onSendMessage: (e: React.FormEvent) => void;
}

export const AgreementChatTab: React.FC<AgreementChatTabProps> = ({
    chatMessages,
    loadingChat,
    loadingOlder,
    nextCursor,
    chatInput,
    setChatInput,
    sendingQuery,
    isAiThinking,
    aiStatusIndex,
    aiStatuses,
    user,
    chatScrollRef,
    chatBottomRef,
    onLoadOlder,
    onSendMessage,
}) => {
    const formatMessageDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const time = `${hours}:${minutes}`;

        if (isToday) {
            return `${time}, Today`;
        } else {
            const day = date.getDate().toString().padStart(2, "0");
            const month = date.toLocaleString("en-US", { month: "short" });
            return `${time}, ${day} ${month}`;
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}
        >
            <div
                ref={chatScrollRef}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    paddingBottom: "16px",
                    paddingRight: "10px",
                    minHeight: 0,
                }}
            >
                {loadingChat ? (
                    <div
                        style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            marginTop: "60px",
                        }}
                    >
                        <InlineSpinner size={20} />
                        <p style={{ marginTop: "8px" }}>
                            Loading chat message history...
                        </p>
                    </div>
                ) : chatMessages.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            marginTop: "60px",
                            padding: "0 20px",
                        }}
                    >
                        Ask any question about indemnity clauses, rent
                        escalation, notice periods, or fit-out terms in this
                        agreement.
                    </div>
                ) : (
                    <>
                        {nextCursor && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={onLoadOlder}
                                disabled={loadingOlder}
                                style={{
                                    alignSelf: "center",
                                    marginBottom: "12px",
                                }}
                            >
                                {loadingOlder
                                    ? "Loading..."
                                    : "Load older messages"}
                            </button>
                        )}

                        {chatMessages.map((msg, i) => {
                            const isUser = msg.role === "user";
                            const isSending = (msg as any).isSending;
                            const isError = (msg as any).isError;
                            const senderName = isUser ? "You" : "Clause AI";
                            const initial = isUser
                                ? user?.email
                                    ? user.email.charAt(0).toUpperCase()
                                    : "U"
                                : "C";

                            return (
                                <div
                                    key={msg.id || i}
                                    style={{
                                        alignSelf: isUser
                                            ? "flex-end"
                                            : "flex-start",
                                        maxWidth: "85%",
                                        display: "flex",
                                        gap: "10px",
                                        flexDirection: isUser
                                            ? "row-reverse"
                                            : "row",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "var(--radius-xs)",
                                            background: isUser
                                                ? "var(--primary)"
                                                : "var(--bg-secondary)",
                                            color: isUser
                                                ? "var(--primary-text)"
                                                : "var(--text-primary)",
                                            border: isUser
                                                ? "none"
                                                : "1px solid var(--border-subtle)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                            fontSize: "0.85rem",
                                            fontFamily: "var(--font-mono)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {initial}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: isUser
                                                ? "flex-end"
                                                : "flex-start",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "0.74rem",
                                                    color: "var(--text-secondary)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {senderName}
                                            </span>
                                            {isSending ? (
                                                <span
                                                    className="badge badge-warning"
                                                    style={{
                                                        fontSize: "0.62rem",
                                                        padding: "1px 5px",
                                                    }}
                                                >
                                                    Sending...
                                                </span>
                                            ) : isError ? (
                                                <span
                                                    className="badge badge-error"
                                                    style={{
                                                        fontSize: "0.62rem",
                                                        padding: "1px 5px",
                                                    }}
                                                >
                                                    Failed
                                                </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        fontSize: "0.65rem",
                                                        color: "var(--text-muted)",
                                                        fontFamily:
                                                            "var(--font-mono)",
                                                    }}
                                                >
                                                    {formatMessageDate(
                                                        msg.createdAt,
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            style={{
                                                padding: "10px 14px",
                                                borderRadius:
                                                    "var(--radius-sm)",
                                                background: isError
                                                    ? "var(--pastel-red-bg)"
                                                    : isSending
                                                      ? "var(--pastel-yellow-bg)"
                                                      : isUser
                                                        ? "var(--primary)"
                                                        : "var(--bg-secondary)",
                                                border: isError
                                                    ? "1px solid var(--pastel-red-border)"
                                                    : isSending
                                                      ? "1px solid var(--pastel-yellow-border)"
                                                      : isUser
                                                        ? "1px solid var(--primary)"
                                                        : "1px solid var(--border-subtle)",
                                                color: isError
                                                    ? "var(--pastel-red-text)"
                                                    : isSending
                                                      ? "var(--pastel-yellow-text)"
                                                      : isUser
                                                        ? "var(--primary-text)"
                                                        : "var(--text-primary)",
                                                fontSize: "0.85rem",
                                                lineHeight: 1.6,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {/* AI Thinking indicator */}
                {isAiThinking && (
                    <div
                        style={{
                            alignSelf: "flex-start",
                            maxWidth: "85%",
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <div
                            style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "var(--radius-xs)",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-subtle)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                fontFamily: "var(--font-mono)",
                                flexShrink: 0,
                            }}
                        >
                            C
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    marginBottom: "4px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.74rem",
                                        color: "var(--text-secondary)",
                                        fontWeight: 500,
                                    }}
                                >
                                    Clause AI
                                </span>
                            </div>

                            <div
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-subtle)",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.825rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    boxShadow:
                                        "0 1px 3px rgba(15, 23, 42, 0.04)",
                                }}
                            >
                                <InlineSpinner size={14} />
                                <span
                                    key={aiStatusIndex}
                                    className="ai-status-fade"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    {aiStatuses[aiStatusIndex]}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Toolbar */}
            <form
                onSubmit={onSendMessage}
                style={{
                    display: "flex",
                    gap: "8px",
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "14px",
                    background: "var(--bg-card)",
                }}
            >
                <input
                    type="text"
                    placeholder="Ask a question about this lease agreement..."
                    className="input-field"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={sendingQuery}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingQuery || !chatInput.trim()}
                    aria-label="Send Query"
                >
                    <IconSend size={15} />
                </button>
            </form>
        </div>
    );
};

export default AgreementChatTab;
