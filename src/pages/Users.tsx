
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Key } from 'lucide-react';
import { User, UserRole } from '@/types';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'observateur' as UserRole
  });

  // Utilisateurs simulés pour le prototype
  const [users] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@assetflow.com',
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-01-22T08:30:00Z'
    },
    {
      id: '2',
      username: 'ingenieur1',
      email: 'marie.dubois@assetflow.com',
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'ingenieurpr',
      isActive: true,
      mustChangePassword: true,
      createdAt: '2024-01-10T00:00:00Z',
      lastLogin: '2024-01-21T14:20:00Z'
    },
    {
      id: '3',
      username: 'validateur1',
      email: 'pierre.durand@assetflow.com',
      firstName: 'Pierre',
      lastName: 'Durand',
      role: 'validateur',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-01-22T09:15:00Z'
    },
    {
      id: '4',
      username: 'observateur1',
      email: 'sophie.bernard@assetflow.com',
      firstName: 'Sophie',
      lastName: 'Bernard',
      role: 'observateur',
      isActive: false,
      createdAt: '2024-01-18T00:00:00Z'
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    if (newUser.username.trim() && newUser.email.trim() && newUser.firstName.trim() && newUser.lastName.trim()) {
      // Simulation de création d'utilisateur
      console.log('Création utilisateur:', newUser);
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'observateur'
      });
      setIsCreating(false);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'ingenieurpr': return 'Ingénieur';
      case 'validateur': return 'Validateur';
      case 'observateur': return 'Observateur';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'default';
      case 'ingenieurpr': return 'secondary';
      case 'validateur': return 'outline';
      case 'observateur': return 'secondary';
      default: return 'secondary';
    }
  };

  // Vérifier si l'utilisateur actuel est admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Seuls les administrateurs peuvent accéder à la gestion des utilisateurs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => !u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Changement requis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.mustChangePassword).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvel Utilisateur</CardTitle>
            <CardDescription>Créez un nouveau compte utilisateur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="nom.utilisateur"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observateur">Observateur</SelectItem>
                  <SelectItem value="ingenieurpr">Ingénieur</SelectItem>
                  <SelectItem value="validateur">Validateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateUser}>
                Créer l'utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
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
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="ingenieurpr">Ingénieur</SelectItem>
                <SelectItem value="validateur">Validateur</SelectItem>
                <SelectItem value="observateur">Observateur</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      {user.mustChangePassword && (
                        <Badge variant="outline" className="text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          Mot de passe
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <span className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Jamais</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={user.isActive ? "text-red-600" : "text-green-600"}
                      >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Key className="h-4 w-4" />
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
