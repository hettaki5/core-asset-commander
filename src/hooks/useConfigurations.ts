// 2. CORRECTION: useConfigurations Hook - Adapté aux vraies APIs
// src/hooks/useConfigurations.ts - VERSION CORRIGÉE

import { useState, useEffect, useCallback } from "react";
import { configService } from "../services/configService";
import { useAuth } from "./useAuth";
import type {
  ConfigurationDto,
  ConfigurationSummaryDto,
  ConfigurationCreateRequest,
  ConfigurationUpdateRequest,
} from "@/types/backend";

interface UseConfigurationsParams {
  entityType?: string;
  autoLoad?: boolean;
}

interface UseConfigurationsReturn {
  // Data
  configurations: ConfigurationSummaryDto[];
  selectedConfiguration: ConfigurationDto | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error states
  error: string | null;

  // Stats
  stats: {
    totalConfigurations: number;
    activeConfigurations: number;
    configsByEntity: Record<string, number>;
  };

  // Actions CRUD (Admin seulement)
  loadConfigurations: (entityType: string) => Promise<void>;
  loadConfiguration: (
    entityType: string,
    configName: string
  ) => Promise<ConfigurationDto | null>;
  createConfiguration: (
    request: ConfigurationCreateRequest
  ) => Promise<ConfigurationDto>;
  updateConfiguration: (
    configId: string,
    request: ConfigurationUpdateRequest
  ) => Promise<ConfigurationDto>;
  deleteConfiguration: (configId: string) => Promise<void>;
  toggleConfiguration: (
    configId: string,
    active: boolean
  ) => Promise<ConfigurationDto>;

  // Utilitaires
  refreshAll: () => Promise<void>;
  validateConfiguration: (
    request: ConfigurationCreateRequest
  ) => Promise<boolean>;
  clearError: () => void;

  // Filters & Helpers
  getActiveConfigurations: () => ConfigurationSummaryDto[];
  getDefaultConfiguration: (
    entityType: string
  ) => Promise<ConfigurationDto | null>;
}

export const useConfigurations = (
  params: UseConfigurationsParams = {}
): UseConfigurationsReturn => {
  const { user } = useAuth();

  // State
  const [configurations, setConfigurations] = useState<
    ConfigurationSummaryDto[]
  >([]);
  const [selectedConfiguration, setSelectedConfiguration] =
    useState<ConfigurationDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalConfigurations: 0,
    activeConfigurations: 0,
    configsByEntity: {} as Record<string, number>,
  });

  // Vérification des permissions
  const canModify =
    user?.roles?.includes("admin") || user?.roles?.includes("ADMIN");

  // ========== ACTIONS PRINCIPALES ==========

  const loadConfigurations = useCallback(async (entityType: string) => {
    if (!entityType) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ CORRECTION: Utiliser la bonne méthode API
      const configs = await configService.getAllConfigurations(entityType);
      setConfigurations(configs);

      // Mettre à jour les stats
      setStats((prev) => ({
        ...prev,
        totalConfigurations: configs.length,
        activeConfigurations: configs.filter((c) => c.active).length,
        configsByEntity: {
          ...prev.configsByEntity,
          [entityType]: configs.length,
        },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des configurations";
      setError(errorMessage);
      console.error("Erreur loadConfigurations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConfiguration = useCallback(
    async (
      entityType: string,
      configName: string
    ): Promise<ConfigurationDto | null> => {
      if (!entityType || !configName) return null;

      try {
        // ✅ CORRECTION: Utiliser la bonne méthode API
        const config = await configService.getConfigurationById(
          entityType,
          configName
        );
        setSelectedConfiguration(config);
        return config;
      } catch (err) {
        console.error("Erreur loadConfiguration:", err);
        return null;
      }
    },
    []
  );

  const createConfiguration = useCallback(
    async (request: ConfigurationCreateRequest): Promise<ConfigurationDto> => {
      if (!canModify) {
        throw new Error(
          "Permissions insuffisantes pour créer une configuration"
        );
      }

      setCreating(true);
      setError(null);

      try {
        // ✅ CORRECTION: Utiliser la vraie API
        const newConfig = await configService.createConfiguration(request);

        // Recharger la liste pour le type d'entité concerné
        await loadConfigurations(request.entityType);

        return newConfig;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMessage);
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [canModify, loadConfigurations]
  );

  const updateConfiguration = useCallback(
    async (
      configId: string,
      request: ConfigurationUpdateRequest
    ): Promise<ConfigurationDto> => {
      if (!canModify) {
        throw new Error(
          "Permissions insuffisantes pour modifier une configuration"
        );
      }

      setUpdating(true);
      setError(null);

      try {
        // ✅ CORRECTION: Utiliser la vraie API
        const updatedConfig = await configService.updateConfiguration(
          configId,
          request
        );

        // Mettre à jour localement dans la liste
        setConfigurations((prev) =>
          prev.map((c) =>
            c.id === configId
              ? { ...c, displayName: updatedConfig.displayName }
              : c
          )
        );

        // Mettre à jour la configuration sélectionnée si c'est la même
        if (selectedConfiguration?.id === configId) {
          setSelectedConfiguration(updatedConfig);
        }

        return updatedConfig;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la modification";
        setError(errorMessage);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [canModify, selectedConfiguration]
  );

  const deleteConfiguration = useCallback(
    async (configId: string): Promise<void> => {
      if (!canModify) {
        throw new Error(
          "Permissions insuffisantes pour supprimer une configuration"
        );
      }

      setDeleting(true);
      setError(null);

      try {
        // ✅ CORRECTION: Utiliser la vraie API
        await configService.deleteConfiguration(configId);

        // Supprimer localement
        setConfigurations((prev) => prev.filter((c) => c.id !== configId));

        // Clear selected si c'était la config supprimée
        if (selectedConfiguration?.id === configId) {
          setSelectedConfiguration(null);
        }

        // Mettre à jour les stats
        setStats((prev) => ({
          ...prev,
          totalConfigurations: prev.totalConfigurations - 1,
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la suppression";
        setError(errorMessage);
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    [canModify, selectedConfiguration]
  );

  const toggleConfiguration = useCallback(
    async (configId: string, active: boolean): Promise<ConfigurationDto> => {
      if (!canModify) {
        throw new Error("Permissions insuffisantes pour modifier le statut");
      }

      try {
        // ✅ CORRECTION: Utiliser la vraie API
        const updatedConfig = await configService.toggleConfiguration(
          configId,
          active
        );

        // Mettre à jour localement
        setConfigurations((prev) =>
          prev.map((c) => (c.id === configId ? { ...c, active } : c))
        );

        return updatedConfig;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erreur lors du changement de statut";
        setError(errorMessage);
        throw err;
      }
    },
    [canModify]
  );

  // ========== UTILITAIRES ==========

  const refreshAll = useCallback(async () => {
    if (params.entityType) {
      await loadConfigurations(params.entityType);
    }

    // Charger les stats globales
    try {
      const globalStats = await configService.getConfigurationStats();
      setStats((prev) => ({
        ...prev,
        ...globalStats,
      }));
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
    }
  }, [params.entityType, loadConfigurations]);

  const validateConfiguration = useCallback(
    async (request: ConfigurationCreateRequest): Promise<boolean> => {
      try {
        const result = await configService.validateConfiguration(request);
        return result.valid;
      } catch (err) {
        console.error("Erreur de validation:", err);
        return false;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getActiveConfigurations = useCallback((): ConfigurationSummaryDto[] => {
    return configurations.filter((config) => config.active);
  }, [configurations]);

  const getDefaultConfiguration = useCallback(
    async (entityType: string): Promise<ConfigurationDto | null> => {
      try {
        return await configService.getDefaultConfiguration(entityType);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération de la config par défaut:",
          err
        );
        return null;
      }
    },
    []
  );

  // ========== EFFETS ==========

  // Chargement initial
  useEffect(() => {
    if (params.autoLoad !== false && params.entityType) {
      loadConfigurations(params.entityType);
    }
  }, [params.autoLoad, params.entityType, loadConfigurations]);

  return {
    // Data
    configurations,
    selectedConfiguration,

    // Loading states
    loading,
    creating,
    updating,
    deleting,

    // Error state
    error,

    // Stats
    stats,

    // Actions (respectent les permissions)
    loadConfigurations,
    loadConfiguration,
    createConfiguration: canModify
      ? createConfiguration
      : async () => {
          throw new Error("Permissions insuffisantes");
        },
    updateConfiguration: canModify
      ? updateConfiguration
      : async () => {
          throw new Error("Permissions insuffisantes");
        },
    deleteConfiguration: canModify
      ? deleteConfiguration
      : async () => {
          throw new Error("Permissions insuffisantes");
        },
    toggleConfiguration: canModify
      ? toggleConfiguration
      : async () => {
          throw new Error("Permissions insuffisantes");
        },

    // Utilitaires
    refreshAll,
    validateConfiguration,
    clearError,

    // Filters & Helpers
    getActiveConfigurations,
    getDefaultConfiguration,
  };
};
