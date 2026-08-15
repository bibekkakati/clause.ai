import React from "react";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
    onClick?: () => void;
}

export const BrandAvatar: React.FC<{ size?: number; className?: string }> = ({
    size = 32,
    className = "",
}) => {
    return (
        <div
            className={`brand-avatar-badge ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                minWidth: `${size}px`,
                borderRadius: "40%",
                background: "#f6ff00ff",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
            }}
        >
            <span
                style={{
                    display: "inline-block",
                    transform: "scaleX(-1)",
                    fontWeight: 700,
                    fontSize: `${size * 0.65}px`,
                    lineHeight: 1,
                }}
            >
                C
            </span>
        </div>
    );
};

export const BrandLogo: React.FC<LogoProps> = ({
    size = "md",
    showText = true,
    className = "",
    onClick,
}) => {
    const avatarSize = size === "sm" ? 26 : size === "lg" ? 38 : 30;
    const textSize =
        size === "sm" ? "0.8rem" : size === "lg" ? "1rem" : "0.9rem";

    return (
        <div
            onClick={onClick}
            className={`brand-logo-container ${className}`}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                cursor: onClick ? "pointer" : "default",
                textDecoration: "none",
                userSelect: "none",
            }}
        >
            <BrandAvatar size={avatarSize} />
            {showText && (
                <span
                    className="brand-text"
                    style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 800,
                        fontSize: textSize,
                        color: "#0F172A",
                        lineHeight: 1,
                        display: "inline-flex",
                        alignItems: "center",
                    }}
                >
                    CLAUSE AI
                </span>
            )}
        </div>
    );
};

export default BrandLogo;
