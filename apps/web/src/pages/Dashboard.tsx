import { getAuthToken } from "@/lib/auth.util";
import { agreementService, fileService } from "@/services";
import { AgreementSummaryItem } from "@/services/agreement.service";
import { UserFileItem } from "@/services/file.service";
import { UserProfile } from "@/services/user.service";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AgreementsView from "@/components/AgreementsView";
import BrandLogo from "@/components/BrandLogo";
import FilesView from "@/components/FilesView";
import FileUploadModal from "@/components/FileUploadModal";
import { IconMenu } from "@/components/icons/CustomIcons";
import Sidebar from "@/components/Sidebar";

interface DashboardProps {
    user: UserProfile | null;
    onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const [files, setFiles] = useState<UserFileItem[]>([]);
    const [agreements, setAgreements] = useState<AgreementSummaryItem[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [loadingAgreements, setLoadingAgreements] = useState(false);

    const fetchFiles = async () => {
        if (!getAuthToken()) return;
        setLoadingFiles(true);
        const res = await fileService.getUserFiles();
        setLoadingFiles(false);
        if (res.success && res.data) {
            setFiles(res.data.files || []);
        }
    };

    const fetchAgreements = async () => {
        if (!getAuthToken()) return;
        setLoadingAgreements(true);
        const res = await agreementService.getUserAgreements();
        setLoadingAgreements(false);
        if (res.success && res.data) {
            setAgreements(res.data.agreements || []);
        }
    };

    useEffect(() => {
        fetchFiles();
        fetchAgreements();
    }, []);

    const handleUploadComplete = () => {
        fetchFiles();
        fetchAgreements();
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#FFFFFF",
            }}
        >
            <Sidebar
                user={user}
                onLogout={onLogout}
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    background: "#FFFFFF",
                }}
            >
                <div
                    className="mobile-show-flex"
                    style={{
                        display: "none",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        background: "#FFFFFF",
                        borderBottom: "1px solid var(--border-subtle)",
                        position: "sticky",
                        top: 0,
                        zIndex: 30,
                    }}
                >
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        aria-label="Open Navigation Menu"
                        style={{ padding: "6px 10px" }}
                    >
                        <IconMenu size={18} />
                    </button>

                    <BrandLogo size="sm" />

                    <div style={{ width: "32px" }} />
                </div>

                <main
                    className="dashboard-main-content"
                    style={{
                        flex: 1,
                        padding: "36px 44px",
                        overflowY: "auto",
                        maxWidth: "1400px",
                        width: "100%",
                        margin: "0 auto",
                        background: "#FFFFFF",
                    }}
                >
                    <Routes>
                        <Route
                            path="agreements"
                            element={
                                <AgreementsView
                                    agreements={agreements}
                                    loading={loadingAgreements}
                                    onRefresh={fetchAgreements}
                                    onOpenUploadModal={() =>
                                        setIsUploadModalOpen(true)
                                    }
                                    user={user}
                                />
                            }
                        />
                        <Route
                            path="files"
                            element={
                                <FilesView
                                    files={files}
                                    loading={loadingFiles}
                                    onRefresh={fetchFiles}
                                    onOpenUploadModal={() =>
                                        setIsUploadModalOpen(true)
                                    }
                                />
                            }
                        />
                        <Route
                            index
                            element={<Navigate to="agreements" replace />}
                        />
                    </Routes>
                </main>
            </div>

            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}
