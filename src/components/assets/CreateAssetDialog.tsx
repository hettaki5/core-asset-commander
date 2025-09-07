import React, { useState, useEffect } from "react";
import { useAssets } from "@/hooks/useAssets";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { AssetDto, AssetType } from "@/types/backend";

interface CreateAssetDialogProps {
  entityType?: AssetType;
  onAssetCreated?: (asset: AssetDto) => void;
}

export const CreateAssetDialog: React.FC<CreateAssetDialogProps> = ({
  entityType = "PRODUCT",
  onAssetCreated,
}) => {
  const {
    configurations,
    loadingConfigurations,
    refreshConfigurations,
    createAsset,
  } = useAssets(entityType);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedConfiguration, setSelectedConfiguration] =
    useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    reference: "",
    type: entityType,
  });

  // Load configurations when dialog opens or entity type changes
  useEffect(() => {
    if (open) {
      refreshConfigurations(entityType);
    }
  }, [open, entityType, refreshConfigurations]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        reference: "",
        type: entityType,
      });
      setSelectedConfiguration("");
    }
  }, [open, entityType]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setLoading(true);
    try {
      const assetData: Partial<AssetDto> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        reference: formData.reference.trim() || undefined,
        type: entityType,
        status: "DRAFT",
      };

      const newAsset = await createAsset(
        assetData,
        selectedConfiguration || undefined
      );

      toast.success("Asset créé avec succès");
      setOpen(false);

      if (onAssetCreated) {
        onAssetCreated(newAsset);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la création"
      );
    } finally {
      setLoading(false);
    }
  };

  const getEntityTypeLabel = (type: AssetType): string => {
    switch (type) {
      case "PRODUCT":
        return "Produit";
      case "SUPPLIER":
        return "Fournisseur";
      case "EQUIPMENT":
        return "Équipement";
      default:
        return type;
    }
  };

  const getPlaceholderExample = (type: AssetType, field: string): string => {
    const examples = {
      PRODUCT: {
        name: "T-Shirt Basic Cotton",
        reference: "PROD-TSH-001",
      },
      SUPPLIER: {
        name: "Global Supplier Ltd",
        reference: "SUPP-UK-002",
      },
      EQUIPMENT: {
        name: "Machine à Coudre Industrielle",
        reference: "EQP-MAC-001",
      },
    };
    return examples[type]?.[field] || "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Créer un nouveau {getEntityTypeLabel(entityType)}
          </DialogTitle>
          <DialogDescription>
            Ajoutez les informations de base pour créer un nouvel asset de type{" "}
            {getEntityTypeLabel(entityType)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration Selection */}
          {configurations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="configuration">Configuration (optionnel)</Label>
              <Select
                value={selectedConfiguration}
                onValueChange={setSelectedConfiguration}
                disabled={loadingConfigurations}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une configuration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Configuration par défaut</SelectItem>
                  {configurations
                    .filter((config) => config.active)
                    .map((config) => (
                      <SelectItem
                        key={config.id}
                        value={config.configurationName}
                      >
                        {config.displayName || config.configurationName}
                        {config.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {config.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {loadingConfigurations && (
                <p className="text-xs text-muted-foreground">
                  Chargement des configurations...
                </p>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={`Ex: ${getPlaceholderExample(entityType, "name")}`}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reference: e.target.value,
                  }))
                }
                placeholder={`Ex: ${getPlaceholderExample(
                  entityType,
                  "reference"
                )}`}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description de l'asset..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Création..." : "Créer l'Asset"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssetDialog;
