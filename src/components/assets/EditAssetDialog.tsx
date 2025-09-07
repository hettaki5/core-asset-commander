import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useToast } from "@/components/ui/use-toast";
import { localConfigService } from "@/services/localConfigService";
import { Save, X } from "lucide-react";
import {
  ConfigurationSection,
  ConfigurationWithSections,
} from "@/types/configuration";
import { LocalAssetDto } from "@/types/local-assets";

interface AssetFormData {
  name: string;
  description: string;
  sections: ConfigurationSection[];
}

interface EditAssetDialogProps {
  asset: LocalAssetDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    assetId: string,
    data: {
      name: string;
      description?: string;
      formData: {
        sections: ConfigurationSection[];
      };
      images?: Record<string, File[]>;
    }
  ) => Promise<void>;
}

export function EditAssetDialog({
  asset,
  open,
  onOpenChange,
  onSubmit,
}: EditAssetDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    description: "",
    sections: [],
  });
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});

  // Initialize form with asset data
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        description: asset.description || "",
        sections: asset.formData.sections,
      });
    }
  }, [asset]);

  const handleImageChange = (fieldId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      setImageFiles((prev) => ({
        ...prev,
        [fieldId]: Array.from(files),
      }));

      // Update form data with placeholder values
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          fields: section.fields.map((field) =>
            field.id === fieldId
              ? {
                  ...field,
                  value: Array.from(files).map((f) => URL.createObjectURL(f)),
                }
              : field
          ),
        })),
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      const missingFields = formData.sections.flatMap((section) =>
        section.fields
          .filter((field) => field.required && !field.value)
          .map((field) => `${section.name} > ${field.name}`)
      );

      if (missingFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Champs requis manquants",
          description: `Veuillez remplir les champs suivants : ${missingFields.join(
            ", "
          )}`,
        });
        return;
      }

      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Nom requis",
          description: "Veuillez entrer un nom pour l'asset",
        });
        return;
      }

      await onSubmit(asset.id, {
        name: formData.name,
        description: formData.description,
        formData: {
          sections: formData.sections,
        },
        images: imageFiles,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la modification de l'asset",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'asset</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'asset {asset.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Nom de l'asset *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nom de l'asset"
              />
            </div>
            <div>
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
                placeholder="Description de l'asset"
                rows={3}
              />
            </div>
          </div>

          {/* Configuration Form */}
          {formData.sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h3 className="font-semibold text-lg">{section.name}</h3>
              <div className="grid gap-4">
                {section.fields.map((field) => (
                  <div key={field.id}>
                    <Label>
                      {field.name}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    {field.type === "text" && (
                      <Input
                        value={field.value as string}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    fields: s.fields.map((f) =>
                                      f.id === field.id
                                        ? { ...f, value: e.target.value }
                                        : f
                                    ),
                                  }
                                : s
                            ),
                          }));
                        }}
                        placeholder={`Entrez ${field.name.toLowerCase()}`}
                      />
                    )}

                    {field.type === "number" && (
                      <Input
                        type="number"
                        value={field.value as string}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    fields: s.fields.map((f) =>
                                      f.id === field.id
                                        ? { ...f, value: e.target.value }
                                        : f
                                    ),
                                  }
                                : s
                            ),
                          }));
                        }}
                        placeholder={`Entrez ${field.name.toLowerCase()}`}
                      />
                    )}

                    {field.type === "date" && (
                      <Input
                        type="date"
                        value={field.value as string}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    fields: s.fields.map((f) =>
                                      f.id === field.id
                                        ? { ...f, value: e.target.value }
                                        : f
                                    ),
                                  }
                                : s
                            ),
                          }));
                        }}
                      />
                    )}

                    {field.type === "select" && (
                      <Select
                        value={field.value as string}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    fields: s.fields.map((f) =>
                                      f.id === field.id ? { ...f, value } : f
                                    ),
                                  }
                                : s
                            ),
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Sélectionnez ${field.name.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "image" && (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            handleImageChange(field.id, e.target.files)
                          }
                        />
                        {Array.isArray(field.value) &&
                          field.value.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                              {(field.value as string[]).map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
