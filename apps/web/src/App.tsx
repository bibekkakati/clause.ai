import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { clearAuth, getAuthToken, initAuthListeners } from "./lib/auth.util";
import {
  agreementService,
  authService,
  fileService,
  userService,
} from "./services";
import { AgreementSummaryItem } from "./services/agreement.service";
import { UserFileItem } from "./services/file.service";
import { UserProfile } from "./services/user.service";

import AgreementsView from "./components/AgreementsView";
import AuthModal from "./components/AuthModal";
import BrandLogo from "./components/BrandLogo";
import FilesView from "./components/FilesView";
import FileUploadModal from "./components/FileUploadModal";
import HomePage from "./components/HomePage";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/Toast";
import { FullPageLoader, IconMenu } from "./components/icons/CustomIcons";

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Files & Agreements Data State
  const [files, setFiles] = useState<UserFileItem[]>([]);
  const [agreements, setAgreements] = useState<AgreementSummaryItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingAgreements, setLoadingAgreements] = useState(false);

  // Initialize Auth & Global Listeners
  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      clearAuth();
      setIsAuthenticated(false);
      setUser(null);
      navigate("/");
    };

    const cleanup = initAuthListeners(handleUnauthorized, checkAuth);
    return cleanup;
  }, []);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthInitializing(false);
      return;
    }

    const res = await userService.getProfile();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      setIsAuthenticated(true);
    } else {
      clearAuth();
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsAuthInitializing(false);
  };

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    await checkAuth();
    fetchFiles();
    fetchAgreements();
    navigate("/dashboard/agreements");
  };

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  // Data Fetching
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
    if (isAuthenticated) {
      fetchFiles();
      fetchAgreements();
    }
  }, [isAuthenticated]);

  const handleUploadComplete = () => {
    fetchFiles();
    fetchAgreements();
  };

  if (isAuthInitializing) {
    return <FullPageLoader message="clause ai" subMessage="Verifying session and vector pipelines..." />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onOpenAuth={() => setIsAuthModalOpen(true)}
              isAuthenticated={isAuthenticated}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex", minHeight: "100vh", background: "#FFFFFF" }}>
                {/* Desktop & Mobile Responsive Sidebar */}
                <Sidebar
                  user={user}
                  onLogout={handleLogout}
                  isMobileOpen={isMobileSidebarOpen}
                  onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#FFFFFF" }}>
                  {/* Mobile Top Header with Hamburger Toggle */}
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

                  {/* Scrollable Dashboard View */}
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
                    <Outlet />
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route
            path="agreements"
            element={
              <AgreementsView
                agreements={agreements}
                loading={loadingAgreements}
                onRefresh={fetchAgreements}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
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
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            }
          />
          <Route index element={<Navigate to="agreements" replace />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      <ToastContainer />
    </div>
  );
}
