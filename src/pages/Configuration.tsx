// src/pages/Configuration.tsx - ENHANCED WITH ASSETS-STYLE TABLE AND PAGINATION
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { localConfigService } from "@/services/localConfigService";
import { CreateConfigurationDialog } from "@/components/configuration/CreateConfigurationDialog";
import { EditConfigurationDialog } from "@/components/configuration/EditConfigurationDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Settings,
  Edit,
  RefreshCw,
  AlertTriangle,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import type { AssetType, ConfigurationSummaryDto } from "@/types/backend";

export const Configuration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEntityType, setSelectedEntityType] =
    useState<AssetType>("PRODUCT");
  const [configurations, setConfigurations] = useState<
    ConfigurationSummaryDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] =
    useState<ConfigurationSummaryDto | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [configToDelete, setConfigToDelete] =
    useState<ConfigurationSummaryDto | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Check permissions
  const canManageConfigurations = user?.roles.includes("admin");

  // Filter configurations based on search and status
  const filteredConfigurations = configurations.filter((config) => {
    const matchesSearch =
      (config.displayName || config.configurationName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (config.description &&
        config.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && config.active) ||
      (statusFilter === "inactive" && !config.active);

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredConfigurations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConfigurations = filteredConfigurations.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedEntityType]);

  // Load configurations for selected entity type
  const loadConfigurations = async (entityType: AssetType) => {
    setLoading(true);
    setError(null);

    try {
      const configs = await localConfigService.getAllConfigurations(entityType);
      setConfigurations(configs);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des configurations";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle configuration active state
  const handleToggleActive = async (
    config: ConfigurationSummaryDto,
    active: boolean
  ) => {
    if (!canManageConfigurations) return;

    setActionLoading(config.id);
    try {
      await localConfigService.toggleConfiguration(config.id, active);
      toast({
        title: "Configuration mise à jour",
        description: `Configuration "${
          config.displayName || config.configurationName
        }" ${active ? "activée" : "désactivée"} avec succès`,
      });

      // Update local state
      setConfigurations((prev) =>
        prev.map((c) => (c.id === config.id ? { ...c, active } : c))
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Erreur lors de la modification",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete configuration
  const handleDeleteConfiguration = async (config: ConfigurationSummaryDto) => {
    setConfigToDelete(config);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete configuration
  const confirmDeleteConfiguration = async () => {
    if (!canManageConfigurations || !configToDelete) return;

    setActionLoading(configToDelete.id);
    try {
      await localConfigService.deleteConfiguration(configToDelete.id);
      toast({
        title: "Configuration supprimée",
        description: `Configuration "${
          configToDelete.displayName || configToDelete.configurationName
        }" supprimée avec succès`,
      });

      // Remove from local state
      setConfigurations((prev) =>
        prev.filter((config) => config.id !== configToDelete.id)
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Erreur lors de la suppression",
      });
    } finally {
      setActionLoading(null);
      setDeleteConfirmOpen(false);
      setConfigToDelete(null);
    }
  };

  // Handle configuration created
  const handleConfigurationCreated = () => {
    loadConfigurations(selectedEntityType);
  };

  // Handle edit configuration
  const handleEditConfiguration = async (config: ConfigurationSummaryDto) => {
    try {
      // First get the full configuration details
      const fullConfig = await localConfigService.getConfigurationById(
        config.id
      );
      if (!fullConfig) {
        throw new Error("Configuration not found");
      }

      // Open the edit dialog with the full configuration data
      setSelectedConfig(fullConfig);
      setEditDialogOpen(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de la configuration",
      });
    }
  };

  // Handle create configuration
  const handleCreateConfiguration = () => {
    setCreateDialogOpen(true);
  };

  // Handle create configuration submit
  const handleCreateConfigurationSubmit = async (data: {
    configurationName: string;
    displayName: string;
    description: string;
    sections: Array<{
      id: string;
      name: string;
      order: number;
      fields: Array<{
        id: string;
        name: string;
        type: string;
        required: boolean;
      }>;
    }>;
  }) => {
    try {
      // Get existing configurations to check if this will be the first one
      const existingConfigs = await localConfigService.getAllConfigurations(
        selectedEntityType
      );
      const isFirstConfig = existingConfigs.length === 0;

      // Calculate total fields count
      const totalFieldCount = data.sections.reduce(
        (sum, section) => sum + section.fields.length,
        0
      );

      await localConfigService.createConfiguration({
        ...data,
        entityType: selectedEntityType,
        sectionCount: data.sections.length,
        totalFieldCount,
        active: true,
        defaultConfig: isFirstConfig,
      });

      toast({
        title: "Configuration créée",
        description: `La configuration "${data.displayName}" a été créée avec succès`,
      });

      loadConfigurations(selectedEntityType);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Erreur lors de la création",
      });
      throw err;
    }
  };

  // Load configurations when entity type changes
  useEffect(() => {
    loadConfigurations(selectedEntityType);
  }, [selectedEntityType]);

  // Get stats
  const totalConfigurations = configurations.length;
  const activeConfigurations = configurations.filter((c) => c.active).length;
  const totalFields = configurations.reduce(
    (sum, config) => sum + config.totalFieldCount,
    0
  );

  const getEntityTypeLabel = (type: AssetType): string => {
    switch (type) {
      case "PRODUCT":
        return "Produits";
      case "SUPPLIER":
        return "Fournisseurs";
      case "EQUIPMENT":
        return "Équipements";
      default:
        return type;
    }
  };

  if (!canManageConfigurations) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Configuration</h1>
            <p className="text-muted-foreground">Accès non autorisé</p>
          </div>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page. Seuls les administrateurs peuvent gérer les configurations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">
            Gérez les types d'assets et leurs formulaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadConfigurations(selectedEntityType)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleCreateConfiguration}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Type
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Erreur: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadConfigurations(selectedEntityType)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Entity Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Type d'entité</CardTitle>
          <CardDescription>
            Sélectionnez le type d'entité pour voir ses configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEntityType}
            onValueChange={(value: AssetType) => setSelectedEntityType(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type d'entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRODUCT">Produits</SelectItem>
              <SelectItem value="SUPPLIER">Fournisseurs</SelectItem>
              <SelectItem value="EQUIPMENT">Équipements</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
                  Types d'Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalConfigurations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Types Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeConfigurations}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Champs Configurés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFields}</div>
              </CardContent>
            </Card>
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
                  placeholder="Rechercher une configuration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table des configurations */}
      <Card>
        <CardHeader>
          <CardTitle>
            Configurations pour {getEntityTypeLabel(selectedEntityType)} (
            {filteredConfigurations.length})
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
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Sections
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Champs
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Statut
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Utilisations
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentConfigurations.map((config, index) => (
                    <TableRow
                      key={config.id}
                      className={`
                        border-b border-gray-100 
                        hover:bg-gray-50 
                        transition-colors 
                        duration-150 
                        ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}
                      `}
                    >
                      <TableCell className="font-medium py-4 px-6 text-gray-900 text-center">
                        {config.displayName || config.configurationName}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center max-w-xs">
                        <div className="truncate" title={config.description}>
                          {config.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                          >
                            {config.sectionCount}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 font-medium"
                          >
                            {config.totalFieldCount}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={config.active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(config, checked)
                            }
                            disabled={actionLoading === config.id}
                          />
                          <Badge
                            variant={config.active ? "default" : "secondary"}
                            className={`font-medium ${
                              config.active
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {config.active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 font-medium"
                          >
                            {config.usageCount || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {/* View Configuration */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConfig(config)}
                            title="Voir les détails"
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit Configuration */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConfiguration(config)}
                            title="Modifier"
                            className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Delete Configuration */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConfiguration(config)}
                            title="Supprimer"
                            disabled={
                              config.usageCount > 0 ||
                              actionLoading === config.id
                            }
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
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
          {!loading && filteredConfigurations.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Affichage de {startIndex + 1} à{" "}
                {Math.min(endIndex, filteredConfigurations.length)} sur{" "}
                {filteredConfigurations.length} résultats
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

          {filteredConfigurations.length === 0 && !loading && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              {configurations.length === 0 ? (
                <>
                  <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune configuration trouvée pour{" "}
                    {getEntityTypeLabel(selectedEntityType)}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Créez votre première configuration pour ce type d'entité
                  </p>
                  <Button onClick={handleCreateConfiguration}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la première configuration
                  </Button>
                </>
              ) : (
                <>
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune configuration trouvée
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Aucune configuration ne correspond aux filtres actuels
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      Effacer les filtres
                    </Button>
                    <Button onClick={handleCreateConfiguration}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle configuration
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la configuration "
              {configToDelete?.displayName || configToDelete?.configurationName}
              " ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={actionLoading === configToDelete?.id}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteConfiguration}
              disabled={actionLoading === configToDelete?.id}
            >
              {actionLoading === configToDelete?.id
                ? "Suppression..."
                : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails de configuration */}
      {selectedConfig && (
        <Dialog
          open={!!selectedConfig}
          onOpenChange={() => setSelectedConfig(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedConfig.displayName || selectedConfig.configurationName}
              </DialogTitle>
              <DialogDescription>
                Détails de la configuration pour {selectedConfig.entityType}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom technique</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedConfig.configurationName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type d'entité</label>
                  <p className="text-sm text-muted-foreground">
                    {getEntityTypeLabel(selectedConfig.entityType as AssetType)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Sections</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedConfig.sectionCount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Champs</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedConfig.totalFieldCount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Utilisations</label>
                  <p className="text-sm text-muted-foreground">{3}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Badge
                    variant={selectedConfig.active ? "default" : "secondary"}
                  >
                    {selectedConfig.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              {selectedConfig.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedConfig.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label>Créée le</label>
                  <p>
                    {new Date(selectedConfig.createdAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>
                {selectedConfig.lastUsedAt && (
                  <div>
                    <label>Dernière utilisation</label>
                    <p>
                      {new Date(selectedConfig.lastUsedAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedConfig(null)}>
                Fermer
              </Button>
              <Button
                onClick={() => {
                  setSelectedConfig(null);
                  handleEditConfiguration(selectedConfig);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Configuration Dialog */}
      <CreateConfigurationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateConfigurationSubmit}
        entityType={selectedEntityType}
      />

      {/* Edit Configuration Dialog */}
      {selectedConfig && (
        <EditConfigurationDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={async (data) => {
            try {
              const updatedConfig =
                await localConfigService.updateConfiguration(
                  selectedConfig.id,
                  data
                );
              toast({
                title: "Configuration mise à jour",
                description: `La configuration "${updatedConfig.displayName}" a été mise à jour avec succès`,
              });
              loadConfigurations(selectedEntityType);
              setEditDialogOpen(false);
              setSelectedConfig(null);
            } catch (err) {
              toast({
                variant: "destructive",
                title: "Erreur",
                description:
                  err instanceof Error
                    ? err.message
                    : "Erreur lors de la mise à jour",
              });
              throw err;
            }
          }}
          config={selectedConfig}
          entityType={selectedEntityType}
        />
      )}
    </div>
  );
};
