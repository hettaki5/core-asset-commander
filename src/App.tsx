
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (user.mustChangePassword) {
    return <ChangePasswordForm />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/assets" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Gestion des Assets</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/config" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Configuration</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/tickets" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Tickets</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/workflows" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Workflows</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Calendrier</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Logs Système</h1>
            <p className="text-muted-foreground">Module en cours de développement</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider>
            <AppRoutes />
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
