
import React, { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Edit } from 'lucide-react';
import { CreateAssetTypeDialog } from '@/components/configuration/CreateAssetTypeDialog';

export const Configuration: React.FC = () => {
  const { assetTypes, updateAssetType } = useAppData();

  const handleToggleActive = (typeId: string, isActive: boolean) => {
    updateAssetType(typeId, { isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">Gérez les types d'assets et leurs formulaires</p>
        </div>
        <CreateAssetTypeDialog />
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
