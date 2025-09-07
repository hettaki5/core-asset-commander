import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { localAssetService } from "@/services/localAssetService";
import type { AssetDto, AssetType, AssetStatus } from "@/types/backend";
import type { LocalAssetDto } from "@/services/localAssetService";

export interface UseAssetsReturn {
  // Data
  assets: LocalAssetDto[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Stats
  stats: {
    totalAssets: number;
    pendingAssets: number;
    approvedAssets: number;
    rejectedAssets: number;
    myAssets: number; // Added myAssets to stats
  };

  // Actions
  refreshAssets: () => Promise<void>;
  createAsset: (data: {
    name: string;
    type: AssetType;
    configurationId: string;
    description?: string;
    formData: {
      sections: {
        id: string;
        name: string;
        fields: {
          id: string;
          name: string;
          type: string;
          value: string | string[];
          required: boolean;
        }[];
      }[];
    };
    images?: Record<string, File[]>;
  }) => Promise<LocalAssetDto>;
  updateAsset: (
    id: string,
    updates: Partial<LocalAssetDto>
  ) => Promise<LocalAssetDto>;
  deleteAsset: (id: string) => Promise<void>;
  submitForValidation: (id: string) => Promise<void>;
  validateAsset: (id: string) => Promise<void>;
  rejectAsset: (id: string) => Promise<void>;

  // Filters
  getAssetsByStatus: (status: AssetStatus) => LocalAssetDto[];
  getAssetsByType: (type: AssetType) => LocalAssetDto[];
  getMyAssets: () => LocalAssetDto[]; // Added getMyAssets helper
}

export const useAssets = (): UseAssetsReturn => {
  const { user } = useAuth(); // Get user context
  const [assets, setAssets] = useState<LocalAssetDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAssets: 0,
    pendingAssets: 0,
    approvedAssets: 0,
    rejectedAssets: 0,
    myAssets: 0,
  });

  // Load all assets
  const refreshAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      const [allAssets, dashboardStats] = await Promise.all([
        localAssetService.getAllAssets(),
        localAssetService.getDashboardStats(),
      ]);

      setAssets(allAssets);

      // Calculate myAssets count based on current user
      const userFullName = user ? `${user.firstName} ${user.lastName}` : null;
      const myAssetsCount = userFullName
        ? allAssets.filter((asset) => asset.createdBy === userFullName).length
        : 0;

      setStats({
        ...dashboardStats,
        myAssets: myAssetsCount,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des assets";
      setError(errorMessage);
      console.error("Erreur lors du chargement des assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create asset with user context
  const createAsset = async (data: {
    name: string;
    type: AssetType;
    configurationId: string;
    description?: string;
    formData: {
      sections: {
        id: string;
        name: string;
        fields: {
          id: string;
          name: string;
          type: string;
          value: string | string[];
          required: boolean;
        }[];
      }[];
    };
    images?: Record<string, File[]>;
  }): Promise<LocalAssetDto> => {
    try {
      // Prepare user information
      const userId = user?.id;
      const userFullName = user
        ? `${user.firstName} ${user.lastName}`
        : "Unknown User";

      // Create asset data with user context
      const assetDataWithUser = {
        ...data,
        createdBy: userFullName,
        createdById: userId,
      };

      const created = await localAssetService.createAsset(assetDataWithUser);

      // Refresh data to get updated stats
      await refreshAssets();

      return created;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la création";
      setError(errorMessage);
      throw err;
    }
  };

  // Update asset
  const updateAsset = async (
    id: string,
    updates: Partial<LocalAssetDto>
  ): Promise<LocalAssetDto> => {
    try {
      const updated = await localAssetService.updateAsset(id, updates);

      // Update local state
      setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));

      // Refresh stats if status changed
      if (updates.status) {
        await refreshAssets();
      }

      return updated;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      setError(errorMessage);
      throw err;
    }
  };

  // Delete asset
  const deleteAsset = async (id: string): Promise<void> => {
    try {
      await localAssetService.deleteAsset(id);

      // Remove from local state
      setAssets((prev) => prev.filter((a) => a.id !== id));

      // Refresh stats
      await refreshAssets();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMessage);
      throw err;
    }
  };

  // Submit for validation
  const submitForValidation = async (id: string): Promise<void> => {
    try {
      await updateAsset(id, { status: "SUBMITTED" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la soumission";
      setError(errorMessage);
      throw err;
    }
  };

  // Validate asset
  const validateAsset = async (id: string): Promise<void> => {
    try {
      await updateAsset(id, { status: "APPROVED" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la validation";
      setError(errorMessage);
      throw err;
    }
  };

  // Reject asset
  const rejectAsset = async (id: string): Promise<void> => {
    try {
      await updateAsset(id, { status: "REJECTED" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du rejet";
      setError(errorMessage);
      throw err;
    }
  };

  // Filter functions
  const getAssetsByStatus = (status: AssetStatus): LocalAssetDto[] => {
    return assets.filter((asset) => asset.status === status);
  };

  const getAssetsByType = (type: AssetType): LocalAssetDto[] => {
    return assets.filter((asset) => asset.type === type);
  };

  // Get current user's assets
  const getMyAssets = (): LocalAssetDto[] => {
    if (!user) return [];
    const userFullName = `${user.firstName} ${user.lastName}`;
    return assets.filter((asset) => asset.createdBy === userFullName);
  };

  // Initial load
  useEffect(() => {
    refreshAssets();
  }, []);

  // Refresh assets when user changes (for proper myAssets calculation)
  useEffect(() => {
    if (user && assets.length > 0) {
      // Recalculate stats when user context is available
      const userFullName = `${user.firstName} ${user.lastName}`;
      const myAssetsCount = assets.filter(
        (asset) => asset.createdBy === userFullName
      ).length;

      setStats((prev) => ({
        ...prev,
        myAssets: myAssetsCount,
      }));
    }
  }, [user, assets]);

  return {
    // Data
    assets,

    // Loading states
    loading,
    error,

    // Stats
    stats,

    // Actions
    refreshAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    submitForValidation,
    validateAsset,
    rejectAsset,

    // Filters
    getAssetsByStatus,
    getAssetsByType,
    getMyAssets,
  };
};
