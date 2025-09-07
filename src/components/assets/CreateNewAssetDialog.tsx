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
import type { AssetType, ConfigurationSummaryDto } from "@/types/backend";
import { Save, X } from "lucide-react";

import { ConfigurationSection, ConfigurationWithSections } from '@/types/configuration';

interface AssetFormData {
  name: string;
  description: string;
  type: AssetType;
  configurationId: string;
  sections: ConfigurationSection[];
}

interface CreateNewAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    type: AssetType;
    configurationId: string;
    description?: string;
    formData: {
      sections: ConfigurationSection[];
    };
    images?: Record<string, File[]>;
  }) => Promise<void>;
}

export function CreateNewAssetDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateNewAssetDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'type' | 'config' | 'form'>('type');
  const [assetType, setAssetType] = useState<AssetType | ''>('');
  const [configurations, setConfigurations] = useState<ConfigurationWithSections[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ConfigurationWithSections | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    description: '',
    type: '' as AssetType,
    configurationId: '',
    sections: []
  });
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});

  const loadConfigurations = useCallback(async (type: AssetType) => {
    try {
      const configs = await localConfigService.getAllConfigurations(type);
      setConfigurations(configs.filter(c => c.active) as ConfigurationWithSections[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les configurations"
      });
    }
  }, [toast]);

  // Load configurations when asset type changes
  useEffect(() => {
    if (assetType) {
      loadConfigurations(assetType);
    }
  }, [assetType, loadConfigurations]);

  const handleTypeSelect = (type: AssetType) => {
    setAssetType(type);
    setFormData(prev => ({ ...prev, type }));
    setStep('config');
  };

  const handleConfigSelect = async (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (config) {
      setSelectedConfig(config);
      setFormData(prev => ({
        ...prev,
        configurationId: config.id,
        sections: config.sections.map(section => ({
          id: section.id,
          name: section.name,
          fields: section.fields.map(field => ({
            ...field,
            value: field.type === 'image' ? [] : ''
          }))
        }))
      }));
      setStep('form');
    }
  };

  const handleImageChange = (fieldId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      setImageFiles(prev => ({
        ...prev,
        [fieldId]: Array.from(files)
      }));
      
      // Update form data with placeholder values
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => 
            field.id === fieldId
              ? { ...field, value: Array.from(files).map(f => URL.createObjectURL(f)) }
              : field
          )
        }))
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      const missingFields = formData.sections
        .flatMap(section => 
          section.fields
            .filter(field => field.required && !field.value)
            .map(field => `${section.name} > ${field.name}`)
        );

      if (missingFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Champs requis manquants",
          description: `Veuillez remplir les champs suivants : ${missingFields.join(', ')}`
        });
        return;
      }

      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Nom requis",
          description: "Veuillez entrer un nom pour l'asset"
        });
        return;
      }

      await onSubmit({
        name: formData.name,
        type: formData.type,
        configurationId: formData.configurationId,
        description: formData.description,
        formData: {
          sections: formData.sections
        },
        images: imageFiles
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: '' as AssetType,
        configurationId: '',
        sections: []
      });
      setImageFiles({});
      setStep('type');
      setAssetType('');
      setSelectedConfig(null);
      onOpenChange(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création de l'asset"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: '' as AssetType,
      configurationId: '',
      sections: []
    });
    setImageFiles({});
    setStep('type');
    setAssetType('');
    setSelectedConfig(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Asset</DialogTitle>
          <DialogDescription>
            {step === 'type' && "Sélectionnez le type d'asset à créer"}
            {step === 'config' && "Choisissez un modèle de configuration"}
            {step === 'form' && "Remplissez les informations de l'asset"}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={assetType === 'PRODUCT' ? "default" : "outline"}
                className="h-24"
                onClick={() => handleTypeSelect('PRODUCT')}
              >
                Produit
              </Button>
              <Button
                variant={assetType === 'SUPPLIER' ? "default" : "outline"}
                className="h-24"
                onClick={() => handleTypeSelect('SUPPLIER')}
              >
                Fournisseur
              </Button>
              <Button
                variant={assetType === 'EQUIPMENT' ? "default" : "outline"}
                className="h-24"
                onClick={() => handleTypeSelect('EQUIPMENT')}
              >
                Équipement
              </Button>
            </div>
          </div>
        )}

        {step === 'config' && (
          <div className="space-y-4">
            {configurations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune configuration active trouvée pour ce type d'asset
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configurations.map((config) => (
                  <Button
                    key={config.id}
                    variant="outline"
                    className="h-32 flex flex-col items-start p-4 text-left"
                    onClick={() => handleConfigSelect(config.id)}
                  >
                    <span className="font-bold">
                      {config.displayName || config.configurationName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {config.description || "Aucune description"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-2">
                      {config.sectionCount} section(s) · {config.totalFieldCount} champ(s)
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Nom de l'asset *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom de l'asset"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === 'text' && (
                        <Input
                          value={field.value as string}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              sections: prev.sections.map(s => 
                                s.id === section.id
                                  ? {
                                      ...s,
                                      fields: s.fields.map(f =>
                                        f.id === field.id
                                          ? { ...f, value: e.target.value }
                                          : f
                                      )
                                    }
                                  : s
                              )
                            }));
                          }}
                          placeholder={`Entrez ${field.name.toLowerCase()}`}
                        />
                      )}

                      {field.type === 'number' && (
                        <Input
                          type="number"
                          value={field.value as string}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              sections: prev.sections.map(s => 
                                s.id === section.id
                                  ? {
                                      ...s,
                                      fields: s.fields.map(f =>
                                        f.id === field.id
                                          ? { ...f, value: e.target.value }
                                          : f
                                      )
                                    }
                                  : s
                              )
                            }));
                          }}
                          placeholder={`Entrez ${field.name.toLowerCase()}`}
                        />
                      )}

                      {field.type === 'date' && (
                        <Input
                          type="date"
                          value={field.value as string}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              sections: prev.sections.map(s => 
                                s.id === section.id
                                  ? {
                                      ...s,
                                      fields: s.fields.map(f =>
                                        f.id === field.id
                                          ? { ...f, value: e.target.value }
                                          : f
                                      )
                                    }
                                  : s
                              )
                            }));
                          }}
                        />
                      )}

                      {field.type === 'select' && (
                        <Select
                          value={field.value as string}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              sections: prev.sections.map(s => 
                                s.id === section.id
                                  ? {
                                      ...s,
                                      fields: s.fields.map(f =>
                                        f.id === field.id
                                          ? { ...f, value }
                                          : f
                                      )
                                    }
                                  : s
                              )
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Sélectionnez ${field.name.toLowerCase()}`} />
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

                      {field.type === 'image' && (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageChange(field.id, e.target.files)}
                          />
                          {Array.isArray(field.value) && field.value.length > 0 && (
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
        )}

        <DialogFooter>
          {step !== 'type' && (
            <Button
              variant="outline"
              onClick={() => setStep(step === 'form' ? 'config' : 'type')}
            >
              <X className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          
          {step === 'form' && (
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Création...' : 'Créer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
