import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path as needed
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Not logged in
  if (!user) return <Navigate to="/" replace />;

  // Allow only admin or superadmin
  if (user.role !== "admin" && user.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
