
import React, { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X, Save } from 'lucide-react';
import { AssetType, AssetSectionTemplate, AssetFieldTemplate } from '@/types';

export const CreateAssetTypeDialog: React.FC = () => {
  const { createAssetType } = useAppData();
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState<Omit<AssetType, 'id'>>({
    name: '',
    description: '',
    isActive: true,
    sections: []
  });

  const handleCreateType = () => {
    if (newType.name.trim()) {
      createAssetType(newType);
      setNewType({ name: '', description: '', isActive: true, sections: [] });
      setOpen(false);
    }
  };

  const addSection = () => {
    const newSection: AssetSectionTemplate = {
      id: Date.now().toString(),
      name: 'Nouvelle section',
      order: newType.sections.length + 1,
      fields: []
    };
    setNewType(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const addField = (sectionId: string) => {
    const newField: AssetFieldTemplate = {
      id: Date.now().toString(),
      name: 'Nouveau champ',
      type: 'text',
      required: false
    };
    setNewType(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du type</Label>
              <Input
                id="name"
                value={newType.name}
                onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Ordinateur portable"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newType.isActive}
                onCheckedChange={(checked) => setNewType(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="active">Type actif</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newType.description}
              onChange={(e) => setNewType(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du type d'asset"
            />
          </div>

          {/* Sections */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Sections du formulaire</Label>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Section
              </Button>
            </div>
            {newType.sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Input
                    value={section.name}
                    onChange={(e) => setNewType(prev => ({
                      ...prev,
                      sections: prev.sections.map((s, i) =>
                        i === sectionIndex ? { ...s, name: e.target.value } : s
                      )
                    }))}
                    className="font-medium flex-1 mr-2"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addField(section.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Champ
                  </Button>
                </div>
                <div className="space-y-2">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="flex gap-2 p-2 border rounded">
                      <Input
                        value={field.name}
                        onChange={(e) => setNewType(prev => ({
                          ...prev,
                          sections: prev.sections.map((s, si) =>
                            si === sectionIndex
                              ? {
                                  ...s,
                                  fields: s.fields.map((f, fi) =>
                                    fi === fieldIndex ? { ...f, name: e.target.value } : f
                                  )
                                }
                              : s
                          )
                        }))}
                        placeholder="Nom du champ"
                        className="flex-1"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => setNewType(prev => ({
                          ...prev,
                          sections: prev.sections.map((s, si) =>
                            si === sectionIndex
                              ? {
                                  ...s,
                                  fields: s.fields.map((f, fi) =>
                                    fi === fieldIndex ? { ...f, type: e.target.value as any } : f
                                  )
                                }
                              : s
                          )
                        }))}
                        className="px-3 py-1 border rounded"
                      >
                        <option value="text">Texte</option>
                        <option value="number">Nombre</option>
                        <option value="date">Date</option>
                        <option value="select">Liste</option>
                        <option value="textarea">Texte long</option>
                        <option value="boolean">Oui/Non</option>
                      </select>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => setNewType(prev => ({
                            ...prev,
                            sections: prev.sections.map((s, si) =>
                              si === sectionIndex
                                ? {
                                    ...s,
                                    fields: s.fields.map((f, fi) =>
                                      fi === fieldIndex ? { ...f, required: e.target.checked } : f
                                    )
                                  }
                                : s
                            )
                          }))}
                          className="mr-1"
                        />
                        <span className="text-sm">Requis</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleCreateType}>
              <Save className="h-4 w-4 mr-2" />
              Créer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
