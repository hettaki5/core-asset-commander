// src/services/assetService.ts - UPDATED WITH PDF REPORT INTEGRATION
import { buildUrl, getApiHeaders, getMultipartHeaders } from "@/config/api";
import { pdfReportService, type ReportConfig } from "./pdfReportService";
import type {
  AssetDto,
  ProductDto,
  SupplierDto,
  EquipmentDto,
  AssetStatus,
  AssetType,
  ValidationResponse,
  StatusResponse,
  ReportRequest,
  FieldUpdateRequest,
  ImageUploadResponse,
  ImageOperationResponse,
} from "@/types/backend";

class AssetService {
  // ========== ASSETS GÉNÉRAUX ==========

  async getAllAssets(): Promise<AssetDto[]> {
    const response = await fetch(buildUrl.asset(""), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des assets: ${response.status}`
      );
    }

    return response.json();
  }

  async getAssetById(id: string): Promise<AssetDto> {
    const response = await fetch(buildUrl.asset(`/${id}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Asset non trouvé");
      }
      throw new Error(
        `Erreur lors de la récupération de l'asset: ${response.status}`
      );
    }

    return response.json();
  }

  async createAsset(
    asset: Partial<AssetDto>,
    configurationName?: string,
    userId?: string,
    userFullName?: string
  ): Promise<AssetDto> {
    const url = new URL(buildUrl.asset(""));
    if (configurationName) {
      url.searchParams.append("configurationName", configurationName);
    }

    // Set default status to SUBMITTED for new assets and include user info
    const assetWithUserInfo = {
      ...asset,
      status: asset.status || ("SUBMITTED" as AssetStatus),
      createdBy: userFullName || asset.createdBy || "Unknown User",
    };

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(assetWithUserInfo),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la création de l'asset: ${response.status}`
      );
    }

    return response.json();
  }

  async updateAsset(id: string, asset: Partial<AssetDto>): Promise<AssetDto> {
    const response = await fetch(buildUrl.asset(`/${id}`), {
      method: "PUT",
      headers: getApiHeaders(),
      body: JSON.stringify(asset),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la mise à jour de l'asset: ${response.status}`
      );
    }

    return response.json();
  }

  async deleteAsset(id: string): Promise<void> {
    const response = await fetch(buildUrl.asset(`/${id}`), {
      method: "DELETE",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la suppression de l'asset: ${response.status}`
      );
    }
  }

  // ========== VALIDATION WORKFLOW ==========

  async submitForValidation(id: string): Promise<{ asset?: AssetDto }> {
    const response = await fetch(buildUrl.asset(`/${id}/submit`), {
      method: "POST",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la soumission: ${response.status}`);
    }

    return response.json();
  }

  async validateAsset(
    id: string,
    comment?: string
  ): Promise<{ asset?: AssetDto }> {
    const response = await fetch(buildUrl.asset(`/${id}/validate`), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        status: "APPROVED",
        comment: comment || "Asset approuvé par le validateur",
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la validation: ${response.status}`);
    }

    return response.json();
  }

  async rejectAsset(
    id: string,
    comment?: string
  ): Promise<{ asset?: AssetDto }> {
    const response = await fetch(buildUrl.asset(`/${id}/reject`), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        status: "REJECTED",
        comment: comment || "Asset rejeté par le validateur",
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du rejet: ${response.status}`);
    }

    return response.json();
  }

  // Alternative validation method that directly updates status
  async updateAssetStatus(
    id: string,
    status: AssetStatus,
    comment?: string
  ): Promise<AssetDto> {
    const response = await fetch(buildUrl.asset(`/${id}/status`), {
      method: "PATCH",
      headers: getApiHeaders(),
      body: JSON.stringify({
        status,
        comment,
        validatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la mise à jour du statut: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== ASSETS BY STATUS ==========

  async getAssetsByStatus(status: AssetStatus): Promise<AssetDto[]> {
    const response = await fetch(buildUrl.asset(`?status=${status}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des assets par statut: ${response.status}`
      );
    }

    return response.json();
  }

  async getPendingValidationAssets(): Promise<AssetDto[]> {
    return this.getAssetsByStatus("SUBMITTED");
  }

  async getApprovedAssets(): Promise<AssetDto[]> {
    return this.getAssetsByStatus("APPROVED");
  }

  async getRejectedAssets(): Promise<AssetDto[]> {
    return this.getAssetsByStatus("REJECTED");
  }

  // ========== PRODUCTS ==========

  async getAllProducts(): Promise<ProductDto[]> {
    const response = await fetch(buildUrl.asset("/products"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des produits: ${response.status}`
      );
    }

    return response.json();
  }

  async createProduct(
    product: Partial<ProductDto>,
    configurationName?: string,
    userId?: string,
    userFullName?: string
  ): Promise<ProductDto> {
    const url = new URL(buildUrl.asset("/products"));
    if (configurationName) {
      url.searchParams.append("configurationName", configurationName);
    }

    // Include user info for product creation
    const productWithUserInfo = {
      ...product,
      createdBy: userFullName || product.createdBy || "Unknown User",
    };

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(productWithUserInfo),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la création du produit: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== SUPPLIERS ==========

  async getAllSuppliers(): Promise<SupplierDto[]> {
    const response = await fetch(buildUrl.asset("/suppliers"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des fournisseurs: ${response.status}`
      );
    }

    return response.json();
  }

  async createSupplier(
    supplier: Partial<SupplierDto>,
    configurationName?: string,
    userId?: string,
    userFullName?: string
  ): Promise<SupplierDto> {
    const url = new URL(buildUrl.asset("/suppliers"));
    if (configurationName) {
      url.searchParams.append("configurationName", configurationName);
    }

    // Include user info for supplier creation
    const supplierWithUserInfo = {
      ...supplier,
      createdBy: userFullName || supplier.createdBy || "Unknown User",
    };

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(supplierWithUserInfo),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la création du fournisseur: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== EQUIPMENTS ==========

  async getAllEquipments(): Promise<EquipmentDto[]> {
    const response = await fetch(buildUrl.asset("/equipments"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des équipements: ${response.status}`
      );
    }

    return response.json();
  }

  async createEquipment(
    equipment: Partial<EquipmentDto>,
    configurationName?: string,
    userId?: string,
    userFullName?: string
  ): Promise<EquipmentDto> {
    const url = new URL(buildUrl.asset("/equipments"));
    if (configurationName) {
      url.searchParams.append("configurationName", configurationName);
    }

    // Include user info for equipment creation
    const equipmentWithUserInfo = {
      ...equipment,
      createdBy: userFullName || equipment.createdBy || "Unknown User",
    };

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(equipmentWithUserInfo),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la création de l'équipement: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== MES ASSETS ==========

  async getMyAssets(): Promise<AssetDto[]> {
    const response = await fetch(buildUrl.asset("/my-assets"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération de mes assets: ${response.status}`
      );
    }

    return response.json();
  }

  // ========== STATISTIQUES DASHBOARD ==========

  async getDashboardStats(): Promise<{
    totalAssets: number;
    pendingAssets: number;
    approvedAssets: number;
    rejectedAssets: number;
    myAssets: number;
  }> {
    try {
      const [allAssets, myAssets] = await Promise.all([
        this.getAllAssets(),
        this.getMyAssets().catch(() => []), // Fallback si pas d'assets personnels
      ]);

      return {
        totalAssets: allAssets.length,
        pendingAssets: allAssets.filter((a) =>
          ["SUBMITTED", "PENDING_VALIDATION"].includes(a.status)
        ).length,
        approvedAssets: allAssets.filter((a) => a.status === "APPROVED").length,
        rejectedAssets: allAssets.filter((a) => a.status === "REJECTED").length,
        myAssets: myAssets.length,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      // Retourner des stats par défaut en cas d'erreur
      return {
        totalAssets: 0,
        pendingAssets: 0,
        approvedAssets: 0,
        rejectedAssets: 0,
        myAssets: 0,
      };
    }
  }

  // ========== PDF REPORT GENERATION ==========

  async generateAssetReport(
    assetId: string,
    customConfig?: Partial<ReportConfig>
  ): Promise<void> {
    const asset = await this.getAssetById(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Convert AssetDto to LocalAssetDto format for PDF generation
    const localAsset = {
      ...asset,
      configurationId: asset.configurationId || "",
      formData: asset.formData || { sections: [] },
    };

    // Default company configuration - customize as needed
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
      pdfReportService.generateAssetReport(localAsset, finalConfig);
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

    // Generate individual reports for each asset
    for (const assetId of assetIds) {
      await this.generateAssetReport(assetId, customConfig);
    }
  }
}
