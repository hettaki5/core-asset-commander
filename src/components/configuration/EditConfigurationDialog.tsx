import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Plus, Trash2 } from "lucide-react";
import type { ConfigurationSummaryDto, AssetType } from "@/types/backend";
import { Badge } from "@/components/ui/badge";

interface ConfigurationFormData {
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
      options?: string[];
    }>;
  }>;
  entityType?: string;
  sectionCount?: number;
  totalFieldCount?: number;
}

interface EditConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ConfigurationFormData>) => Promise<void>;
  config: ConfigurationSummaryDto & { sections?: ConfigurationFormData['sections'] };
  entityType: AssetType;
}

export function EditConfigurationDialog({
  open,
  onOpenChange,
  onSubmit,
  config,
  entityType,
}: EditConfigurationDialogProps) {
  const [formData, setFormData] = useState<ConfigurationFormData>({
    configurationName: "",
    displayName: "",
    description: "",
    sections: [],
  });

  useEffect(() => {
    if (config) {
      setFormData({
        configurationName: config.configurationName,
        displayName: config.displayName || config.configurationName,
        description: config.description || "",
        sections: config.sections || [],
      });
    }
  }, [config]);

  const handleSubmit = async () => {
    try {
      const totalFieldCount = formData.sections.reduce(
        (sum, section) => sum + section.fields.length,
        0
      );

      await onSubmit({
        ...formData,
        entityType,
        sectionCount: formData.sections.length,
        totalFieldCount,
      });

      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Date.now().toString(),
          name: "Nouvelle section",
          order: prev.sections.length + 1,
          fields: [],
        },
      ],
    }));
  };

  const updateSection = (sectionId: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, name } : section
      ),
    }));
  };

  const removeSection = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const addField = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: [
                ...section.fields,
                {
                  id: Date.now().toString(),
                  name: "Nouveau champ",
                  type: "text",
                  required: false,
                },
              ],
            }
          : section
      ),
    }));
  };

  const updateField = (
    sectionId: string,
    fieldId: string,
    updates: Partial<{
      name: string;
      type: string;
      required: boolean;
      options: string[];
    }>
  ) => {
    setFormData((prev) => ({
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

  const removeField = (sectionId: string, fieldId: string) => {
    setFormData((prev) => ({
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

  const addOption = (sectionId: string, fieldId: string, option: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId
                  ? {
                      ...field,
                      options: [...(field.options || []), option],
                    }
                  : field
              ),
            }
          : section
      ),
    }));
  };

  const removeOption = (sectionId: string, fieldId: string, option: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId
                  ? {
                      ...field,
                      options: (field.options || []).filter((o) => o !== option),
                    }
                  : field
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
          <DialogTitle>Modifier la Configuration</DialogTitle>
          <DialogDescription>
            Modifiez les détails de la configuration pour {entityType.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="configurationName">Nom du modèle *</Label>
              <Input
                id="configurationName"
                value={formData.configurationName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    configurationName: e.target.value,
                    displayName: e.target.value, // Keep them in sync unless explicitly changed
                  }))
                }
                placeholder="ex: Ordinateur portable"
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
                placeholder="Description de la configuration"
                rows={3}
              />
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">
                Sections ({formData.sections.length})
              </Label>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter Section
              </Button>
            </div>

            {formData.sections.map((section) => (
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
                      <Trash2 className="h-4 w-4" />
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
                              type: e.target.value,
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
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {field.type === "select" && (
                        <div className="mt-2 pl-4 border-l-2">
                          <div className="space-y-2">
                            <Label className="text-sm">Options de la liste:</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nouvelle option..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const value = e.currentTarget.value.trim();
                                    if (value) {
                                      addOption(section.id, field.id, value);
                                      e.currentTarget.value = "";
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
                                    addOption(section.id, field.id, value);
                                    input.value = "";
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(field.options || []).map((option, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {option}
                                  <button
                                    onClick={() =>
                                      removeOption(section.id, field.id, option)
                                    }
                                    className="ml-1 text-muted hover:text-foreground"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              {(!field.options || field.options.length === 0) && (
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

            {formData.sections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune section définie</p>
                <p className="text-sm">
                  Ajoutez au moins une section pour commencer
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
