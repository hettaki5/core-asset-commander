// src/contexts/AuthContext.tsx (REMPLACE TOUT LE CONTENU)
import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "./AuthContextDef";
import { authService } from "@/services/authService";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        const newToken = await authService.refreshToken();
        if (newToken) {
          const refreshedUser = authService.getCurrentUser();
          setUser(refreshedUser);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du statut d'authentification:",
        error
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const loginResponse = await authService.login({ username, password });

      setUser(loginResponse.user);
      redirectBasedOnRole(loginResponse.user);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${
          loginResponse.user.firstName || loginResponse.user.username
        }!`,
      });

      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description:
          error instanceof Error ? error.message : "Identifiants invalides",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      navigate("/login");
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setUser(null);
      navigate("/login");
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      await authService.changePassword(currentPassword, newPassword);

      if (user) {
        const updatedUser = { ...user, mustChangePassword: false };
        setUser(updatedUser);
      }

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès",
      });

      return true;
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast({
        variant: "destructive",
        title: "Échec du changement de mot de passe",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
      return false;
    }
  };

  const redirectBasedOnRole = (user: User) => {
    console.log("Utilisateur connecté:", user);
    console.log("Rôles:", user.roles);

    // Si changement de mot de passe requis -> formulaire de changement
    if (user.mustChangePassword) {
      console.log("Redirection vers /change-password");
      navigate("/change-password");
      return;
    }

    // Redirections selon le rôle APRÈS connexion réussie
    if (user.roles.includes("admin")) {
      console.log("Redirection Admin vers Dashboard");
      navigate("/"); // Dashboard admin
    } else if (user.roles.includes("validateur")) {
      console.log("Redirection Validateur vers Dashboard");
      navigate("/"); // Dashboard validateur
    } else if (user.roles.includes("ingenieurpr")) {
      console.log("Redirection Ingénieur vers Dashboard");
      navigate("/"); // Dashboard ingénieur
    } else if (user.roles.includes("observateur")) {
      console.log("Redirection Observateur vers Dashboard");
      navigate("/"); // Dashboard observateur
    } else {
      console.log("Redirection par défaut vers Dashboard");
      console.log("Rôles non reconnus:", user.roles);
      navigate("/"); // Par défaut vers le dashboard
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        changePassword,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
