// src/types/auth.ts
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface KeycloakTokenPayload {
  sub: string;
  preferred_username: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  realm_access: {
    roles: string[];
  };
  exp: number;
  iat: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ✅ NOUVEAUX TYPES POUR LE CHANGEMENT DE MOT DE PASSE
export interface PasswordResetRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  requiresPasswordChange?: boolean;
}

export interface UserStatusResponse {
  requiresPasswordChange: boolean;
  userExists: boolean;
  message: string;
}
