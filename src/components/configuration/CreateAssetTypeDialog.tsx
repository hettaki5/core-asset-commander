import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Plus, X, Save } from "lucide-react";
import { toast } from "sonner";

interface FieldTemplate {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required: boolean;
}

interface SectionTemplate {
  id: string;
  name: string;
  order: number;
  fields: FieldTemplate[];
}

interface AssetTypeTemplate {
  name: string;
  description: string;
  isActive: boolean;
  sections: SectionTemplate[];
}

export const CreateAssetTypeDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState<AssetTypeTemplate>({
    name: "",
    description: "",
    isActive: true,
    sections: [],
  });

  const handleCreateType = () => {
    if (!newType.name.trim()) {
      toast.error("Le nom du type est requis");
      return;
    }

    if (newType.sections.length === 0) {
      toast.error("Au moins une section est requise");
      return;
    }

    // Simuler la création
    console.log("Création du type d'asset:", newType);
    toast.success(`Type d'asset "${newType.name}" créé avec succès`);

    // Reset et fermer
    setNewType({ name: "", description: "", isActive: true, sections: [] });
    setOpen(false);
  };

  const addSection = () => {
    const newSection: SectionTemplate = {
      id: Date.now().toString(),
      name: "Nouvelle section",
      order: newType.sections.length + 1,
      fields: [],
    };
    setNewType((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeSection = (sectionId: string) => {
    setNewType((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const updateSection = (sectionId: string, name: string) => {
    setNewType((prev) => ({
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
    setNewType((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ),
    }));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setNewType((prev) => ({
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
    setNewType((prev) => ({
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Type
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Type d'Asset</DialogTitle>
          <DialogDescription>
            Définissez un nouveau type d'asset avec ses sections et champs
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du type *</Label>
              <Input
                id="name"
                value={newType.name}
                onChange={(e) =>
                  setNewType((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Ordinateur portable"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newType.isActive}
                onCheckedChange={(checked) =>
                  setNewType((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="active">Type actif</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newType.description}
              onChange={(e) =>
                setNewType((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Description du type d'asset"
              rows={3}
            />
          </div>

          {/* Sections */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">
                Sections du formulaire ({newType.sections.length})
              </Label>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter Section
              </Button>
            </div>

            {newType.sections.map((section, sectionIndex) => (
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

                {/* Champs de la section */}
                <div className="space-y-2">
                  {section.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex gap-2 p-3 bg-white border rounded items-center"
                    >
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
                        <option value="select">Liste</option>
                        <option value="textarea">Texte long</option>
                        <option value="boolean">Oui/Non</option>
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
                  ))}

                  {section.fields.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded">
                      Aucun champ dans cette section
                    </div>
                  )}
                </div>
              </div>
            ))}

            {newType.sections.length === 0 && (
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleCreateType}>
              <Save className="h-4 w-4 mr-2" />
              Créer le Type
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
