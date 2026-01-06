import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { LoadingSpinner } from "@/components/common";
import type { ReactElement } from "react";

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
