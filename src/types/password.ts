// src/types/password.ts
export interface ChangePasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  requiresPasswordChange?: boolean;
}

export interface UserStatusResponse {
  requiresPasswordChange: boolean;
  userExists: boolean;
  message: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string; // 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'
  suggestions: string[];
}
