// src/types/backend.ts - VERSION CORRIGÉE pour correspondre aux DTOs Java

export type AssetStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_VALIDATION"
  | "APPROVED"
  | "REJECTED";
export type AssetType = "PRODUCT" | "SUPPLIER" | "EQUIPMENT";
export type FieldType =
  | "STRING"
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "DECIMAL"
  | "INTEGER"
  | "DATE"
  | "BOOLEAN"
  | "SELECT";
export type ConfigurationStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ARCHIVED"
  | "DEPRECATED";

// ========== CONFIGURATION DTOs (CORRECTS) ==========

// ✅ CORRESPOND À FieldConfiguration.java
export interface ConfigurationDto {
  id?: string;
  configurationName: string; // ✅ Nom correct du DTO Java
  entityType: string; // ✅ Correspond au DTO
  displayName?: string;
  description?: string;
  sections: SectionConfigurationDto[];
  active: boolean;
  defaultConfig: boolean;
  status: ConfigurationStatus;
  version?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Champs d'audit
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  // Statistiques
  usageCount?: number;
  lastUsedAt?: string;
}

// ✅ CORRESPOND À ConfigurationSummaryDto.java
export interface ConfigurationSummaryDto {
  id: string;
  configurationName: string; // ✅ Nom correct
  entityType: string; // ✅ Correspond
  displayName?: string;
  description?: string;
  active: boolean;
  defaultConfig: boolean;
  status?: ConfigurationStatus;
  version?: string;
  tags?: string[];

  // Statistiques calculées
  sectionCount: number;
  totalFieldCount: number; // ✅ Utilisé dans votre UI
  usageCount?: number;

  // Audit info
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  lastUsedAt?: string;
}

// ✅ CORRESPOND À SectionConfiguration.java
export interface SectionConfigurationDto {
  sectionName: string; // ✅ Nom correct
  sectionLabel?: string;
  description?: string;
  selectedFields: string[]; // ✅ Liste des noms de champs
  displayOrder?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  required?: boolean;
  icon?: string;
  cssClass?: string;
  metadata?: Record<string, unknown>;
}

// ✅ CORRESPOND À FieldMetadata.java
export interface FieldMetadataDto {
  id?: string;
  fieldName: string;
  entityType: string;
  fieldType: FieldType;
  label: string;
  description?: string;
  required: boolean;
  group?: string;
  displayOrder?: number;
  constraints?: Record<string, unknown>;
  allowedValues?: string[];
  defaultValue?: string;
  searchable?: boolean;
  sortable?: boolean;
}

// ========== REQUEST DTOs (CORRECTS) ==========

// ✅ CORRESPOND À ConfigurationCreateRequest.java
export interface ConfigurationCreateRequest {
  configurationName: string; // ✅ Nom correct
  entityType: string; // ✅ String, pas AssetType enum
  displayName?: string;
  description?: string;
  sections: SectionConfigurationDto[];
  active?: boolean;
  defaultConfig?: boolean;
  version?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ✅ CORRESPOND À ConfigurationUpdateRequest.java
export interface ConfigurationUpdateRequest {
  displayName?: string;
  description?: string;
  sections: SectionConfigurationDto[];
  active: boolean;
  version?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// ✅ CORRESPOND À FormGenerationRequest.java
export interface FormGenerationRequest {
  entityType: string; // ✅ String dans Java
  configurationName?: string;
  customOptions?: Record<string, unknown>;
  includeFields?: string[];
  excludeFields?: string[];
  requiredFields?: string[];
  readOnlyFields?: string[];
  hideOptionalFields?: boolean;
  groupBySection?: boolean;
  showFieldDescriptions?: boolean;
  sectionOrder?: string[];
  enableClientValidation?: boolean;
  enableServerValidation?: boolean;
  formTitle?: string;
  formDescription?: string;
  formVersion?: string;
  contextData?: Record<string, unknown>;
}

// ✅ CORRESPOND À ValidationRequest.java
export interface ValidationRequest {
  entityType: string; // ✅ String dans Java
  data: Record<string, unknown>;
  configurationName?: string;
  strictValidation?: boolean;
  validateRequired?: boolean;
  validateConstraints?: boolean;
  validateAllowedValues?: boolean;
  validateDependencies?: boolean;
  fieldsToValidate?: string[];
  fieldsToIgnore?: string[];
  partialValidation?: boolean;
  validationContext?: string;
  assetId?: string;
  existingData?: Record<string, unknown>;
  returnDetailedErrors?: boolean;
  returnWarnings?: boolean;
  stopOnFirstError?: boolean;
  locale?: string;
}

// ========== FORM DTOs (CORRECTS) ==========

// ✅ CORRESPOND À ConfigService.FormFieldDto
export interface FormFieldDto {
  fieldName: string;
  fieldType: string; // ✅ String dans Java
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  allowedValues?: string[];
  constraints?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ✅ CORRESPOND À ConfigService.FormSectionDto
export interface FormSectionDto {
  sectionName: string;
  sectionLabel: string;
  fields: FormFieldDto[];
  required: boolean;
  collapsible: boolean;
  displayOrder?: number;
}

// ✅ CORRESPOND À ConfigService.FormDefinitionDto
export interface FormDefinitionDto {
  entityType: string;
  configurationName: string;
  sections: FormSectionDto[];
  metadata?: Record<string, unknown>;
}

// ========== RESPONSE DTOs (CORRECTS) ==========

// ✅ CORRESPOND À ConfigService.ValidationResult
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ========== ASSET DTOs (INCHANGÉS - CORRECTS) ==========
export interface AssetDto {
  id: string;
  name: string;
  reference: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  deletedBy?: string;
  deletedAt?: string;
  status: AssetStatus;
  type: AssetType;
  configurationUsed?: string;
  imageUrl?: string;
  hasImage: boolean;
  originalFileName?: string;
  imageContentType?: string;
  imageSize?: number;
  imageUploadedAt?: string;
  imageUploadedBy?: string;
}

export interface ProductDto extends AssetDto {
  category?: string;
  brand?: string;
  model?: string;
  price?: number;
  manufactureDate?: string;
  country?: string;
  color?: string;
  size?: string;
  gender?: string;
  supplierId?: string;
  supplier?: SupplierDto;
}

export interface SupplierDto extends AssetDto {
  supplierType?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  contactPerson?: string;
  mainAddress?: string;
  equipmentSupplier: boolean;
  productSupplier: boolean;
  rating?: number;
  additionalData?: string;
}

export interface EquipmentDto extends AssetDto {
  serialNumber?: string;
  location?: string;
  installationDate?: string;
  warrantyEndDate?: string;
  maintenanceStatus?: string;
  supplierId?: string;
  supplier?: SupplierDto;
}

// ========== UTILITY TYPES ==========
export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Types pour les réponses spécifiques
export interface ValidationResponse {
  status: string;
  message: string;
  asset?: AssetDto;
}

export interface StatusResponse {
  status: string;
  message: string;
  assetStatus?: AssetStatus;
}

export interface ImageUploadResponse {
  status: string;
  message: string;
  imageUrl: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
}

export interface ImageOperationResponse {
  status: string;
  message: string;
}

export interface ReportDto {
  reportId: string;
  title: string;
  format: string;
  assetType: string;
  totalRecords: number;
  generatedAt: string;
  generatedBy: string;
  filters?: Record<string, unknown>;
  fileSizeBytes: number;
  downloadUrl?: string;
}

export interface ReportRequest {
  format: string;
  assetType: string;
  title?: string;
  statuses?: string[];
  dateFrom?: string;
  dateTo?: string;
  assetIds?: string[];
  category?: string;
  brand?: string;
  country?: string;
  supplierType?: string;
  location?: string;
  maintenanceStatus?: string;
  includeDeleted?: boolean;
  includeAuditInfo?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface FieldUpdateRequest {
  value: unknown;
}
