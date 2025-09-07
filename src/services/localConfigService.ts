import { v4 as uuidv4 } from 'uuid';
import type { AssetType, ConfigurationSummaryDto } from "@/types/backend";

// Storage keys
const CONFIG_STORAGE_KEY = 'asset-configurations';
const ENTITY_TYPES_KEY = 'asset-entity-types';

// Default entity types
const DEFAULT_ENTITY_TYPES: AssetType[] = ['PRODUCT', 'SUPPLIER', 'EQUIPMENT'];

export class LocalConfigService {
  constructor() {
    this.initializeEntityTypes();
  }

  // Initialize entity types if not already present
  private initializeEntityTypes(): void {
    if (!localStorage.getItem(ENTITY_TYPES_KEY)) {
      localStorage.setItem(ENTITY_TYPES_KEY, JSON.stringify(DEFAULT_ENTITY_TYPES));
    }
  }

  // Get available entity types
  getEntityTypes(): AssetType[] {
    const types = localStorage.getItem(ENTITY_TYPES_KEY);
    return types ? JSON.parse(types) : DEFAULT_ENTITY_TYPES;
  }

  // Get all stored configurations
  private getStoredConfigs(): ConfigurationSummaryDto[] {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Save configurations to localStorage
  private saveConfigs(configs: ConfigurationSummaryDto[]): void {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
  }

  // Get configurations for a specific entity type
  async getAllConfigurations(entityType: AssetType): Promise<ConfigurationSummaryDto[]> {
    const configs = this.getStoredConfigs();
    return configs.filter(config => config.entityType === entityType);
  }

  // Create a new configuration
  async createConfiguration(config: Omit<ConfigurationSummaryDto, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ConfigurationSummaryDto> {
    const configs = this.getStoredConfigs();
    
    // Check if it should be the default config for this entity type
    const isFirstOfType = !configs.some(c => c.entityType === config.entityType);
    
    const newConfig: ConfigurationSummaryDto = {
      ...config,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      active: true,
      defaultConfig: isFirstOfType
    };

    configs.push(newConfig);
    this.saveConfigs(configs);
    return newConfig;
  }

  // Toggle configuration active state
  async toggleConfiguration(configId: string, active: boolean): Promise<void> {
    const configs = this.getStoredConfigs();
    const index = configs.findIndex(c => c.id === configId);
    
    if (index === -1) {
      throw new Error('Configuration not found');
    }

    // If we're deactivating the default config, throw an error
    if (!active && configs[index].defaultConfig) {
      throw new Error('Cannot deactivate the default configuration');
    }

    configs[index] = {
      ...configs[index],
      active,
      updatedAt: new Date().toISOString()
    };

    this.saveConfigs(configs);
  }

  // Delete a configuration
  async deleteConfiguration(configId: string): Promise<void> {
    const configs = this.getStoredConfigs();
    const configToDelete = configs.find(c => c.id === configId);

    if (!configToDelete) {
      throw new Error('Configuration not found');
    }

    // Prevent deletion of default configurations
    if (configToDelete.defaultConfig) {
      throw new Error('Cannot delete the default configuration');
    }

    const filteredConfigs = configs.filter(c => c.id !== configId);
    this.saveConfigs(filteredConfigs);
  }

  // Update an existing configuration
  async updateConfiguration(configId: string, updates: Partial<Omit<ConfigurationSummaryDto, 'id' | 'createdAt' | 'defaultConfig'>>): Promise<ConfigurationSummaryDto> {
    const configs = this.getStoredConfigs();
    const index = configs.findIndex(c => c.id === configId);
    
    if (index === -1) {
      throw new Error('Configuration not found');
    }

    const updatedConfig = {
      ...configs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      // Preserve these fields
      id: configs[index].id,
      createdAt: configs[index].createdAt,
      defaultConfig: configs[index].defaultConfig
    };

    configs[index] = updatedConfig;
    this.saveConfigs(configs);
    return updatedConfig;
  }

  // Get a specific configuration by ID
  async getConfigurationById(configId: string): Promise<ConfigurationSummaryDto | null> {
    const configs = this.getStoredConfigs();
    return configs.find(c => c.id === configId) || null;
  }

  // Clear all configurations (useful for testing or reset functionality)
  async clearAllConfigurations(): Promise<void> {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }

  // Reset to initial state (clear configs and reset entity types to default)
  async resetToInitialState(): Promise<void> {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.setItem(ENTITY_TYPES_KEY, JSON.stringify(DEFAULT_ENTITY_TYPES));
  }
}

// Export a singleton instance
export const localConfigService = new LocalConfigService();
