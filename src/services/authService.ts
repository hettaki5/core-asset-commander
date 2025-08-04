// src/services/authService.ts (REMPLACE TOUT LE CONTENU)
import {
  LoginRequest,
  LoginResponse,
  User,
  KeycloakTokenPayload,
} from "@/types/auth";

class KeycloakAuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly KEYCLOAK_URL = "http://localhost:8080";
  private readonly REALM = "plm-realm";
  private readonly CLIENT_ID = "auth-service";

  private decodeJWT(token: string): KeycloakTokenPayload | null {
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Erreur lors du décodage du JWT:", error);
      return null;
    }
  }

  private jwtToUser(payload: KeycloakTokenPayload): User {
    const userRoles = payload.realm_access.roles.filter(
      (role) =>
        !role.startsWith("default-roles-") &&
        !role.includes("offline_access") &&
        !role.includes("uma_authorization")
    );

    return {
      id: payload.sub,
      username: payload.preferred_username,
      email: payload.email || "",
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: userRoles,
      mustChangePassword: false,
    };
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJWT(token);
    if (!payload) return true;

    const now = Date.now() / 1000;
    return payload.exp < now;
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const keycloakLoginUrl = `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`;

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("client_id", this.CLIENT_ID);
    formData.append("username", loginRequest.username);
    formData.append("password", loginRequest.password);

    const response = await fetch(keycloakLoginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error_description: "Échec de l'authentification" }));
      throw new Error(error.error_description || "Identifiants invalides");
    }

    const data = await response.json();

    const payload = this.decodeJWT(data.access_token);
    if (!payload) {
      throw new Error("Token invalide reçu du serveur");
    }

    const user = this.jwtToUser(payload);

    const loginResponse: LoginResponse = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || "Bearer",
      expiresIn: data.expires_in,
      user,
    };

    this.storeTokens(loginResponse.accessToken, loginResponse.refreshToken);
    return loginResponse;
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const keycloakRefreshUrl = `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`;

      const formData = new URLSearchParams();
      formData.append("grant_type", "refresh_token");
      formData.append("client_id", this.CLIENT_ID);
      formData.append("refresh_token", refreshToken);

      const response = await fetch(keycloakRefreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      this.storeTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      this.clearTokens();
      return null;
    }
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    if (this.isTokenExpired(token)) {
      this.clearTokens();
      return null;
    }

    const payload = this.decodeJWT(token);
    if (!payload) return null;

    return this.jwtToUser(payload);
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (token && refreshToken) {
      try {
        const keycloakLogoutUrl = `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/logout`;

        const formData = new URLSearchParams();
        formData.append("client_id", this.CLIENT_ID);
        formData.append("refresh_token", refreshToken);

        await fetch(keycloakLogoutUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } catch (error) {
        console.error("Erreur lors de la déconnexion Keycloak:", error);
      }
    }

    this.clearTokens();
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const token = this.getToken();
    if (!token) throw new Error("Non authentifié");

    const response = await fetch(
      "http://localhost:8090/api/auth/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Échec du changement de mot de passe" }));
      throw new Error(error.message || "Échec du changement de mot de passe");
    }

    return true;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role.toLowerCase()) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return roles.some((role) => user.roles.includes(role.toLowerCase()));
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }
}

export const authService = new KeycloakAuthService();
