
import React, { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Asset } from '@/types';

export const Assets: React.FC = () => {
  const { assets, assetTypes, submitAsset, validateAsset, deleteAsset } = useAppData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const canCreateAsset = ['admin', 'ingenieurpr'].includes(user?.role || '');
  const canValidateAsset = ['admin', 'validateur'].includes(user?.role || '');
  const canEditAsset = ['admin', 'ingenieurpr'].includes(user?.role || '');

  const handleSubmitAsset = (assetId: string) => {
    submitAsset(assetId);
  };

  const handleValidateAsset = (assetId: string, approved: boolean) => {
    const comment = approved ? 'Validé automatiquement' : 'Rejeté automatiquement';
    validateAsset(assetId, approved, comment);
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet asset ?')) {
      deleteAsset(assetId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Assets</h1>
          <p className="text-muted-foreground">Gérez vos équipements et ressources</p>
        </div>
        {canCreateAsset && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Asset
          </Button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {assets.filter(a => a.status === 'pending' || a.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assets.filter(a => a.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {assets.filter(a => a.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Rechercher un asset..."
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
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {assetTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des assets */}
      <Card>
        <CardHeader>
          <CardTitle>Assets ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.type}</Badge>
                  </TableCell>
                  <TableCell>{asset.model}</TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell>{asset.assignedTo || '-'}</TableCell>
                  <TableCell>{asset.location || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEditAsset && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {asset.status === 'draft' && canEditAsset && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSubmitAsset(asset.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {asset.status === 'submitted' && canValidateAsset && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleValidateAsset(asset.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleValidateAsset(asset.id, false)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {user?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
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
