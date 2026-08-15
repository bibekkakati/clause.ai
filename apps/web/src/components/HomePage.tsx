import React, { useState } from "react";
import { useNavigate } from "react-router";
import BrandLogo from "./BrandLogo";
import {
    IconArrowRight,
    IconBuilding,
    IconCalendar,
    IconCheck,
    IconCreditCard,
    IconDocument,
    IconFilePdf,
    IconMinus,
    IconPlus,
    IconScale,
    IconShieldRisk,
    IconSparkles,
    IconUsers,
} from "./icons/CustomIcons";

interface HomePageProps {
    onOpenAuth: () => void;
    isAuthenticated: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
    onOpenAuth,
    isAuthenticated,
}) => {
    const navigate = useNavigate();
    const [activeDemoTab, setActiveDemoTab] = useState<
        "risks" | "metadata" | "chat"
    >("risks");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex((prev) => (prev === index ? null : index));
    };

    const handleCtaClick = () => {
        if (isAuthenticated) {
            navigate("/dashboard/agreements");
        } else {
            onOpenAuth();
        }
    };

    const faqs = [
        {
            q: "What types of rental agreements can I analyze?",
            a: "Clause AI supports all residential and commercial property contracts, including apartment leases, office space rentals, retail shop agreements, subleases, and property management contracts.",
        },
        {
            q: "What kind of risks does Clause AI look for?",
            a: "The system scans for hidden liability clauses, punitive lock-in penalties, auto-renewal traps, non-refundable deposit terms, ambiguous maintenance responsibilities, and one-sided termination rules.",
        },
        {
            q: "Is my contract data safe and confidential?",
            a: "Yes. Your documents are stored securely and encrypted in transit and at rest. Your files are processed privately and are never shared, sold, or used to train public models.",
        },
        {
            q: "Can I ask custom questions about my agreement?",
            a: "Yes. You can ask any question about your agreement, such as 'How much notice is required to move out?' or 'Who pays for water and repair damage?' and get instant answers with the exact clause quoted.",
        },
        {
            q: "How long does it take to analyze a lease document?",
            a: "Most agreements are fully reviewed, summarized, and risk-scored within 5 to 15 seconds of uploading.",
        },
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "#FFFFFF",
            }}
        >
            {/* Top Floating / Sticky Navigation Bar */}
            <header
                style={{
                    height: "68px",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 32px",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }}
            >
                {/* Brand Logo with Cursive 'c' Avatar */}
                <BrandLogo onClick={() => navigate("/")} />

                {/* Center Simple Anchor Navigation Links */}
                <nav
                    className="mobile-hide"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <a href="#demo-section" className="nav-link-item">
                        What You Get
                    </a>
                    <a href="#supported-contracts" className="nav-link-item">
                        Document Types
                    </a>
                    <a href="#process" className="nav-link-item">
                        How It Works
                    </a>
                    <a href="#faq" className="nav-link-item">
                        FAQ
                    </a>
                </nav>

                {/* CTA Actions */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    {isAuthenticated ? (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate("/dashboard/agreements")}
                        >
                            Go to Workspace <IconArrowRight size={13} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={onOpenAuth}
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                {/* HERO SECTION WITH AMBIENT WARM & INDIGO GLOW ON PURE WHITE */}
                <section
                    id="overview"
                    className="hero-glow-bg"
                    style={{
                        padding: "88px 24px 72px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "860px",
                            width: "100%",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        {/* Large Clean Modern Headline */}
                        <h1
                            style={{
                                fontSize: "clamp(2.4rem, 4.8vw, 3.8rem)",
                                fontWeight: 800,
                                lineHeight: 1.12,
                                letterSpacing: "-0.035em",
                                marginBottom: "22px",
                                color: "#0F172A",
                            }}
                        >
                            Understand every clause before you sign your rental
                            agreement.
                        </h1>

                        {/* Balanced Subtitle */}
                        <p
                            style={{
                                fontSize: "1.12rem",
                                color: "#475569",
                                lineHeight: 1.65,
                                maxWidth: "680px",
                                margin: "0 auto 36px auto",
                            }}
                        >
                            Upload your residential or commercial contract to
                            instantly detect hidden liability risks, review
                            clear clause summaries, and verify financial
                            obligations in seconds.
                        </p>

                        {/* Main Action Buttons */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "14px",
                                flexWrap: "wrap",
                                marginBottom: "44px",
                            }}
                        >
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleCtaClick}
                                style={{
                                    padding: "13px 28px",
                                    fontSize: "0.95rem",
                                }}
                            >
                                {isAuthenticated
                                    ? "Go to Workspace"
                                    : "Analyze Your Agreement"}{" "}
                                <IconArrowRight size={16} />
                            </button>

                            <a
                                href="#demo-section"
                                className="btn btn-secondary btn-lg"
                                style={{ padding: "13px 26px" }}
                            >
                                See Live Example
                            </a>
                        </div>

                        {/* Micro Feature Bullets */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "28px",
                                fontSize: "0.85rem",
                                color: "#475569",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    className="badge badge-success"
                                    style={{ padding: "3px 6px" }}
                                >
                                    <IconCheck size={12} />
                                </span>
                                Instant Risk Warnings
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    className="badge badge-success"
                                    style={{ padding: "3px 6px" }}
                                >
                                    <IconCheck size={12} />
                                </span>
                                Key Financial & Date Summaries
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    className="badge badge-success"
                                    style={{ padding: "3px 6px" }}
                                >
                                    <IconCheck size={12} />
                                </span>
                                Private & Secure Storage
                            </div>
                        </div>
                    </div>
                </section>

                {/* INTERACTIVE SAMPLE PREVIEW */}
                <section
                    id="demo-section"
                    style={{
                        padding: "48px 24px 80px 24px",
                        maxWidth: "1140px",
                        margin: "0 auto",
                        width: "100%",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <span
                            style={{
                                fontSize: "0.74rem",
                                fontWeight: 600,
                                color: "#64748B",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                            }}
                        >
                            What You Get
                        </span>
                        <h2
                            style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                marginTop: "6px",
                                letterSpacing: "-0.025em",
                            }}
                        >
                            See how Clause AI audits your agreement
                        </h2>
                        <p
                            style={{
                                fontSize: "0.95rem",
                                color: "#64748B",
                                marginTop: "6px",
                            }}
                        >
                            Complex legal language translated into structured
                            insights and clear alerts
                        </p>
                    </div>

                    <div className="faux-os-window">
                        {/* Window Topbar */}
                        <div className="faux-os-topbar">
                            <div className="faux-os-dots">
                                <div className="faux-os-dot" />
                                <div className="faux-os-dot" />
                                <div className="faux-os-dot" />
                                <span
                                    style={{
                                        fontSize: "0.78rem",
                                        fontFamily: "var(--font-mono)",
                                        color: "#64748B",
                                        marginLeft: "8px",
                                    }}
                                >
                                    commercial_office_lease.pdf
                                </span>
                            </div>

                            {/* Demo Tab Buttons */}
                            <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                    className={`btn btn-sm ${activeDemoTab === "risks" ? "btn-primary" : "btn-secondary"}`}
                                    onClick={() => setActiveDemoTab("risks")}
                                >
                                    <IconShieldRisk size={13} /> Risk Audit
                                </button>
                                <button
                                    className={`btn btn-sm ${activeDemoTab === "metadata" ? "btn-primary" : "btn-secondary"}`}
                                    onClick={() => setActiveDemoTab("metadata")}
                                >
                                    <IconDocument size={13} /> Key Terms & Dates
                                </button>
                                <button
                                    className={`btn btn-sm ${activeDemoTab === "chat" ? "btn-primary" : "btn-secondary"}`}
                                    onClick={() => setActiveDemoTab("chat")}
                                >
                                    <IconSparkles size={13} /> Ask Questions
                                </button>
                            </div>
                        </div>

                        {/* Window Content */}
                        <div style={{ padding: "28px" }}>
                            {activeDemoTab === "risks" && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "16px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            paddingBottom: "12px",
                                            borderBottom:
                                                "1px solid var(--border-subtle)",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: "#0F172A",
                                            }}
                                        >
                                            3 Potential Risks Detected
                                        </span>
                                        <span className="badge badge-error">
                                            1 Critical &bull; 1 High &bull; 1
                                            Medium
                                        </span>
                                    </div>

                                    {/* Risk 1 */}
                                    <div
                                        style={{
                                            background: "#FFFFFF",
                                            border: "1px solid var(--border-subtle)",
                                            borderRadius: "var(--radius-sm)",
                                            padding: "16px 20px",
                                            boxShadow:
                                                "0 1px 3px rgba(15, 23, 42, 0.03)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: "0.9rem",
                                                    color: "#0F172A",
                                                }}
                                            >
                                                Clause 14.2 &bull; Unlimited
                                                Tenant Liability
                                            </span>
                                            <span className="badge badge-error">
                                                Critical Risk
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: "0.8rem",
                                                color: "#475569",
                                                marginBottom: "8px",
                                                background: "#F8FAFC",
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid #E2E8F0",
                                            }}
                                        >
                                            "Tenant shall indemnify Landlord
                                            against any and all claims, damages,
                                            or losses without limitation."
                                        </p>
                                        <div
                                            style={{
                                                fontSize: "0.825rem",
                                                color: "#334155",
                                            }}
                                        >
                                            <strong>Why this matters:</strong>{" "}
                                            This clause exposes you to unlimited
                                            financial responsibility for
                                            building damages even when not
                                            directly caused by your actions.
                                        </div>
                                    </div>

                                    {/* Risk 2 */}
                                    <div
                                        style={{
                                            background: "#FFFFFF",
                                            border: "1px solid var(--border-subtle)",
                                            borderRadius: "var(--radius-sm)",
                                            padding: "16px 20px",
                                            boxShadow:
                                                "0 1px 3px rgba(15, 23, 42, 0.03)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: "0.9rem",
                                                    color: "#0F172A",
                                                }}
                                            >
                                                Clause 8.1 &bull; 120-Day
                                                Auto-Renewal Notice Window
                                            </span>
                                            <span className="badge badge-warning">
                                                Medium Risk
                                            </span>
                                        </div>
                                        <p
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: "0.8rem",
                                                color: "#475569",
                                                marginBottom: "8px",
                                                background: "#F8FAFC",
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid #E2E8F0",
                                            }}
                                        >
                                            "Agreement automatically renews for
                                            3 years unless 120-day written
                                            cancellation notice is delivered."
                                        </p>
                                        <div
                                            style={{
                                                fontSize: "0.825rem",
                                                color: "#334155",
                                            }}
                                        >
                                            <strong>Why this matters:</strong>{" "}
                                            Missing the 120-day cutoff locks you
                                            into another 3-year term. Standard
                                            commercial notice is typically 30 to
                                            60 days.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeDemoTab === "metadata" && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(240px, 1fr))",
                                        gap: "16px",
                                    }}
                                >
                                    <div
                                        className="bento-card"
                                        style={{ padding: "18px" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: "#0F172A",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <IconCalendar
                                                size={16}
                                                color="#0F172A"
                                            />{" "}
                                            Lease Duration
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                marginTop: "8px",
                                                color: "#0F172A",
                                            }}
                                        >
                                            01 Apr 2026 &rarr; 31 Mar 2029
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#475569",
                                                marginTop: "2px",
                                            }}
                                        >
                                            Term: 3 Years Fixed
                                        </div>
                                    </div>

                                    <div
                                        className="bento-card"
                                        style={{ padding: "18px" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: "#0F172A",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <IconCreditCard
                                                size={16}
                                                color="#0F172A"
                                            />{" "}
                                            Monthly Rent & Deposit
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                marginTop: "8px",
                                                color: "#0F172A",
                                            }}
                                        >
                                            ₹ 1,85,000 / month
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#475569",
                                                marginTop: "2px",
                                            }}
                                        >
                                            Deposit: ₹ 11,10,000 (Refundable)
                                        </div>
                                    </div>

                                    <div
                                        className="bento-card"
                                        style={{ padding: "18px" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: "#0F172A",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <IconScale
                                                size={16}
                                                color="#0F172A"
                                            />{" "}
                                            Governing Jurisdiction
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                marginTop: "8px",
                                                color: "#0F172A",
                                            }}
                                        >
                                            Bangalore Urban Court
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#475569",
                                                marginTop: "2px",
                                            }}
                                        >
                                            State of Karnataka
                                        </div>
                                    </div>

                                    <div
                                        className="bento-card"
                                        style={{ padding: "18px" }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                color: "#0F172A",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <IconBuilding
                                                size={16}
                                                color="#0F172A"
                                            />{" "}
                                            Premises Specifications
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.95rem",
                                                fontWeight: 700,
                                                marginTop: "8px",
                                                color: "#0F172A",
                                            }}
                                        >
                                            Commercial Office (4,200 sq.ft)
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#475569",
                                                marginTop: "2px",
                                            }}
                                        >
                                            Usage: Commercial IT Operations
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeDemoTab === "chat" && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "14px",
                                    }}
                                >
                                    {/* User Query */}
                                    <div
                                        style={{
                                            alignSelf: "flex-end",
                                            maxWidth: "80%",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "#0F172A",
                                                color: "#FFFFFF",
                                                padding: "12px 18px",
                                                borderRadius:
                                                    "18px 18px 4px 18px",
                                                fontSize: "0.88rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            What is the penalty if I terminate
                                            the lease early?
                                        </div>
                                    </div>

                                    {/* Assistant Answer */}
                                    <div
                                        style={{
                                            alignSelf: "flex-start",
                                            maxWidth: "85%",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "#F8FAFC",
                                                border: "1px solid var(--border-medium)",
                                                padding: "16px 20px",
                                                borderRadius:
                                                    "18px 18px 18px 4px",
                                                fontSize: "0.88rem",
                                                lineHeight: 1.6,
                                                color: "#0F172A",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                <span
                                                    className="badge badge-info"
                                                    style={{
                                                        fontSize: "0.7rem",
                                                    }}
                                                >
                                                    Clause 18.3 &bull; Early
                                                    Termination
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#64748B",
                                                    }}
                                                >
                                                    Verified from Document
                                                </span>
                                            </div>
                                            Under <strong>Clause 18.3</strong>,
                                            terminating before the initial
                                            36-month lock-in period requires you
                                            to either pay the remaining rent for
                                            the unexpired term or forfeit the
                                            full security deposit of{" "}
                                            <strong>₹11,10,000</strong>.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                padding: "12px 28px",
                                background: "#FAFAFC",
                                borderTop: "1px solid var(--border-subtle)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "0.78rem",
                                color: "#64748B",
                            }}
                        >
                            <span>Private & secure processing</span>
                            <span>Grounded clause citations</span>
                        </div>
                    </div>
                </section>

                {/* SUPPORTED DOCUMENT TYPES */}
                <section
                    id="supported-contracts"
                    style={{
                        padding: "80px 24px",
                        maxWidth: "1140px",
                        margin: "0 auto",
                        width: "100%",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <span
                            style={{
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                color: "#0F172A",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Supported Contracts
                        </span>
                        <h2
                            style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                marginTop: "6px",
                            }}
                        >
                            Built for every type of rental agreement
                        </h2>
                        <p
                            style={{
                                fontSize: "0.95rem",
                                color: "#475569",
                                marginTop: "6px",
                            }}
                        >
                            Whether you are renting a home or leasing a
                            commercial building, Clause AI has you covered.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "20px",
                        }}
                    >
                        <div className="bento-card" style={{ padding: "24px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    background: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                <IconBuilding size={24} />
                            </div>
                            <h4
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    marginBottom: "8px",
                                }}
                            >
                                Commercial Leases
                            </h4>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#475569",
                                    lineHeight: 1.55,
                                }}
                            >
                                Office spaces, retail shops, co-working spaces,
                                industrial facilities, and warehouses.
                            </p>
                        </div>

                        <div className="bento-card" style={{ padding: "24px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    background: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                <IconFilePdf size={24} />
                            </div>
                            <h4
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    marginBottom: "8px",
                                }}
                            >
                                Residential Agreements
                            </h4>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#475569",
                                    lineHeight: 1.55,
                                }}
                            >
                                Apartment leases, house rent agreements, student
                                accommodation, and condo rentals.
                            </p>
                        </div>

                        <div className="bento-card" style={{ padding: "24px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    background: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                <IconUsers size={24} />
                            </div>
                            <h4
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    marginBottom: "8px",
                                }}
                            >
                                Subleases & Co-Tenancy
                            </h4>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#475569",
                                    lineHeight: 1.55,
                                }}
                            >
                                Roommate agreements, sublet contracts, shared
                                living terms, and joint tenancies.
                            </p>
                        </div>

                        <div className="bento-card" style={{ padding: "24px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    background: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "16px",
                                }}
                            >
                                <IconScale size={24} />
                            </div>
                            <h4
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    marginBottom: "8px",
                                }}
                            >
                                Property Management
                            </h4>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#475569",
                                    lineHeight: 1.55,
                                }}
                            >
                                Brokerage agreements, maintenance service
                                contracts, and agency representations.
                            </p>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS (SIMPLE 3 STEPS) */}
                <section
                    id="process"
                    style={{
                        padding: "80px 24px",
                        background: "#FAFAFC",
                        borderTop: "1px solid var(--border-subtle)",
                        borderBottom: "1px solid var(--border-subtle)",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "1060px",
                            margin: "0 auto",
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "48px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.74rem",
                                    fontWeight: 700,
                                    color: "#0F172A",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Simple Process
                            </span>
                            <h2
                                style={{
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    marginTop: "6px",
                                }}
                            >
                                Get contract clarity in 3 quick steps
                            </h2>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(290px, 1fr))",
                                gap: "24px",
                            }}
                        >
                            <div
                                className="bento-card"
                                style={{ padding: "26px" }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.82rem",
                                        fontFamily: "var(--font-mono)",
                                        color: "#fff",
                                        background: "#000",
                                        display: "inline-block",
                                        padding: "3px 8px",
                                        borderRadius: "6px",
                                        fontWeight: 800,
                                        marginBottom: "12px",
                                    }}
                                >
                                    STEP 01
                                </div>
                                <h4
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        marginBottom: "8px",
                                    }}
                                >
                                    Upload Your PDF Agreement
                                </h4>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#475569",
                                        lineHeight: 1.55,
                                    }}
                                >
                                    Simply drag and drop your PDF lease into the
                                    secure workspace.
                                </p>
                            </div>

                            <div
                                className="bento-card"
                                style={{ padding: "26px" }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.82rem",
                                        fontFamily: "var(--font-mono)",
                                        color: "#fff",
                                        background: "#000",
                                        display: "inline-block",
                                        padding: "3px 8px",
                                        borderRadius: "6px",
                                        fontWeight: 800,
                                        marginBottom: "12px",
                                    }}
                                >
                                    STEP 02
                                </div>
                                <h4
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        marginBottom: "8px",
                                    }}
                                >
                                    Automated Clause Audit
                                </h4>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#475569",
                                        lineHeight: 1.55,
                                    }}
                                >
                                    Clause AI scans all terms, extracts key
                                    financial figures, and flags potential
                                    risks.
                                </p>
                            </div>

                            <div
                                className="bento-card"
                                style={{ padding: "26px" }}
                            >
                                <div
                                    style={{
                                        fontSize: "0.82rem",
                                        fontFamily: "var(--font-mono)",
                                        color: "#fff",
                                        background: "#000",
                                        display: "inline-block",
                                        padding: "3px 8px",
                                        borderRadius: "6px",
                                        fontWeight: 800,
                                        marginBottom: "12px",
                                    }}
                                >
                                    STEP 03
                                </div>
                                <h4
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        marginBottom: "8px",
                                    }}
                                >
                                    Review & Ask Questions
                                </h4>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#475569",
                                        lineHeight: 1.55,
                                    }}
                                >
                                    Read your executive summary, review risk
                                    cards, or ask questions directly about your
                                    agreement.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ ACCORDION SECTION */}
                <section id="faq" style={{ padding: "80px 24px" }}>
                    <div
                        style={{
                            maxWidth: "840px",
                            margin: "0 auto",
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "48px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.74rem",
                                    fontWeight: 600,
                                    color: "#64748B",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Common Questions
                            </span>
                            <h2
                                style={{
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    marginTop: "6px",
                                }}
                            >
                                Frequently Asked Questions
                            </h2>
                        </div>

                        <div
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            {faqs.map((faq, index) => {
                                const isOpen = openFaqIndex === index;
                                return (
                                    <div key={index} className="accordion-item">
                                        <button
                                            className="accordion-header"
                                            onClick={() => toggleFaq(index)}
                                            aria-expanded={isOpen}
                                        >
                                            <span>{faq.q}</span>
                                            <span
                                                style={{
                                                    color: "#0F172A",
                                                    marginLeft: "16px",
                                                    display: "flex",
                                                }}
                                            >
                                                {isOpen ? (
                                                    <IconMinus size={18} />
                                                ) : (
                                                    <IconPlus size={18} />
                                                )}
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="accordion-content ai-status-fade">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            {/* Modern Clean Footer */}
            <footer
                style={{
                    borderTop: "1px solid var(--border-subtle)",
                    background: "#FFFFFF",
                    padding: "32px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "20px",
                    fontSize: "0.825rem",
                    color: "#64748B",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <BrandLogo size="sm" />
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    <span>Rental Agreement Intelligence</span>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
