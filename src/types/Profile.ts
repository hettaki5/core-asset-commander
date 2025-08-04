// src/types/profile.ts

// Type correspondant exactement au UserProfileDto du backend
export interface UserProfile {
  id: string;
  keycloakUserId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  createdByName?: string;
  status?: string;
  enabled: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  loginCount: number;
  mustChangePassword: boolean;
  department?: string;
  position?: string;
  phone?: string;
}

// Type pour la mise à jour (seulement les champs modifiables)
export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
}

// Type de réponse de l'API
export interface ProfileApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Types pour les notifications (local state)
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  messages: boolean;
  tickets: boolean;
}
