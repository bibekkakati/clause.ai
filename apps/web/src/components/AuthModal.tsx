import { authService } from "@/services";
import React, { useState } from "react";
import BrandLogo from "./BrandLogo";
import {
    IconAlertTriangle,
    IconArrowRight,
    IconCheck,
    IconClose,
    IconMail,
    IconShieldCheck,
    InlineSpinner,
} from "./icons/CustomIcons";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);
        setMessage(null);

        const res = await authService.requestOtp(email.trim());
        setLoading(false);

        if (res.success) {
            setStep("OTP");
            setMessage(
                res.data?.message || "Verification code sent to your email.",
            );
        } else {
            setError(
                res.error ||
                    "Failed to send verification code. Please check your email.",
            );
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) return;

        setLoading(true);
        setError(null);

        const res = await authService.verifyOtp(email.trim(), otp.trim());
        setLoading(false);

        if (res.success) {
            setMessage("Authentication verified successfully.");
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 500);
        } else {
            setError(res.error || "Invalid or expired OTP. Please try again.");
        }
    };

    const resetForm = () => {
        setStep("EMAIL");
        setEmail("");
        setOtp("");
        setError(null);
        setMessage(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "420px" }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <BrandLogo size="sm" />
                    </div>

                    <button
                        onClick={handleClose}
                        className="btn btn-ghost btn-sm"
                        aria-label="Close"
                        style={{ padding: "6px" }}
                    >
                        <IconClose size={16} />
                    </button>
                </div>

                {/* Modal Title & Info */}
                <div style={{ marginBottom: "24px" }}>
                    <h2
                        style={{
                            fontSize: "1.35rem",
                            fontWeight: 700,
                            marginBottom: "6px",
                            color: "#0F172A",
                        }}
                    >
                        {step === "EMAIL"
                            ? "Sign In or Sign Up"
                            : "Enter Verification Code"}
                    </h2>
                    <p
                        style={{
                            fontSize: "0.88rem",
                            color: "#64748B",
                            lineHeight: 1.5,
                        }}
                    >
                        {step === "EMAIL"
                            ? "Enter your email to receive a secure one-time password (OTP)."
                            : `We sent a 6-digit verification code to ${email}`}
                    </p>
                </div>

                {/* Feedback Alerts */}
                {error && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "var(--pastel-red-bg)",
                            border: "1px solid var(--pastel-red-border)",
                            color: "var(--pastel-red-text)",
                            fontSize: "0.82rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "18px",
                        }}
                    >
                        <IconAlertTriangle size={15} />
                        <span>{error}</span>
                    </div>
                )}

                {message && !error && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "var(--pastel-green-bg)",
                            border: "1px solid var(--pastel-green-border)",
                            color: "var(--pastel-green-text)",
                            fontSize: "0.82rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "18px",
                        }}
                    >
                        <IconCheck size={15} />
                        <span>{message}</span>
                    </div>
                )}

                {/* Form Content */}
                {step === "EMAIL" ? (
                    <form
                        onSubmit={handleRequestOtp}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div>
                            <label
                                htmlFor="auth-email-input"
                                style={{
                                    display: "block",
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "6px",
                                }}
                            >
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    id="auth-email-input"
                                    type="email"
                                    placeholder="name@company.com"
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    autoFocus
                                    style={{ paddingLeft: "38px" }}
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94A3B8",
                                        display: "flex",
                                    }}
                                >
                                    <IconMail size={16} />
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !email.trim()}
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                padding: "12px 18px",
                                marginTop: "6px",
                            }}
                        >
                            {loading ? (
                                <>
                                    <InlineSpinner size={15} />
                                    <span>Sending code...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continue with Email</span>
                                    <IconArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form
                        onSubmit={handleVerifyOtp}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        <div>
                            <label
                                htmlFor="auth-otp-input"
                                style={{
                                    display: "block",
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "6px",
                                }}
                            >
                                6-Digit Verification Code
                            </label>
                            <input
                                id="auth-otp-input"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                className="input-field"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value.replace(/\D/g, ""))
                                }
                                disabled={loading}
                                required
                                autoFocus
                                style={{
                                    textAlign: "center",
                                    fontSize: "1.3rem",
                                    letterSpacing: "0.3em",
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: 700,
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || otp.length < 6}
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                padding: "12px 18px",
                                marginTop: "6px",
                            }}
                        >
                            {loading ? (
                                <>
                                    <InlineSpinner size={15} />
                                    <span>Verifying code...</span>
                                </>
                            ) : (
                                <>
                                    <span>Verify & Sign In</span>
                                    <IconArrowRight size={15} />
                                </>
                            )}
                        </button>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "6px",
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setStep("EMAIL")}
                                disabled={loading}
                                style={{ fontSize: "0.8rem" }}
                            >
                                Change Email
                            </button>

                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={handleRequestOtp}
                                disabled={loading}
                                style={{ fontSize: "0.8rem", color: "#4F46E5" }}
                            >
                                Resend Code
                            </button>
                        </div>
                    </form>
                )}

                {/* Security Note Footer */}
                <div
                    style={{
                        marginTop: "24px",
                        paddingTop: "16px",
                        borderTop: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "0.75rem",
                        color: "#94A3B8",
                    }}
                >
                    <IconShieldCheck size={14} color="#10B981" />
                    <span>Encrypted passwordless authentication</span>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
