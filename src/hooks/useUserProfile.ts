// src/hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from "react";
import userProfileService from "@/services/UserProfileService";
import type {
  UserProfile,
  UpdateProfileRequest,
} from "@/services/UserProfileService";

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await userProfileService.getCurrentUserProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<boolean> => {
      try {
        setError(null);
        const updatedProfile =
          await userProfileService.updateCurrentUserProfile(data);
        setProfile(updatedProfile);
        return true;
      } catch (err) {
        console.error("Erreur lors de la mise à jour du profil:", err);
        setError("Erreur lors de la mise à jour du profil");
        return false;
      }
    },
    []
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isAdmin = profile?.roles?.includes("admin") || false;

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    isAdmin,
  };
};
