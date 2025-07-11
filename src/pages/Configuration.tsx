
import React, { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Edit, Trash2, Save, X } from 'lucide-react';
import { AssetType, AssetSectionTemplate, AssetFieldTemplate } from '@/types';

export const Configuration: React.FC = () => {
  const { assetTypes, createAssetType, updateAssetType } = useAppData();
  const [isCreating, setIsCreating] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
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
      setIsCreating(false);
    }
  };

  const handleToggleActive = (typeId: string, isActive: boolean) => {
    updateAssetType(typeId, { isActive });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">Gérez les types d'assets et leurs formulaires</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Type
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Types d'Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetTypes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Types Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assetTypes.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Champs Configurés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetTypes.reduce((total, type) => 
                total + type.sections.reduce((sectionTotal, section) => 
                  sectionTotal + section.fields.length, 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Type d'Asset</CardTitle>
            <CardDescription>Définissez un nouveau type d'asset avec ses sections et champs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Card key={section.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <Input
                        value={section.name}
                        onChange={(e) => setNewType(prev => ({
                          ...prev,
                          sections: prev.sections.map((s, i) =>
                            i === sectionIndex ? { ...s, name: e.target.value } : s
                          )
                        }))}
                        className="font-medium"
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
                  </CardHeader>
                  <CardContent>
                    {section.fields.map((field, fieldIndex) => (
                      <div key={field.id} className="flex gap-2 mb-2 p-2 border rounded">
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
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleCreateType}>
                <Save className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des types existants */}
      <Card>
        <CardHeader>
          <CardTitle>Types d'Assets Existants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Champs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell>{type.sections.length}</TableCell>
                  <TableCell>
                    {type.sections.reduce((total, section) => total + section.fields.length, 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={type.isActive}
                        onCheckedChange={(checked) => handleToggleActive(type.id, checked)}
                      />
                      <Badge variant={type.isActive ? "default" : "secondary"}>
                        {type.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
