import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getDemoUser, isDemoMode } from "../services/api";

const ProtectedRoute = () => {
    const { isAuthenticated, setUser, loading } = useAuth();
    const demo = isDemoMode();

    useEffect(() => {
        if (demo && !isAuthenticated) setUser(getDemoUser());
    }, [demo, isAuthenticated, setUser]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 animate-pulse">Loading BloodConnect...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated && !demo) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
