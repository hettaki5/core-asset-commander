// 1. CORRECTION MAJEURE: configService.ts - URLs et méthodes
// src/services/configService.ts - VERSION CORRIGÉE

import { buildUrl, getApiHeaders } from "@/config/api";
import type {
  ConfigurationDto,
  ConfigurationSummaryDto,
  ConfigurationCreateRequest,
  ConfigurationUpdateRequest,
  FormDefinitionDto,
  ValidationRequest,
  ValidationResult,
} from "@/types/backend";

class ConfigService {
  // ========== CORRECTION 1: URLS DES CONFIGURATIONS (ADMIN CRUD) ==========

  // ✅ CORRECT: Utiliser config-service via gateway pour les opérations ADMIN
  async getAllConfigurations(
    entityType: string
  ): Promise<ConfigurationSummaryDto[]> {
    const response = await fetch(
      buildUrl.config(`/${entityType}`), // ✅ /api/config/PRODUCT
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des configurations: ${response.status}`
      );
    }

    return response.json();
  }

  async getConfigurationById(
    entityType: string,
    configurationName: string
  ): Promise<ConfigurationDto> {
    const response = await fetch(
      buildUrl.config(`/${entityType}/${configurationName}`), // ✅ /api/config/PRODUCT/Product-Vetement
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Configuration non trouvée");
      }
      throw new Error(
        `Erreur lors de la récupération de la configuration: ${response.status}`
      );
    }

    return response.json();
  }

  async getDefaultConfiguration(entityType: string): Promise<ConfigurationDto> {
    const response = await fetch(
      buildUrl.config(`/${entityType}/default`), // ✅ /api/config/PRODUCT/default
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Aucune configuration par défaut trouvée");
      }
      throw new Error(
        `Erreur lors de la récupération de la configuration par défaut: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== CORRECTION 2: MÉTHODES ADMIN CRUD ==========

  async createConfiguration(
    request: ConfigurationCreateRequest
  ): Promise<ConfigurationDto> {
    const response = await fetch(buildUrl.config(""), {
      // ✅ POST /api/config
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Erreur lors de la création de la configuration: ${response.status}`
      );
    }

    return response.json();
  }

  async updateConfiguration(
    configId: string,
    request: ConfigurationUpdateRequest
  ): Promise<ConfigurationDto> {
    const response = await fetch(buildUrl.config(`/${configId}`), {
      // ✅ PUT /api/config/{id}
      method: "PUT",
      headers: getApiHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Erreur lors de la mise à jour de la configuration: ${response.status}`
      );
    }

    return response.json();
  }

  async deleteConfiguration(
    configId: string
  ): Promise<{ message: string; configId: string }> {
    const response = await fetch(buildUrl.config(`/${configId}`), {
      // ✅ DELETE /api/config/{id}
      method: "DELETE",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Erreur lors de la suppression de la configuration: ${response.status}`
      );
    }

    return response.json();
  }

  async toggleConfiguration(
    configId: string,
    active: boolean
  ): Promise<ConfigurationDto> {
    const url = new URL(buildUrl.config(`/${configId}/toggle`)); // ✅ POST /api/config/{id}/toggle
    url.searchParams.append("active", active.toString());

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Erreur lors du basculement de la configuration: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== CORRECTION 3: GÉNÉRATION DE FORMULAIRES ==========

  async generateDefaultForm(entityType: string): Promise<FormDefinitionDto> {
    const response = await fetch(
      buildUrl.config(`/form/${entityType}/default`), // ✅ NOUVEAU: /api/form/{entityType}/default
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la génération du formulaire par défaut: ${response.status}`
      );
    }

    return response.json();
  }

  async generateForm(
    entityType: string,
    configurationName: string
  ): Promise<FormDefinitionDto> {
    const response = await fetch(
      buildUrl.config(`/form/${entityType}/${configurationName}`), // ✅ /api/form/{entityType}/{config}
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la génération du formulaire: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== CORRECTION 4: VALIDATION ==========

  async validateConfiguration(
    request: ConfigurationCreateRequest
  ): Promise<ValidationResult> {
    const response = await fetch(
      buildUrl.config("/validate"), // ✅ POST /api/config/validate
      {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de la validation: ${response.status}`);
    }

    return response.json();
  }

  // ========== CORRECTION 5: STATISTIQUES ET UTILITAIRES ==========

  async getConfigurationStats(): Promise<Record<string, unknown>> {
    const response = await fetch(buildUrl.config("/stats"), {
      // ✅ GET /api/config/stats
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des statistiques: ${response.status}`
      );
    }

    return response.json();
  }

  async syncConfigurations(): Promise<Record<string, string>> {
    const response = await fetch(buildUrl.config("/sync-metadata"), {
      // ✅ POST /api/config/sync-metadata
      method: "POST",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la synchronisation: ${response.status}`);
    }

    return response.json();
  }

  async initializeDefaults(): Promise<Record<string, string>> {
    const response = await fetch(buildUrl.config("/init-defaults"), {
      // ✅ POST /api/config/init-defaults
      method: "POST",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'initialisation: ${response.status}`);
    }

    return response.json();
  }

  // ========== CORRECTION 6: HEALTH CHECK ==========

  async checkHealth(): Promise<Record<string, unknown>> {
    const response = await fetch(buildUrl.config("/../metadata/health"), {
      // ✅ /api/metadata/health
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la vérification de santé: ${response.status}`
      );
    }

    return response.json();
  }
}

export const configService = new ConfigService();
