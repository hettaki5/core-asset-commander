// src/services/localAssetService.ts - UPDATED WITH PDF REPORT INTEGRATION
import { v4 as uuidv4 } from "uuid";
import { localConfigService } from "./localConfigService";
import { pdfReportService, type ReportConfig } from "./pdfReportService";
import type {
  AssetDto,
  AssetType,
  AssetStatus,
  ConfigurationSummaryDto,
} from "@/types/backend";

// Storage keys
const ASSETS_STORAGE_KEY = "local-assets";
const ASSET_IMAGES_STORAGE_KEY = "local-asset-images";

export interface AssetFormData {
  sections: {
    id: string;
    name: string;
    fields: {
      id: string;
      name: string;
      type: string;
      value: string | string[]; // Can be a string for regular fields or array of image URLs for image fields
      required: boolean;
    }[];
  }[];
}

export interface LocalAssetDto extends AssetDto {
  configurationId: string;
  formData: AssetFormData;
}

export class LocalAssetService {
  private generateReference(type: AssetType, name: string): string {
    const prefix =
      type === "PRODUCT" ? "PROD" : type === "SUPPLIER" ? "SUPP" : "EQUIP";

    // Get existing assets of this type to determine the sequence number
    const assets = this.getStoredAssets().filter((a) => a.type === type);
    const sequence = (assets.length + 1).toString().padStart(3, "0");

    // Take first 4 characters of name (uppercase), remove special characters
    const namePrefix = name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4);

    return `${prefix}-${namePrefix}-${sequence}`;
  }

  private getStoredAssets(): LocalAssetDto[] {
    const stored = localStorage.getItem(ASSETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveAssets(assets: LocalAssetDto[]): void {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
  }

  private getStoredImages(): Record<string, string[]> {
    const stored = localStorage.getItem(ASSET_IMAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private saveImages(images: Record<string, string[]>): void {
    localStorage.setItem(ASSET_IMAGES_STORAGE_KEY, JSON.stringify(images));
  }

  async getAllAssets(): Promise<LocalAssetDto[]> {
    return this.getStoredAssets();
  }

  async getAssetsByType(type: AssetType): Promise<LocalAssetDto[]> {
    return this.getStoredAssets().filter((asset) => asset.type === type);
  }

  async getAssetById(id: string): Promise<LocalAssetDto | null> {
    const asset = this.getStoredAssets().find((a) => a.id === id);
    return asset || null;
  }

  async createAsset(data: {
    name: string;
    type: AssetType;
    configurationId: string;
    description?: string;
    formData: AssetFormData;
    images?: Record<string, File[]>; // Field ID -> Files mapping
    createdBy?: string; // ADDED: Accept createdBy parameter
  }): Promise<LocalAssetDto> {
    // Get the configuration
    const config = await localConfigService.getConfigurationById(
      data.configurationId
    );
    if (!config) {
      throw new Error("Configuration not found");
    }

    // Process images if any
    const processedImages: Record<string, string[]> = {};
    if (data.images) {
      for (const [fieldId, files] of Object.entries(data.images)) {
        processedImages[fieldId] = await Promise.all(
          files.map(async (file) => {
            // Convert image to base64
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
      }
    }

    // Store images separately to avoid localStorage size issues
    const storedImages = this.getStoredImages();
    const assetId = uuidv4();
    if (Object.keys(processedImages).length > 0) {
      storedImages[assetId] = Object.values(processedImages).flat();
      this.saveImages(storedImages);
    }

    const newAsset: LocalAssetDto = {
      id: assetId,
      name: data.name,
      type: data.type,
      configurationId: data.configurationId,
      reference: this.generateReference(data.type, data.name),
      description: data.description || "",
      status: "PENDING_VALIDATION" as AssetStatus,
      formData: {
        ...data.formData,
        sections: data.formData.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) => ({
            ...field,
            value: processedImages[field.id] || field.value,
          })),
        })),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || "local-user", // FIXED: Use provided createdBy or fallback to 'local-user'
      hasImage: Object.keys(processedImages).length > 0,
      imageUrl: Object.values(processedImages).flat()[0] || undefined, // First image as the main image if it exists
    };

    const assets = this.getStoredAssets();
    assets.push(newAsset);
    this.saveAssets(assets);

    return newAsset;
  }

  async updateAsset(
    id: string,
    updates: Partial<LocalAssetDto>
  ): Promise<LocalAssetDto> {
    const assets = this.getStoredAssets();
    const index = assets.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error("Asset not found");
    }

    // Handle image updates if any
    if (updates.formData) {
      const storedImages = this.getStoredImages();
      // Update stored images if needed
      storedImages[id] = Object.values(updates.formData.sections || {})
        .flatMap((section) => section.fields)
        .filter((field) => field.type === "image")
        .flatMap((field) => field.value as string[]);
      this.saveImages(storedImages);
    }

    const storedImages = this.getStoredImages();
    const hasImages = storedImages[id] && storedImages[id].length > 0;

    const updatedAsset = {
      ...assets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      hasImage: hasImages,
      updatedBy: "local-user",
    };

    assets[index] = updatedAsset;
    this.saveAssets(assets);

    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    const assets = this.getStoredAssets().filter((a) => a.id !== id);
    this.saveAssets(assets);

    // Clean up stored images
    const storedImages = this.getStoredImages();
    delete storedImages[id];
    this.saveImages(storedImages);
  }

  async getDashboardStats(): Promise<{
    totalAssets: number;
    pendingAssets: number;
    approvedAssets: number;
    rejectedAssets: number;
  }> {
    const assets = this.getStoredAssets();
    return {
      totalAssets: assets.length,
      pendingAssets: assets.filter((a) => a.status === "PENDING_VALIDATION")
        .length,
      approvedAssets: assets.filter((a) => a.status === "APPROVED").length,
      rejectedAssets: assets.filter((a) => a.status === "REJECTED").length,
    };
  }

  // NEW: PDF Report Generation Methods
  async generateAssetReport(
    assetId: string,
    customConfig?: Partial<ReportConfig>
  ): Promise<void> {
    const asset = await this.getAssetById(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Default company configuration - you can customize this
    const defaultReportConfig: ReportConfig = {
      companyName: "Product Lifecycle Management",
      companyAddress: "Digital Asset Management\nSystem Report",
      reportTitle: "ASSET REPORT",
      reportSubtitle: `Asset ID: ${asset.reference || asset.id}`,
      headerColor: "#1DB584",
      accentColor: "#1DB584",
    };

    const finalConfig = { ...defaultReportConfig, ...customConfig };

    try {
      pdfReportService.generateAssetReport(asset, finalConfig);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      throw new Error("Failed to generate PDF report");
    }
  }

  async generateBulkReport(
    assetIds: string[],
    customConfig?: Partial<ReportConfig>
  ): Promise<void> {
    if (assetIds.length === 0) {
      throw new Error("No assets selected for report generation");
    }

    // For bulk reports, we could extend the PDF service to handle multiple assets
    // For now, let's generate individual reports
    for (const assetId of assetIds) {
      await this.generateAssetReport(assetId, customConfig);
    }
  }

  // Helper method to check if asset has images for better report formatting
  async getAssetWithImages(assetId: string): Promise<LocalAssetDto | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return null;

    // Ensure images are properly loaded from storage
    const storedImages = this.getStoredImages();
    if (storedImages[assetId]) {
      // Update form data with proper image URLs
      asset.formData.sections = asset.formData.sections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => {
          if (field.type === "image" && storedImages[assetId]) {
            return {
              ...field,
              value: storedImages[assetId],
            };
          }
          return field;
        }),
      }));
    }

    return asset;
  }
}

// Export a singleton instance
export const localAssetService = new LocalAssetService();
