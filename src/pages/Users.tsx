// src/pages/Users.tsx - VERSION COMPLÈTE CORRIGÉE
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";

// ✅ IMPORTS CORRIGÉS - Types depuis @/types, service séparément
import type {
  User,
  UserListResponse,
  ListUsersFilters,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from "@/types";

import { adminUserService } from "@/services/adminUserService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // États principaux
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  // États de pagination et filtres
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // États d'interface
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // États pour les modales
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  );

  // État du formulaire de création
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roles: ["observateur"],
  });

  // 🔧 AJOUT: État du formulaire d'édition (manquait dans votre code)
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    roles: ["observateur"],
  });

  // Diagnostic au démarrage
  useEffect(() => {
    console.log("=== DIAGNOSTIC USERS PAGE ===");
    console.log("Current User:", currentUser);
    console.log("Auth Header:", authService.getAuthHeader());
    console.log("Has admin role:", currentUser?.roles?.includes("admin"));
    console.log("🔍 Backend URL:", "http://localhost:8090");
  }, [currentUser]);

  // Chargement des utilisateurs
  const loadUsers = async (filters?: ListUsersFilters) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Loading users with filters:", filters);

      const currentFilters: ListUsersFilters = {
        page: currentPage,
        size: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        ...filters,
      };

      // Appliquer les filtres de l'interface
      if (searchTerm.trim()) {
        currentFilters.search = searchTerm.trim();
      }

      if (roleFilter !== "all") {
        currentFilters.roles = [roleFilter];
      }

      if (statusFilter === "active") {
        currentFilters.enabled = true;
      } else if (statusFilter === "inactive") {
        currentFilters.enabled = false;
      }

      const response: UserListResponse = await adminUserService.getUsers(
        currentFilters
      );
      console.log("✅ Users loaded:", response);

      setUsers(response.users || []);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.currentPage);

      toast({
        title: "Utilisateurs chargés",
        description: `${response.users?.length || 0} utilisateurs trouvés`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des utilisateurs";
      console.error("❌ Error loading users:", error);
      setError(errorMessage);
      setUsers([]);

      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Chargement des statistiques
  const loadStats = async () => {
    try {
      console.log("📊 Loading stats...");
      const statsData = await adminUserService.getStats();
      console.log("✅ Stats loaded:", statsData);
      setStats(statsData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossible de charger les statistiques";
      console.error("❌ Error loading stats:", error);
      toast({
        variant: "destructive",
        title: "Erreur stats",
        description: errorMessage,
      });
    }
  };

  // Création d'utilisateur
  const handleCreateUser = async () => {
    if (
      !newUser.username.trim() ||
      !newUser.email.trim() ||
      !newUser.firstName.trim() ||
      !newUser.lastName.trim() ||
      !newUser.password.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Tous les champs obligatoires doivent être remplis",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("➕ Creating user:", newUser);

      const createdUser = await adminUserService.createUser(newUser);
      console.log("✅ User created:", createdUser);

      // Réinitialiser le formulaire
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roles: ["observateur"],
      });
      setIsCreating(false);

      // Recharger la liste
      await loadUsers();
      await loadStats();

      toast({
        title: "Succès",
        description: `Utilisateur ${createdUser.username} créé avec succès`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'utilisateur";
      console.error("❌ Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 CORRECTION: Handler pour modifier un utilisateur
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;

    if (
      !editFormData.firstName?.trim() ||
      !editFormData.lastName?.trim() ||
      !editFormData.email?.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Les champs prénom, nom et email sont obligatoires",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("✏️ Updating user:", editingUser.id, editFormData);

      const updatedUser = await adminUserService.updateUser(
        editingUser.id,
        editFormData
      );
      console.log("✅ User updated:", updatedUser);

      // Mettre à jour la liste locale
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
      );

      setIsEditModalOpen(false);
      setEditingUser(null);

      toast({
        title: "Utilisateur modifié",
        description: `Les informations de ${updatedUser.firstName} ${updatedUser.lastName} ont été mises à jour`,
      });

      await loadStats();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la modification de l'utilisateur";
      console.error("❌ Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Erreur de modification",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔑 HANDLER POUR RÉINITIALISER LE MOT DE PASSE
  const handleResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleConfirmResetPassword = async (newPassword?: string) => {
    if (!userToResetPassword) return;

    try {
      setLoading(true);
      console.log("🔑 Resetting password for user:", userToResetPassword.id);

      await adminUserService.resetPassword(userToResetPassword.id, newPassword);
      console.log("✅ Password reset successfully");

      setIsResetPasswordModalOpen(false);
      setUserToResetPassword(null);

      toast({
        title: "Mot de passe réinitialisé",
        description: `Le mot de passe de ${userToResetPassword.firstName} ${userToResetPassword.lastName} a été réinitialisé. L'utilisateur devra le changer à sa prochaine connexion.`,
      });

      // Recharger les données pour refléter le changement
      await loadUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la réinitialisation du mot de passe";
      console.error("❌ Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Erreur de réinitialisation",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ HANDLER POUR SUPPRIMER UN UTILISATEUR
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      console.log("🗑️ Deleting user:", userToDelete.id);

      await adminUserService.deleteUser(userToDelete.id);
      console.log("✅ User deleted successfully");

      // Retirer de la liste locale
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));

      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      toast({
        title: "Utilisateur supprimé",
        description: `${userToDelete.firstName} ${userToDelete.lastName} a été supprimé avec succès`,
      });

      await loadStats();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'utilisateur";
      console.error("❌ Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Erreur de suppression",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 📧 HANDLER POUR RENVOYER L'EMAIL DE BIENVENUE
  const handleResendWelcomeEmail = async (user: User) => {
    try {
      setLoading(true);
      console.log("📧 Resending welcome email for user:", user.id);

      await adminUserService.resendWelcomeEmail(user.id);
      console.log("✅ Welcome email sent successfully");

      toast({
        title: "Email envoyé",
        description: `L'email de bienvenue a été renvoyé à ${user.email}`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'email";
      console.error("❌ Error sending welcome email:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'envoi",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 📊 HANDLER POUR EXPORTER LES UTILISATEURS
  const handleExportUsers = async () => {
    try {
      setLoading(true);
      console.log("📊 Exporting users...");

      const filters: ListUsersFilters = {
        search: searchTerm.trim() || undefined,
        roles: roleFilter !== "all" ? [roleFilter] : undefined,
        enabled:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
            ? false
            : undefined,
      };

      const blob = await adminUserService.exportUsers(filters);

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "La liste des utilisateurs a été exportée avec succès",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'export";
      console.error("❌ Error exporting users:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 CORRECTION: Toggle du statut utilisateur
  const handleToggleUserStatus = async (user: User) => {
    try {
      console.log(
        "🔒 Toggling status for user:",
        user.id,
        "current status:",
        user.enabled
      );

      const updatedUser = await adminUserService.toggleUserStatus(
        user.id,
        !user.enabled
      );
      console.log("✅ Status toggled:", updatedUser);

      // Mettre à jour la liste locale
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));

      toast({
        title: "Statut modifié",
        description: `Utilisateur ${updatedUser.firstName} ${
          updatedUser.lastName
        } ${updatedUser.enabled ? "activé" : "désactivé"}`,
      });

      await loadStats();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors du changement de statut";
      console.error("❌ Error toggling status:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    }
  };

  // Effet pour charger les données au démarrage
  useEffect(() => {
    if (currentUser?.roles?.includes("admin")) {
      loadUsers();
      loadStats();
    }
  }, [currentUser]);

  // Effet pour recharger quand les filtres changent
  useEffect(() => {
    if (currentUser?.roles?.includes("admin")) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(0);
        loadUsers({ page: 0 });
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  // Fonctions utilitaires
  const getRoleLabel = (roles: UserRole[]) => {
    if (roles.includes("admin")) return "Administrateur";
    if (roles.includes("ingenieurpr")) return "Ingénieur";
    if (roles.includes("validateur")) return "Validateur";
    if (roles.includes("observateur")) return "Observateur";
    return roles[0] || "Utilisateur";
  };

  const getRoleBadgeVariant = (
    roles: UserRole[]
  ): "default" | "secondary" | "outline" => {
    if (roles.includes("admin")) return "default";
    if (roles.includes("ingenieurpr")) return "secondary";
    if (roles.includes("validateur")) return "outline";
    if (roles.includes("observateur")) return "secondary";
    return "secondary";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Vérification des permissions
  if (!currentUser?.roles?.includes("admin")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Seuls les administrateurs peuvent accéder à la gestion des
              utilisateurs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportUsers}
            variant="outline"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setIsCreating(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total utilisateurs
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs actifs
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeUsers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs inactifs
              </CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.inactiveUsers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nouveaux ce mois
              </CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.newUsersThisMonth}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, email, username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-filter">Rôle</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="ingenieurpr">Ingénieur</SelectItem>
                  <SelectItem value="validateur">Validateur</SelectItem>
                  <SelectItem value="observateur">Observateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => loadUsers()}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des erreurs */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs ({totalElements})
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin inline ml-2" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {users.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.roles)}>
                          {getRoleLabel(user.roles)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.enabled ? "default" : "secondary"}>
                          {user.enabled ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin
                          ? formatDate(user.lastLogin)
                          : "Jamais connecté"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            disabled={loading}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={loading}
                            title={user.enabled ? "Désactiver" : "Activer"}
                          >
                            {user.enabled ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            disabled={loading}
                            title="Réinitialiser mot de passe"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendWelcomeEmail(user)}
                            disabled={loading}
                            title="Renvoyer email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={loading}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} sur {totalPages} ({totalElements}{" "}
                utilisateurs)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(Math.max(0, currentPage - 1));
                    loadUsers({ page: Math.max(0, currentPage - 1) });
                  }}
                  disabled={currentPage === 0 || loading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
                    loadUsers({
                      page: Math.min(totalPages - 1, currentPage + 1),
                    });
                  }}
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création d'utilisateur */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créer un nouveau compte utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder="john.doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe temporaire *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Mot de passe temporaire"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={newUser.roles[0]}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, roles: [value as UserRole] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observateur">Observateur</SelectItem>
                  <SelectItem value="validateur">Validateur</SelectItem>
                  <SelectItem value="ingenieurpr">Ingénieur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewUser({
                  username: "",
                  email: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  roles: ["observateur"],
                });
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateUser} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔧 AJOUT: Modal d'édition d'utilisateur (manquait dans votre code) */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de {editingUser?.firstName}{" "}
              {editingUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Prénom *</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Nom *</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      lastName: e.target.value,
                    })
                  }
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={editFormData.roles?.[0] || "observateur"}
                onValueChange={(value) =>
                  setEditFormData({
                    ...editFormData,
                    roles: [value as UserRole],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observateur">Observateur</SelectItem>
                  <SelectItem value="validateur">Validateur</SelectItem>
                  <SelectItem value="ingenieurpr">Ingénieur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingUser(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveEditUser} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de réinitialisation de mot de passe */}
      <Dialog
        open={isResetPasswordModalOpen}
        onOpenChange={setIsResetPasswordModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Réinitialiser le mot de passe de{" "}
              <strong>
                {userToResetPassword?.firstName} {userToResetPassword?.lastName}
              </strong>
              ? L'utilisateur devra changer son mot de passe à sa prochaine
              connexion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResetPasswordModalOpen(false);
                setUserToResetPassword(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleConfirmResetPassword()}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
