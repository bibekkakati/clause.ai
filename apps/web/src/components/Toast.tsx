import React, { useEffect, useState } from "react";
import { IconAlertTriangle, IconCheck, IconClose, IconInfoCircle } from "./icons/CustomIcons";

export interface ToastMessage {
  id: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

export const showToast = (
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app-toast", { detail: { message, type } }),
    );
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) {
        const id = "toast-" + Date.now();
        const newToast: ToastMessage = {
          id,
          message: detail.message,
          type: detail.type || "info",
        };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4500);
      }
    };

    window.addEventListener("app-toast", handleToast);
    return () => window.removeEventListener("app-toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "380px",
        width: "calc(100vw - 40px)",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const isWarning = t.type === "warning";

        return (
          <div
            key={t.id}
            className="ai-status-fade"
            style={{
              pointerEvents: "auto",
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              border: `1px solid ${
                isError
                  ? "var(--pastel-red-border)"
                  : isSuccess
                  ? "var(--pastel-green-border)"
                  : isWarning
                  ? "var(--pastel-yellow-border)"
                  : "var(--border-medium)"
              }`,
              boxShadow: "var(--shadow-card)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-primary)",
              fontSize: "0.84rem",
              lineHeight: 1.4,
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {isSuccess ? (
                <span className="badge badge-success" style={{ padding: "4px" }}>
                  <IconCheck size={12} />
                </span>
              ) : isError ? (
                <span className="badge badge-error" style={{ padding: "4px" }}>
                  <IconClose size={12} />
                </span>
              ) : isWarning ? (
                <span className="badge badge-warning" style={{ padding: "4px" }}>
                  <IconAlertTriangle size={12} />
                </span>
              ) : (
                <span className="badge badge-info" style={{ padding: "4px" }}>
                  <IconInfoCircle size={12} />
                </span>
              )}
            </div>

            <span style={{ flex: 1, fontWeight: 500 }}>{t.message}</span>

            <button
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Dismiss notification"
            >
              <IconClose size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
