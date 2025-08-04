// src/services/adminUserService.ts - VERSION AVEC PROXY VITE

import { authService } from "./authService";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
  UserListResponse,
  UserStats,
  ListUsersFilters,
  ExtendedUserStats,
} from "@/types";

class AdminUserService {
  // 🔧 MODIFICATION: Utiliser le proxy Vite au lieu de l'URL complète
  private readonly BASE_URL = "/api/admin"; // ✅ Proxy Vite va rediriger vers localhost:8090

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;

    console.log("🔄 Making request to:", url, "with options:", options);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeader(),
          ...options.headers,
        },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log("✅ API Response:", result);

      if (!result.success) {
        throw new Error(result.message || "Une erreur est survenue");
      }

      return result.data;
    } catch (error) {
      console.error("💥 Request failed:", error);
      throw error;
    }
  }

  // 🔐 TEST DE CONNEXION - adapté au proxy
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });
      console.log("🔐 Connection test result:", response.ok);
      return response.ok;
    } catch (error) {
      console.error("❌ Erreur lors du test de connexion:", error);
      return false;
    }
  }

  // ... reste des méthodes identiques (getUsers, createUser, etc.)

  // 📋 LISTER LES UTILISATEURS
  async getUsers(filters: ListUsersFilters = {}): Promise<UserListResponse> {
    try {
      console.log("📋 Getting users with filters:", filters);

      // Construction des paramètres de requête
      const searchParams = new URLSearchParams();

      if (filters.page !== undefined)
        searchParams.set("page", filters.page.toString());
      if (filters.size !== undefined)
        searchParams.set("size", filters.size.toString());
      if (filters.search) searchParams.set("search", filters.search);
      if (filters.enabled !== undefined)
        searchParams.set("enabled", filters.enabled.toString());
      if (filters.department)
        searchParams.set("department", filters.department);
      if (filters.sortBy) searchParams.set("sortBy", filters.sortBy);
      if (filters.sortOrder) searchParams.set("sortOrder", filters.sortOrder);

      // Gestion des arrays (roles, statuses)
      if (filters.roles && filters.roles.length > 0) {
        filters.roles.forEach((role) => searchParams.append("roles", role));
      }
      if (filters.statuses && filters.statuses.length > 0) {
        filters.statuses.forEach((status) =>
          searchParams.append("statuses", status)
        );
      }

      const queryString = searchParams.toString();
      const endpoint = `/users${queryString ? `?${queryString}` : ""}`;

      return await this.makeRequest<UserListResponse>(endpoint);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des utilisateurs:",
        error
      );
      throw error;
    }
  }

  // ➕ CRÉER UN UTILISATEUR
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      console.log("➕ Creating user:", userData);
      return await this.makeRequest<User>("/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  // 👤 OBTENIR UN UTILISATEUR PAR ID
  async getUserById(userId: string): Promise<User> {
    try {
      console.log("👤 Getting user by ID:", userId);
      return await this.makeRequest<User>(`/users/${userId}`);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  // ✏️ MODIFIER UN UTILISATEUR
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    try {
      console.log("✏️ Updating user:", userId, userData);
      return await this.makeRequest<User>(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la modification de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  // 🔒 ACTIVER/DÉSACTIVER UN UTILISATEUR
  async toggleUserStatus(userId: string, enabled: boolean): Promise<User> {
    try {
      console.log("🔒 Toggling user status:", userId, enabled);
      return await this.makeRequest<User>(`/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      });
    } catch (error) {
      console.error("❌ Erreur lors du changement de statut:", error);
      throw error;
    }
  }

  // 🎭 MODIFIER LES RÔLES D'UN UTILISATEUR
  async updateUserRoles(userId: string, roles: string[]): Promise<User> {
    try {
      console.log("🎭 Updating user roles:", userId, roles);
      return await this.makeRequest<User>(`/users/${userId}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ roles }),
      });
    } catch (error) {
      console.error("❌ Erreur lors de la modification des rôles:", error);
      throw error;
    }
  }

  // 🔑 RÉINITIALISER LE MOT DE PASSE
  async resetPassword(userId: string, newPassword?: string): Promise<string> {
    try {
      console.log("🔑 Resetting password for user:", userId);

      const body = newPassword ? { newPassword } : {};

      const response = await this.makeRequest<string>(
        `/users/${userId}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      return response;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      throw error;
    }
  }

  // 🗑️ SUPPRIMER UN UTILISATEUR (SOFT DELETE)
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log("🗑️ Deleting user:", userId);
      await this.makeRequest<void>(`/users/${userId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  // 📧 RENVOYER EMAIL DE BIENVENUE
  async resendWelcomeEmail(userId: string): Promise<string> {
    try {
      console.log("📧 Resending welcome email for user:", userId);
      const response = await this.makeRequest<string>(
        `/users/${userId}/resend-welcome`,
        {
          method: "POST",
        }
      );
      return response;
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error);
      throw error;
    }
  }

  // 📊 STATISTIQUES
  async getStats(): Promise<UserStats> {
    try {
      console.log("📊 Getting user stats");
      return await this.makeRequest<UserStats>("/users/stats");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );
      // Retourner des stats par défaut en cas d'erreur
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        usersRequiringPasswordChange: 0,
        usersByRole: {},
        usersByDepartment: {},
        usersByStatus: {},
        newUsersThisMonth: 0,
      };
    }
  }

  // 🔍 RECHERCHE AVANCÉE
  async searchUsersAdvanced(
    query: string,
    roles?: string[],
    includeInactive?: boolean
  ): Promise<User[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("search", query);
      searchParams.set("size", "50");

      if (roles && roles.length > 0) {
        roles.forEach((role) => searchParams.append("roles", role));
      }

      if (includeInactive !== undefined) {
        searchParams.set("enabled", (!includeInactive).toString());
      }

      const endpoint = `/users?${searchParams.toString()}`;
      const result = await this.makeRequest<UserListResponse>(endpoint);
      return result.users;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche avancée:", error);
      throw error;
    }
  }

  // 📈 STATISTIQUES ÉTENDUES
  async getExtendedStats(): Promise<ExtendedUserStats> {
    try {
      console.log("📈 Getting extended stats");
      return await this.makeRequest<ExtendedUserStats>("/users/stats/extended");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques étendues:",
        error
      );
      // Fallback vers les stats basiques
      const basicStats = await this.getStats();
      return {
        basic: basicStats,
        newUsersLastWeek: 0,
        newUsersLastMonth: 0,
        deletedUsers: 0,
        pendingUsers: 0,
        ...basicStats,
      };
    }
  }

  // 🔄 SYNCHRONISER AVEC KEYCLOAK
  async syncWithKeycloak(userId: string): Promise<User> {
    try {
      console.log("🔄 Syncing user with Keycloak:", userId);
      return await this.makeRequest<User>(`/users/${userId}/sync`, {
        method: "POST",
      });
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation:", error);
      throw error;
    }
  }

  // 📊 EXPORT DES UTILISATEURS
  async exportUsers(filters?: ListUsersFilters): Promise<Blob> {
    try {
      console.log("📊 Exporting users with filters:", filters);

      const searchParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v.toString()));
            } else {
              searchParams.set(key, value.toString());
            }
          }
        });
      }

      // 🔧 MODIFICATION: Utiliser le proxy au lieu de l'URL complète
      const url = `/api/admin/users/export${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...authService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur d'export: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("❌ Erreur lors de l'export:", error);
      throw error;
    }
  }

  // 🔍 VALIDATION EMAIL/USERNAME
  async checkEmailAvailability(
    email: string,
    excludeUserId?: string
  ): Promise<boolean> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("email", email);
      if (excludeUserId) {
        searchParams.set("excludeUserId", excludeUserId);
      }

      const response = await this.makeRequest<{ available: boolean }>(
        `/users/check-email?${searchParams.toString()}`
      );
      return response.available;
    } catch (error) {
      console.error("❌ Erreur lors de la vérification de l'email:", error);
      return false;
    }
  }

  async checkUsernameAvailability(
    username: string,
    excludeUserId?: string
  ): Promise<boolean> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("username", username);
      if (excludeUserId) {
        searchParams.set("excludeUserId", excludeUserId);
      }

      const response = await this.makeRequest<{ available: boolean }>(
        `/users/check-username?${searchParams.toString()}`
      );
      return response.available;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la vérification du nom d'utilisateur:",
        error
      );
      return false;
    }
  }

  // 🔍 MÉTHODES UTILITAIRES
  async searchUsers(query: string): Promise<User[]> {
    try {
      const result = await this.getUsers({ search: query, size: 50 });
      return result.users;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche d'utilisateurs:", error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await this.getUsers({ roles: [role], size: 100 });
      return result.users;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des utilisateurs par rôle:",
        error
      );
      throw error;
    }
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    try {
      const result = await this.getUsers({ department, size: 100 });
      return result.users;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des utilisateurs par département:",
        error
      );
      throw error;
    }
  }
}

export const adminUserService = new AdminUserService();
