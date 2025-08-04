import React, { useState } from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Filter,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { LogEntry } from "@/types";

export const Logs: React.FC = () => {
  const { logs } = useAppData();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Logs simulés pour le prototype (ajout de données)
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      action: "CREATE_ASSET",
      entityType: "asset",
      entityId: "1",
      performedBy: "2",
      performedAt: "2024-01-22T10:30:00Z",
      details: { name: "Laptop-DEV-001", type: "Ordinateur portable" },
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      action: "VALIDATE_ASSET",
      entityType: "asset",
      entityId: "1",
      performedBy: "3",
      performedAt: "2024-01-22T14:15:00Z",
      details: { approved: true, comment: "Asset validé avec succès" },
      ipAddress: "192.168.1.101",
    },
    {
      id: "3",
      action: "CREATE_USER",
      entityType: "user",
      entityId: "4",
      performedBy: "1",
      performedAt: "2024-01-21T09:00:00Z",
      details: { username: "observateur1", role: "observateur" },
      ipAddress: "192.168.1.50",
    },
    {
      id: "4",
      action: "LOGIN_FAILED",
      entityType: "user",
      entityId: "unknown",
      performedBy: "system",
      performedAt: "2024-01-22T08:45:00Z",
      details: { username: "invalid_user", reason: "Invalid credentials" },
      ipAddress: "192.168.1.200",
    },
    {
      id: "5",
      action: "DELETE_ASSET",
      entityType: "asset",
      entityId: "999",
      performedBy: "1",
      performedAt: "2024-01-20T16:30:00Z",
      details: { name: "Old-Server-001", reason: "End of life" },
      ipAddress: "192.168.1.50",
    },
  ];

  const allLogs = [...logs, ...mockLogs];

  // Utilisateurs simulés
  const users = [
    { id: "1", name: "Jean Martin" },
    { id: "2", name: "Marie Dubois" },
    { id: "3", name: "Pierre Durand" },
    { id: "4", name: "Sophie Bernard" },
    { id: "system", name: "Système" },
  ];

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesAction =
      actionFilter === "all" || log.action.includes(actionFilter);
    const matchesEntity =
      entityFilter === "all" || log.entityType === entityFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const logDate = new Date(log.performedAt);
      const now = new Date();
      switch (dateFilter) {
        case "today":
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE"))
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.includes("DELETE"))
      return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes("FAILED") || action.includes("ERROR"))
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (action.includes("VALIDATE") || action.includes("APPROVE"))
      return <CheckCircle className="h-4 w-4 text-blue-600" />;
    return <Info className="h-4 w-4 text-gray-600" />;
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      CREATE_ASSET: "Création d'asset",
      UPDATE_ASSET: "Modification d'asset",
      DELETE_ASSET: "Suppression d'asset",
      VALIDATE_ASSET: "Validation d'asset",
      CREATE_USER: "Création d'utilisateur",
      UPDATE_USER: "Modification d'utilisateur",
      DELETE_USER: "Suppression d'utilisateur",
      LOGIN_SUCCESS: "Connexion réussie",
      LOGIN_FAILED: "Échec de connexion",
      LOGOUT: "Déconnexion",
      CREATE_TICKET: "Création de ticket",
      UPDATE_TICKET: "Modification de ticket",
      CREATE_ASSET_TYPE: "Création de type d'asset",
      UPDATE_ASSET_TYPE: "Modification de type d'asset",
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: { [key: string]: string } = {
      asset: "Asset",
      user: "Utilisateur",
      ticket: "Ticket",
      config: "Configuration",
    };
    return labels[entityType] || entityType;
  };

  // Vérifier si l'utilisateur actuel est admin
  if (!currentUser?.roles.includes("admin")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Seuls les administrateurs peuvent accéder aux logs système.
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
          <h1 className="text-3xl font-bold">Logs Système</h1>
          <p className="text-muted-foreground">
            Surveillez l'activité du système
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                allLogs.filter((log) => {
                  const logDate = new Date(log.performedAt);
                  const today = new Date();
                  return logDate.toDateString() === today.toDateString();
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                allLogs.filter(
                  (log) =>
                    log.action.includes("FAILED") ||
                    log.action.includes("ERROR")
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connexions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allLogs.filter((log) => log.action.includes("LOGIN")).length}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="CREATE">Créations</SelectItem>
                <SelectItem value="UPDATE">Modifications</SelectItem>
                <SelectItem value="DELETE">Suppressions</SelectItem>
                <SelectItem value="LOGIN">Connexions</SelectItem>
                <SelectItem value="VALIDATE">Validations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
                <SelectItem value="ticket">Tickets</SelectItem>
                <SelectItem value="config">Configuration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute période</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Système ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horodatage</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs
                .sort(
                  (a, b) =>
                    new Date(b.performedAt).getTime() -
                    new Date(a.performedAt).getTime()
                )
                .map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {new Date(log.performedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(log.performedAt).toLocaleTimeString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium">
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getEntityLabel(log.entityType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getUserName(log.performedBy)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {JSON.stringify(log.details, null, 0)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {log.ipAddress}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
