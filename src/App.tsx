import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LoginForm } from "@/components/auth/LoginForm";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Assets } from "@/pages/Assets";
import { Configuration } from "@/pages/Configuration";
import { Tickets } from "@/pages/Tickets";
import { Workflows } from "@/pages/Workflows";
import { Calendar } from "@/pages/Calendar";
import { Messages } from "@/pages/Messages";
import { Users } from "@/pages/Users";
import { Logs } from "@/pages/Logs";
import { Profile } from "@/pages/Profile";
import NotFound from "./pages/NotFound";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";

const queryClient = new QueryClient();

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <RoleBasedRoute>
            <ChangePasswordForm />
          </RoleBasedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <RoleBasedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </RoleBasedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/users"
        element={
          <RoleBasedRoute requiredRoles={["admin"]}>
            <Layout>
              <Users />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <RoleBasedRoute requiredRoles={["admin"]}>
            <Layout>
              <Logs />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/config"
        element={
          <RoleBasedRoute requiredRoles={["admin"]}>
            <Layout>
              <Configuration />
            </Layout>
          </RoleBasedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/assets"
        element={
          <RoleBasedRoute>
            <Layout>
              <Assets />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <RoleBasedRoute>
            <Layout>
              <Tickets />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/workflows"
        element={
          <RoleBasedRoute>
            <Layout>
              <Workflows />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <RoleBasedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <RoleBasedRoute>
            <Layout>
              <Messages />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RoleBasedRoute>
            <Layout>
              <Profile />
            </Layout>
          </RoleBasedRoute>
        }
      />

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="assetflow-theme">
        <TooltipProvider>
          <AuthProvider>
            <AppDataProvider>
              <AppRoutes />
              <Toaster />
              <Sonner />
            </AppDataProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
