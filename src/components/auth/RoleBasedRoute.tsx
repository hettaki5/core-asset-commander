import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  // If no specific roles are required, allow access
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = user.roles?.some((role) =>
    requiredRoles.includes(role.toLowerCase())
  );

  if (!hasRequiredRole) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
