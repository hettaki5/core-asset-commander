// src/services/userProfileService.ts
export interface UserProfile {
  id: string;
  keycloakUserId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  status: string;
  enabled: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  loginCount: number;
  mustChangePassword: boolean;
  department: string | null;
  position: string | null;
  phone: string | null;
}

export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class UserProfileService {
  private readonly baseUrl = "/api/users";

  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Méthode utilitaire pour extraire les données du JWT
  private extractUserFromToken(): Partial<UserProfile> | null {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      // Décoder le JWT (partie payload)
      const payload = JSON.parse(atob(token.split(".")[1]));

      return {
        keycloakUserId: payload.sub,
        username: payload.preferred_username,
        email: payload.email,
        firstName: payload.given_name || "",
        lastName: payload.family_name || "",
        roles: payload.realm_access?.roles || [],
        enabled: true,
        emailVerified: payload.email_verified || false,
        loginCount: 0,
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erreur lors de l'extraction du JWT:", error);
      return null;
    }
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Si l'utilisateur n'existe pas, essayer d'utiliser les données du JWT
          const jwtData = this.extractUserFromToken();
          if (jwtData) {
            console.warn(
              "⚠️ Profil non trouvé en BDD, utilisation des données JWT temporaires"
            );
            return {
              id: "temp-" + jwtData.keycloakUserId,
              keycloakUserId: jwtData.keycloakUserId || "",
              username: jwtData.username || "",
              email: jwtData.email || "",
              firstName: jwtData.firstName || "",
              lastName: jwtData.lastName || "",
              roles: jwtData.roles || [],
              createdAt: jwtData.createdAt || "",
              updatedAt: jwtData.updatedAt || "",
              createdBy: "",
              createdByName: "",
              status: "TEMP",
              enabled: jwtData.enabled || true,
              emailVerified: jwtData.emailVerified || false,
              lastLoginAt: null,
              loginCount: jwtData.loginCount || 0,
              mustChangePassword: jwtData.mustChangePassword || false,
              department: null,
              position: null,
              phone: null,
            } as UserProfile;
          }
          throw new Error(
            "Profil utilisateur non trouvé. Veuillez contacter un administrateur."
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<UserProfile> = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Erreur lors de la récupération du profil"
        );
      }

      return result.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);

      // Si c'est une erreur spécifique, on la propage
      if (
        error instanceof Error &&
        error.message.includes("Profil utilisateur non trouvé")
      ) {
        throw error;
      }

      throw new Error("Impossible de récupérer le profil utilisateur");
    }
  }

  async updateCurrentUserProfile(
    profileData: UpdateProfileRequest
  ): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<UserProfile> = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Erreur lors de la mise à jour du profil"
        );
      }

      return result.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw new Error("Impossible de mettre à jour le profil utilisateur");
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<null> & {
        users: UserProfile[];
        total: number;
      } = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Erreur lors de la récupération des utilisateurs"
        );
      }

      return result.users;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw new Error("Impossible de récupérer la liste des utilisateurs");
    }
  }
}

// ✅ CORRECTION: Export par défaut ET nommé
export const userProfileService = new UserProfileService();
export default userProfileService;
