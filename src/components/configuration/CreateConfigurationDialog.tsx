import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Save } from "lucide-react";
import type { AssetType } from "@/types/backend";
import { toast } from "@/components/ui/use-toast";

interface FieldTemplate {
  id: string;
  name: string;
  type: "text" | "number" | "image" | "date" | "select";
  required: boolean;
  options?: string[]; // Options for select type
}

interface SectionTemplate {
  id: string;
  name: string;
  order: number;
  fields: FieldTemplate[];
}

interface ConfigurationTemplate {
  configurationName: string;
  displayName: string;
  description: string;
  sections: SectionTemplate[];
}

interface CreateConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConfigurationTemplate) => Promise<void>;
  entityType: AssetType;
}

export function CreateConfigurationDialog({
  open,
  onOpenChange,
  onSubmit,
  entityType,
}: CreateConfigurationDialogProps) {
  const [newConfig, setNewConfig] = useState<ConfigurationTemplate>({
    configurationName: "",
    displayName: "",
    description: "",
    sections: [],
  });

  const handleCreateConfig = async () => {
    if (!newConfig.configurationName.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom du modèle est requis",
      });
      return;
    }

    if (newConfig.sections.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Au moins une section est requise",
      });
      return;
    }

    try {
      await onSubmit(newConfig);
      setNewConfig({
        configurationName: "",
        displayName: "",
        description: "",
        sections: [],
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent
    }
  };

  const addSection = () => {
    const newSection: SectionTemplate = {
      id: Date.now().toString(),
      name: "Nouvelle section",
      order: newConfig.sections.length + 1,
      fields: [],
    };
    setNewConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeSection = (sectionId: string) => {
    setNewConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const updateSection = (sectionId: string, name: string) => {
    setNewConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, name } : section
      ),
    }));
  };

  const addField = (sectionId: string) => {
    const newField: FieldTemplate = {
      id: Date.now().toString(),
      name: "Nouveau champ",
      type: "text",
      required: false,
    };
    setNewConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ),
    }));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setNewConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId),
            }
          : section
      ),
    }));
  };

  const updateField = (
    sectionId: string,
    fieldId: string,
    updates: Partial<FieldTemplate>
  ) => {
    setNewConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, ...updates } : field
              ),
            }
          : section
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Configuration</DialogTitle>
          <DialogDescription>
            Créez une nouvelle configuration pour {entityType.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="configurationName">Nom du modèle *</Label>
              <Input
                id="configurationName"
                value={newConfig.configurationName}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewConfig((prev) => ({
                    ...prev,
                    configurationName: value,
                    displayName: value, // Keep them in sync
                  }));
                }}
                placeholder="ex: Ordinateur portable"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newConfig.description}
                onChange={(e) =>
                  setNewConfig((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Description de la configuration"
                rows={3}
              />
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">
                Sections ({newConfig.sections.length})
              </Label>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter Section
              </Button>
            </div>

            {newConfig.sections.map((section) => (
              <div
                key={section.id}
                className="mb-4 p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <Input
                    value={section.name}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    className="font-medium flex-1 mr-4 bg-white"
                    placeholder="Nom de la section"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addField(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Champ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-2">
                  {section.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 p-3 bg-white border rounded"
                    >
                      <div className="flex gap-2 items-center">
                        <Input
                          value={field.name}
                          onChange={(e) =>
                            updateField(section.id, field.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Nom du champ"
                          className="flex-1"
                        />
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(section.id, field.id, {
                              type: e.target.value as FieldTemplate["type"],
                            })
                          }
                          className="px-3 py-2 border rounded min-w-[120px]"
                        >
                          <option value="text">Texte</option>
                          <option value="number">Nombre</option>
                          <option value="date">Date</option>
                          <option value="image">Image</option>
                          <option value="select">Liste</option>
                        </select>
                        <div className="flex items-center min-w-[80px]">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(section.id, field.id, {
                                required: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Requis</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(section.id, field.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {field.type === "select" && (
                        <div className="mt-2 pl-4 border-l-2">
                          <div className="space-y-2">
                            <Label className="text-sm">
                              Options de la liste:
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nouvelle option..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const value = e.currentTarget.value.trim();
                                    if (value) {
                                      const currentOptions =
                                        field.options || [];
                                      if (!currentOptions.includes(value)) {
                                        updateField(section.id, field.id, {
                                          options: [...currentOptions, value],
                                        });
                                        e.currentTarget.value = "";
                                      } else {
                                        toast({
                                          variant: "destructive",
                                          description:
                                            "Cette option existe déjà",
                                        });
                                      }
                                    }
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  const value = input.value.trim();
                                  if (value) {
                                    const currentOptions = field.options || [];
                                    if (!currentOptions.includes(value)) {
                                      updateField(section.id, field.id, {
                                        options: [...currentOptions, value],
                                      });
                                      input.value = "";
                                    } else {
                                      toast({
                                        variant: "destructive",
                                        description: "Cette option existe déjà",
                                      });
                                    }
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(field.options || []).map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                                >
                                  <span className="text-sm">{option}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={() => {
                                      const newOptions = [
                                        ...(field.options || []),
                                      ];
                                      newOptions.splice(index, 1);
                                      updateField(section.id, field.id, {
                                        options: newOptions,
                                      });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              {(!field.options ||
                                field.options.length === 0) && (
                                <span className="text-sm text-muted-foreground">
                                  Aucune option définie
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {section.fields.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded">
                      Aucun champ dans cette section
                    </div>
                  )}
                </div>
              </div>
            ))}

            {newConfig.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune section définie</p>
                <p className="text-sm">
                  Ajoutez au moins une section pour commencer
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleCreateConfig}>
              <Save className="h-4 w-4 mr-2" />
              Créer la Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
