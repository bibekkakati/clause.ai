import AuthModal from "@/components/AuthModal";
import HomePage from "@/components/HomePage";
import ToastContainer from "@/components/Toast";
import { FullPageLoader } from "@/components/icons/CustomIcons";
import { clearAuth, getAuthToken, initAuthListeners } from "@/lib/auth.util";
import Dashboard from "@/pages/Dashboard";
import { authService, userService } from "@/services";
import { UserProfile } from "@/services/user.service";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

export default function App() {
    const navigate = useNavigate();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        navigate("/dashboard/agreements");
    };

    const handleLogout = async () => {
        await authService.logout();
        clearAuth();
        setIsAuthenticated(false);
        setUser(null);
        navigate("/");
    };

    if (isAuthInitializing) {
        return (
            <FullPageLoader
                message="Clause AI"
                subMessage="Verifying session and setting-up..."
            />
        );
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
                    path="/dashboard/*"
                    element={
                        isAuthenticated ? (
                            <Dashboard user={user} onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Modals */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            <ToastContainer />
        </div>
    );
}
