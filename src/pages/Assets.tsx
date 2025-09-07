// src/pages/Assets.tsx - COMPLETE UPDATED VERSION WITH PDF DOWNLOAD FUNCTIONALITY AND FIXES
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAssets } from "@/hooks/useAssets";
import { localAssetService } from "@/services/localAssetService";
import { assetService } from "@/services/assetService";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { LocalAssetDto } from "@/types/local-assets";
import { CreateNewAssetDialog } from "@/components/assets/CreateNewAssetDialog";
import { EditAssetDialog } from "@/components/assets/EditAssetDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  AlertTriangle,
  Send,
  FileText,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from "lucide-react";
import type { AssetDto, AssetStatus, AssetType } from "@/types/backend";
import { CreateAssetTypeDialog } from "@/components/configuration/CreateAssetTypeDialog";

export const Assets: React.FC = () => {
  const { user } = useAuth();
  const {
    assets,
    loading,
    error,
    stats,
    refreshAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    submitForValidation,
    validateAsset,
    rejectAsset,
  } = useAssets();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<LocalAssetDto | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AssetDto | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<LocalAssetDto | null>(null);
  const [downloadingAsset, setDownloadingAsset] = useState<string | null>(null);

  // Validation dialog states
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [assetToValidate, setAssetToValidate] = useState<AssetDto | null>(null);
  const [validationComment, setValidationComment] = useState("");
  const [validationAction, setValidationAction] = useState<
    "approve" | "reject" | null
  >(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Role-based filtering logic - wrapped in useCallback to fix dependency warnings
  const getCurrentUserFullName = useCallback(() => {
    return user ? `${user.firstName} ${user.lastName}` : "";
  }, [user]);

  const hasAdminValidatorRoles = useCallback(() => {
    return user?.roles.some((role) => ["admin", "validateur"].includes(role));
  }, [user?.roles]);

  const isAuditor = useCallback(() => {
    return user?.roles.includes("observateur");
  }, [user?.roles]);

  const isNormalUser = useCallback(() => {
    return user && !hasAdminValidatorRoles() && !isAuditor();
  }, [user, hasAdminValidatorRoles, isAuditor]);

  // Filter assets based on user role
  const getFilteredAssetsByRole = useCallback(
    (allAssets: LocalAssetDto[]) => {
      const currentUserFullName = getCurrentUserFullName();

      if (hasAdminValidatorRoles()) {
        // Admin/Validator: Show all assets
        return allAssets;
      } else if (isAuditor()) {
        // Auditor: Show only approved assets
        return allAssets.filter((asset) => asset.status === "APPROVED");
      } else if (isNormalUser()) {
        // Normal user: Show only assets created by them
        return allAssets.filter(
          (asset) => asset.createdBy === currentUserFullName
        );
      }

      // Fallback: show no assets if role is unclear
      return [];
    },
    [getCurrentUserFullName, hasAdminValidatorRoles, isAuditor, isNormalUser]
  );

  // Apply role-based filtering first, then search and filters
  const roleFilteredAssets = getFilteredAssetsByRole(assets);

  const filteredAssets = roleFilteredAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.reference &&
        asset.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;
    const matchesType = typeFilter === "all" || asset.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  // Calculate role-based stats
  const getRoleBasedStats = useCallback(() => {
    const roleAssets = getFilteredAssetsByRole(assets);

    if (isAuditor()) {
      // For auditors, all visible assets are approved, so adjust stats accordingly
      return {
        totalAssets: roleAssets.length,
        pendingAssets: 0, // Auditors don't see pending assets
        approvedAssets: roleAssets.length,
        rejectedAssets: 0, // Auditors don't see rejected assets
        myAssets: 0, // Not relevant for auditors
      };
    } else if (isNormalUser()) {
      // For normal users, calculate stats from their own assets only
      return {
        totalAssets: roleAssets.length,
        pendingAssets: roleAssets.filter((a) =>
          ["SUBMITTED", "PENDING_VALIDATION"].includes(a.status)
        ).length,
        approvedAssets: roleAssets.filter((a) => a.status === "APPROVED")
          .length,
        rejectedAssets: roleAssets.filter((a) => a.status === "REJECTED")
          .length,
        myAssets: roleAssets.length, // All visible assets are theirs
      };
    }

    // Admin/Validator: use original stats
    return stats;
  }, [getFilteredAssetsByRole, assets, isAuditor, isNormalUser, stats]);

  const roleBasedStats = getRoleBasedStats();

  // FIXED: Role checking - more precise permission logic
  const canCreateAsset = user?.roles.some((role) =>
    ["admin", "ingenieurpr"].includes(role)
  );

  // FIXED: Only users with "validateur" role can validate (admins can also validate)
  const canValidateAsset = user?.roles.some((role) =>
    ["admin", "validateur"].includes(role)
  );

  const canEditAsset = user?.roles.some((role) =>
    ["admin", "ingenieurpr"].includes(role)
  );

  // Allow deletion for all roles except validateur and observateur
  const canDeleteAsset = user?.roles.some(
    (role) => !["validateur", "observateur"].includes(role)
  );

  // Should hide status filter for auditors since they only see approved assets
  const shouldShowStatusFilter = !isAuditor();

  // Welcome log when entering Assets page
  useEffect(() => {
    if (user) {
      console.log(
        `🎉 Bienvenue ${user.firstName} ${user.lastName} sur la page Assets!`
      );
      console.log(`Rôle: ${user.roles.join(", ")}`);
      console.log(
        `Permissions: Create=${canCreateAsset}, Validate=${canValidateAsset}, Edit=${canEditAsset}, Delete=${canDeleteAsset}`
      );
      console.log(
        `Role Type: Admin/Validator=${hasAdminValidatorRoles()}, Auditor=${isAuditor()}, Normal=${isNormalUser()}`
      );
      console.log(
        `Assets visible: ${roleFilteredAssets.length}/${assets.length}`
      );
    }
  }, [
    user,
    canCreateAsset,
    canValidateAsset,
    canEditAsset,
    canDeleteAsset,
    roleFilteredAssets.length,
    assets.length,
    hasAdminValidatorRoles,
    isAuditor,
    isNormalUser,
  ]);

  // Check if user can edit specific asset (own assets for engineers)
  const canEditSpecificAsset = useCallback(
    (asset: AssetDto) => {
      if (user?.roles.includes("admin")) return true;
      if (
        user?.roles.includes("ingenieurpr") &&
        asset.createdBy === `${user.firstName} ${user.lastName}`
      )
        return true;
      return false;
    },
    [user]
  );

  // FIXED: More strict validation logic - only validators can validate specific assets
  const canValidateSpecificAsset = useCallback(
    (asset: AssetDto) => {
      // Must be ONLY a validator (not admin)
      const hasValidatorRole = user?.roles.includes("validateur");

      // Asset must be in the correct status for validation
      const isValidatableStatus = ["SUBMITTED", "PENDING_VALIDATION"].includes(
        asset.status
      );

      // Both conditions must be true
      return hasValidatorRole && isValidatableStatus;
    },
    [user?.roles]
  );

  // ADDITIONAL: Helper to check if current user is specifically a validator
  const isValidator = useCallback(() => {
    return user?.roles.includes("validateur");
  }, [user?.roles]);

  // Handle validation actions
  const handleOpenValidationDialog = (
    asset: AssetDto,
    action: "approve" | "reject"
  ) => {
    // Double check permissions before opening dialog
    if (!canValidateSpecificAsset(asset)) {
      toast.error("Vous n'avez pas les permissions pour valider cet asset");
      return;
    }

    setAssetToValidate(asset);
    setValidationAction(action);
    setValidationComment("");
    setValidationDialogOpen(true);
  };

  const handleConfirmValidation = async () => {
    if (!assetToValidate || !validationAction) return;

    // Final permission check
    if (!canValidateSpecificAsset(assetToValidate)) {
      toast.error("Vous n'avez pas les permissions pour valider cet asset");
      setValidationDialogOpen(false);
      return;
    }

    setActionLoading(assetToValidate.id);
    try {
      if (validationAction === "approve") {
        await validateAsset(assetToValidate.id);
        toast.success(`Asset "${assetToValidate.name}" approuvé avec succès`);
      } else {
        await rejectAsset(assetToValidate.id);
        toast.success(`Asset "${assetToValidate.name}" rejeté`);
      }

      await refreshAssets();
      setValidationDialogOpen(false);
      setAssetToValidate(null);
      setValidationAction(null);
      setValidationComment("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la validation"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Handle other actions
  const handleSubmitAsset = async (asset: AssetDto) => {
    if (asset.status !== "DRAFT") {
      toast.error("Seuls les assets en brouillon peuvent être soumis");
      return;
    }

    setActionLoading(asset.id);
    try {
      await submitForValidation(asset.id);
      toast.success(`Asset "${asset.name}" soumis pour validation avec succès`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la soumission"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAsset = async (asset: AssetDto) => {
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete) return;

    setActionLoading(assetToDelete.id);
    try {
      await deleteAsset(assetToDelete.id);
      toast.success(`Asset "${assetToDelete.name}" supprimé avec succès`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
    } finally {
      setActionLoading(null);
      setDeleteConfirmOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleViewAsset = (asset: LocalAssetDto) => {
    setSelectedAsset(asset);
  };

  const handleEditAsset = (asset: LocalAssetDto) => {
    setAssetToEdit(asset);
    setIsEditDialogOpen(true);
  };

  // NEW: Handle PDF Download
  const handleDownloadAsset = async (asset: AssetDto) => {
    setDownloadingAsset(asset.id);

    try {
      toast.info(`Génération du rapport PDF pour "${asset.name}"...`);

      // Check if we're using local assets
      const isLocalAsset = "configurationId" in asset;

      if (isLocalAsset) {
        // Use local asset service for local assets
        await localAssetService.generateAssetReport(asset.id, {
          companyName: "Product Lifecycle Management",
          companyAddress: `Généré par: ${getCurrentUserFullName()}\nDate: ${new Date().toLocaleDateString(
            "fr-FR"
          )}`,
          reportTitle: "RAPPORT D'ASSET",
          reportSubtitle: `${asset.type} - ${asset.name}`,
          headerColor: "#1DB584",
          accentColor: "#1DB584",
        });
        toast.success(`Rapport PDF généré avec succès pour "${asset.name}"`);
      } else {
        // Backend assets don't have PDF generation implemented yet
        console.log(
          `PDF generation requested for backend asset: ${asset.name} (ID: ${asset.id})`
        );
        toast.info(
          `Génération PDF non disponible pour les assets backend. Asset: "${asset.name}"`
        );
      }
    } catch (error) {
      console.error("Error generating PDF report:", error);
      toast.error(
        error instanceof Error
          ? `Erreur lors de la génération du PDF: ${error.message}`
          : "Erreur lors de la génération du rapport PDF"
      );
    } finally {
      setDownloadingAsset(null);
    }
  };

  const handleEditAssetSubmit = async (
    assetId: string,
    data: {
      name: string;
      description?: string;
      formData: {
        sections: any[];
      };
      images?: Record<string, File[]>;
    }
  ) => {
    try {
      setActionLoading(assetId);

      // Transform the formData to ensure all fields have a value property
      const formattedFormData = {
        sections: data.formData.sections.map((section) => ({
          id: section.id,
          name: section.name,
          fields: section.fields.map((field) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            required: field.required,
            value: field.value ?? "",
            options: field.options,
          })),
        })),
      };

      // Prepare update data with explicit type casting to resolve type conflicts
      const updateData = {
        name: data.name,
        description: data.description,
        formData: formattedFormData,
      } as any;

      await updateAsset(assetId, updateData);

      if (data.images && Object.keys(data.images).length > 0) {
        console.log("Images to upload:", data.images);
      }

      toast.success(`Asset "${data.name}" modifié avec succès`);
      await refreshAssets();
      setIsEditDialogOpen(false);
      setAssetToEdit(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la modification de l'asset"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateAsset = () => {
    setIsCreateDialogOpen(true);
  };

  // Status helper functions
  const getStatusColor = (status: AssetStatus): string => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500";
      case "SUBMITTED":
        return "bg-blue-500";
      case "PENDING_VALIDATION":
        return "bg-orange-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: AssetStatus): string => {
    switch (status) {
      case "PENDING_VALIDATION":
        return "Soumis";
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: AssetStatus) => {
    switch (status) {
      case "DRAFT":
        return <Edit className="h-3 w-3" />;
      case "SUBMITTED":
        return <Clock className="h-3 w-3" />;
      case "PENDING_VALIDATION":
        return <AlertTriangle className="h-3 w-3" />;
      case "APPROVED":
        return <CheckCircle className="h-3 w-3" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Assets</h1>
            <p className="text-muted-foreground">Une erreur s'est produite</p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Erreur: {error}</span>
            <Button variant="outline" size="sm" onClick={refreshAssets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Lifecycle Management</h1>
          <p className="text-muted-foreground">
            {isAuditor()
              ? "Consultation des équipements approuvés"
              : isNormalUser()
              ? "Gérez vos équipements et ressources"
              : "Gérez vos équipements et ressources"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAssets}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {canCreateAsset && (
            <Button onClick={handleCreateAsset}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Asset
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques - Role-based */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {isAuditor() ? "Assets Approuvés" : "Total Assets"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roleBasedStats.totalAssets}
                </div>
              </CardContent>
            </Card>

            {/* Hide pending stats for auditors */}
            {!isAuditor() && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Soumis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {roleBasedStats.pendingAssets}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {roleBasedStats.approvedAssets}
                </div>
              </CardContent>
            </Card>

            {/* Show different stats based on role */}
            {isNormalUser() ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {roleBasedStats.rejectedAssets}
                  </div>
                </CardContent>
              </Card>
            ) : isAuditor() ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Consultables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {roleBasedStats.totalAssets}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mes Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      assets.filter(
                        (a) =>
                          a.createdBy === `${user?.firstName} ${user?.lastName}`
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un asset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Hide status filter for auditors */}
            {shouldShowStatusFilter && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING_VALIDATION">Soumis</SelectItem>
                  <SelectItem value="APPROVED">Approuvé</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="PRODUCT">Produit</SelectItem>
                <SelectItem value="SUPPLIER">Fournisseur</SelectItem>
                <SelectItem value="EQUIPMENT">Équipement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table des assets */}
      <Card>
        <CardHeader>
          <CardTitle>
            Assets ({filteredAssets.length})
            {isAuditor() && (
              <Badge variant="outline" className="ml-2">
                Mode observateur - Assets Approuvés Uniquement
              </Badge>
            )}
            {isNormalUser() && (
              <Badge variant="outline" className="ml-2">
                Mes Assets
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Nom
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Référence
                    </TableHead>
                    {shouldShowStatusFilter && (
                      <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                        Statut
                      </TableHead>
                    )}
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Créé par
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Date de création
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAssets.map((asset, index) => (
                    <TableRow
                      key={asset.id}
                      className={`
                        border-b border-gray-100 
                        hover:bg-gray-50 
                        transition-colors 
                        duration-150 
                        ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}
                      `}
                    >
                      <TableCell className="font-medium py-4 px-6 text-gray-900 text-center">
                        {asset.name}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                          >
                            {asset.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        {asset.reference || "-"}
                      </TableCell>
                      {shouldShowStatusFilter && (
                        <TableCell className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            <Badge
                              className={`${getStatusColor(
                                asset.status
                              )} text-white flex items-center gap-1 font-medium px-3 py-1`}
                            >
                              {getStatusIcon(asset.status)}
                              {getStatusLabel(asset.status)}
                            </Badge>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        {asset.createdBy}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        {new Date(asset.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {/* View Asset */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAsset(asset)}
                            title="Voir les détails"
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit Asset - Not for auditors */}
                          {!isAuditor() && canEditSpecificAsset(asset) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAsset(asset)}
                              disabled={actionLoading === asset.id}
                              title="Modifier"
                              className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Submit for Validation - Not for auditors */}
                          {!isAuditor() &&
                            asset.status === "DRAFT" &&
                            canEditSpecificAsset(asset) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSubmitAsset(asset)}
                                disabled={actionLoading === asset.id}
                                title="Soumettre pour validation"
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}

                          {/* Validation Actions - Only for validators on SUBMITTED/PENDING assets */}
                          {!isAuditor() && canValidateSpecificAsset(asset) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleOpenValidationDialog(asset, "approve")
                                }
                                disabled={actionLoading === asset.id}
                                title="Approuver"
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleOpenValidationDialog(asset, "reject")
                                }
                                disabled={actionLoading === asset.id}
                                title="Rejeter"
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {/* Delete Asset - Not for auditors */}
                          {!isAuditor() && canDeleteAsset && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAsset(asset)}
                              title="Supprimer"
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Download Asset - Enhanced with PDF generation */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadAsset(asset)}
                            disabled={downloadingAsset === asset.id}
                            title="Télécharger le rapport PDF"
                            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
                          >
                            {downloadingAsset === asset.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && filteredAssets.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Affichage de {startIndex + 1} à{" "}
                {Math.min(endIndex, filteredAssets.length)} sur{" "}
                {filteredAssets.length} résultats
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {filteredAssets.length === 0 && !loading && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isAuditor()
                  ? "Aucun asset approuvé trouvé"
                  : isNormalUser()
                  ? "Aucun asset créé"
                  : "Aucun asset trouvé"}
              </h3>
              <p className="text-gray-500 mb-6">
                {isAuditor()
                  ? "Aucun asset approuvé ne correspond aux filtres actuels"
                  : isNormalUser()
                  ? "Vous n'avez créé aucun asset pour le moment"
                  : "Aucun asset ne correspond aux filtres actuels"}
              </p>
              {canCreateAsset && !isAuditor() && (
                <div className="mt-4">
                  <Button
                    onClick={handleCreateAsset}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isNormalUser()
                      ? "Créer votre premier asset"
                      : "Créer le premier asset"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Dialog */}
      <Dialog
        open={validationDialogOpen}
        onOpenChange={setValidationDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationAction === "approve" ? "Approuver" : "Rejeter"} l'asset
            </DialogTitle>
            <DialogDescription>
              {validationAction === "approve"
                ? `Êtes-vous sûr de vouloir approuver l'asset "${assetToValidate?.name}" ?`
                : `Êtes-vous sûr de vouloir rejeter l'asset "${assetToValidate?.name}" ?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="validation-comment">
                Commentaire{" "}
                {validationAction === "reject" ? "(requis)" : "(optionnel)"}
              </Label>
              <Textarea
                id="validation-comment"
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                placeholder={
                  validationAction === "approve"
                    ? "Ajouter un commentaire sur l'approbation..."
                    : "Expliquer les raisons du rejet..."
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setValidationDialogOpen(false)}
              disabled={actionLoading === assetToValidate?.id}
            >
              Annuler
            </Button>
            <Button
              variant={
                validationAction === "approve" ? "default" : "destructive"
              }
              onClick={handleConfirmValidation}
              disabled={
                actionLoading === assetToValidate?.id ||
                (validationAction === "reject" && !validationComment.trim())
              }
            >
              {actionLoading === assetToValidate?.id ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : validationAction === "approve" ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {actionLoading === assetToValidate?.id
                ? "En cours..."
                : validationAction === "approve"
                ? "Approuver"
                : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'asset "{assetToDelete?.name}"
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={actionLoading === assetToDelete?.id}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAsset}
              disabled={actionLoading === assetToDelete?.id}
            >
              {actionLoading === assetToDelete?.id
                ? "Suppression..."
                : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation des détails avec images améliorées */}
      {selectedAsset && (
        <Dialog
          open={!!selectedAsset}
          onOpenChange={() => setSelectedAsset(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAsset.name}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadAsset(selectedAsset)}
                  disabled={downloadingAsset === selectedAsset.id}
                  className="ml-auto"
                >
                  {downloadingAsset === selectedAsset.id ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  Télécharger PDF
                </Button>
              </DialogTitle>
              <DialogDescription>
                Détails de l'asset {selectedAsset.type}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <label className="text-sm font-medium block">Type</label>
                  <Badge variant="outline" className="mt-1">
                    {selectedAsset.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium block">Référence</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAsset.reference || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block">Statut</label>
                  <Badge
                    className={`mt-1 ${getStatusColor(
                      selectedAsset.status
                    )} text-white flex items-center gap-1 w-fit`}
                  >
                    {getStatusIcon(selectedAsset.status)}
                    {getStatusLabel(selectedAsset.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium block">Créé par</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAsset.createdBy}
                  </p>
                </div>
              </div>

              {selectedAsset.description && (
                <div className="p-4 border rounded-lg">
                  <label className="text-sm font-medium block mb-2">
                    Description
                  </label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAsset.description}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <label className="text-xs font-medium block">Créé le</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedAsset.createdAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium block">
                    Modifié le
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAsset.updatedAt &&
                    selectedAsset.updatedAt !== selectedAsset.createdAt
                      ? new Date(selectedAsset.updatedAt).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Configuration Form Data with Enhanced Image Display */}
              {selectedAsset.formData && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Voir les détails du formulaire
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {selectedAsset.formData.sections.map((section) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4">
                          {section.name}
                        </h3>
                        <div className="grid gap-4">
                          {section.fields.map((field) => (
                            <div key={field.id} className="space-y-2">
                              <Label className="text-sm font-medium">
                                {field.name}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </Label>

                              {field.type === "image" ? (
                                <div className="space-y-3">
                                  {Array.isArray(field.value) &&
                                  field.value.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {(field.value as string[]).map(
                                        (url, index) => (
                                          <div
                                            key={index}
                                            className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors"
                                          >
                                            <img
                                              src={url}
                                              alt={`${field.name} ${index + 1}`}
                                              className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform"
                                              onClick={() => {
                                                // Create a modal to view full-size image
                                                const modal =
                                                  document.createElement("div");
                                                modal.className =
                                                  "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4";
                                                modal.innerHTML = `
                                                  <div class="relative max-w-4xl max-h-full">
                                                    <img src="${url}" alt="${field.name}" class="max-w-full max-h-full object-contain rounded-lg" />
                                                    <button class="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 font-bold">×</button>
                                                  </div>
                                                `;
                                                document.body.appendChild(
                                                  modal
                                                );
                                                modal.addEventListener(
                                                  "click",
                                                  (e) => {
                                                    // Fixed type error: check target before accessing tagName
                                                    const target =
                                                      e.target as HTMLElement;
                                                    if (
                                                      e.target === modal ||
                                                      target.tagName ===
                                                        "BUTTON"
                                                    ) {
                                                      document.body.removeChild(
                                                        modal
                                                      );
                                                    }
                                                  }
                                                );
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                              {index + 1}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border-2 border-dashed border-gray-200">
                                      Aucune image disponible
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                                  {field.value || "-"}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                Fermer
              </Button>
              {!isAuditor() && canEditSpecificAsset(selectedAsset) && (
                <Button
                  onClick={() => {
                    setSelectedAsset(null);
                    handleEditAsset(selectedAsset);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create New Asset Dialog - Not for auditors */}
      {!isAuditor() && (
        <CreateNewAssetDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={async (data) => {
            try {
              const formattedFormData = {
                sections: data.formData.sections.map((section) => ({
                  id: section.id,
                  name: section.name,
                  fields: section.fields.map((field) => ({
                    id: field.id,
                    name: field.name,
                    type: field.type,
                    required: field.required,
                    value: field.value ?? "",
                    options: field.options,
                  })),
                })),
              };

              // This will now automatically use the logged-in user's info
              await createAsset({
                name: data.name,
                type: data.type,
                configurationId: data.configurationId,
                description: data.description,
                formData: formattedFormData,
                images: data.images,
              });

              toast.success(`Asset "${data.name}" créé avec succès`);
              await refreshAssets();
              setIsCreateDialogOpen(false);
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Erreur lors de la création de l'asset"
              );
            }
          }}
        />
      )}

      {/* Edit Asset Dialog - Not for auditors */}
      {!isAuditor() && assetToEdit && (
        <EditAssetDialog
          asset={assetToEdit}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditAssetSubmit}
        />
      )}
    </div>
  );
};
