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
  GitBranch,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  User,
} from "lucide-react";
import { WorkflowHistory } from "@/types";

export const Workflows: React.FC = () => {
  const { workflowHistory, assets } = useAppData();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Historique simulé pour le prototype
  const mockHistory: WorkflowHistory[] = [
    {
      id: "1",
      entityId: "1",
      entityType: "asset",
      fromStatus: "draft",
      toStatus: "submitted",
      performedBy: "2",
      performedAt: "2024-01-20T10:00:00Z",
      comment: "Asset prêt pour validation",
    },
    {
      id: "2",
      entityId: "1",
      entityType: "asset",
      fromStatus: "submitted",
      toStatus: "approved",
      performedBy: "3",
      performedAt: "2024-01-20T14:30:00Z",
      comment: "Spécifications conformes, approuvé",
    },
    {
      id: "3",
      entityId: "2",
      entityType: "asset",
      fromStatus: "draft",
      toStatus: "submitted",
      performedBy: "2",
      performedAt: "2024-01-21T09:15:00Z",
    },
    {
      id: "4",
      entityId: "1",
      entityType: "ticket",
      fromStatus: "open",
      toStatus: "in_progress",
      performedBy: "1",
      performedAt: "2024-01-22T08:00:00Z",
      comment: "Prise en charge du ticket de configuration",
    },
  ];

  const allHistory = [...workflowHistory, ...mockHistory];

  // Utilisateurs simulés
  const users = [
    { id: "1", name: "Jean Martin", role: "admin" },
    { id: "2", name: "Marie Dubois", role: "ingenieurpr" },
    { id: "3", name: "Pierre Durand", role: "validateur" },
    { id: "4", name: "Sophie Bernard", role: "observateur" },
  ];

  const filteredHistory = allHistory.filter((item) => {
    const asset = assets.find((a) => a.id === item.entityId);
    const matchesSearch =
      asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fromStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.toStatus.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEntity =
      entityFilter === "all" || item.entityType === entityFilter;
    const matchesStatus =
      statusFilter === "all" || item.toStatus === statusFilter;

    return matchesSearch && matchesEntity && matchesStatus;
  });

  const canViewWorkflows = currentUser?.roles.some((role) =>
    ["admin", "validateur"].includes(role)
  );

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Utilisateur inconnu";
  };

  const getAssetName = (entityId: string, entityType: string) => {
    if (entityType === "asset") {
      const asset = assets.find((a) => a.id === entityId);
      return asset ? asset.name : `Asset ${entityId}`;
    }
    return `Ticket ${entityId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      draft: "Brouillon",
      submitted: "Soumis",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      open: "Ouvert",
      in_progress: "En cours",
      resolved: "Résolu",
      closed: "Fermé",
    };
    return labels[status] || status;
  };

  const getWorkflowStats = () => {
    const totalTransitions = allHistory.length;
    const todayTransitions = allHistory.filter((item) => {
      const itemDate = new Date(item.performedAt);
      const today = new Date();
      return itemDate.toDateString() === today.toDateString();
    }).length;

    const approvals = allHistory.filter(
      (item) => item.toStatus === "approved"
    ).length;
    const rejections = allHistory.filter(
      (item) => item.toStatus === "rejected"
    ).length;

    return { totalTransitions, todayTransitions, approvals, rejections };
  };

  const stats = getWorkflowStats();

  if (!canViewWorkflows) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Seuls les administrateurs et validateurs peuvent accéder aux
              workflows.
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
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Suivez le cycle de vie des assets et tickets
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Transitions Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransitions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.todayTransitions}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approbations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvals}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejections}
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
                  placeholder="Rechercher dans l'historique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type d'entité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                <SelectItem value="asset">Assets</SelectItem>
                <SelectItem value="ticket">Tickets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut final" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="submitted">Soumis</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Historique des workflows */}
      <Card>
        <CardHeader>
          <CardTitle>
            Historique des Transitions ({filteredHistory.length})
          </CardTitle>
          <CardDescription>
            Suivi chronologique des changements d'état des assets et tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Transition</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory
                .sort(
                  (a, b) =>
                    new Date(b.performedAt).getTime() -
                    new Date(a.performedAt).getTime()
                )
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {new Date(item.performedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(item.performedAt).toLocaleTimeString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {getAssetName(item.entityId, item.entityType)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.entityType === "asset" ? "Asset" : "Ticket"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.fromStatus)}>
                          {getStatusLabel(item.fromStatus)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className={getStatusColor(item.toStatus)}>
                          {getStatusLabel(item.toStatus)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {getUserName(item.performedBy)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {item.comment ? (
                          <span className="text-sm text-muted-foreground">
                            {item.comment}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Aucun commentaire
                          </span>
                        )}
                      </div>
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

      {/* Diagramme de flux workflow (simplifié) */}
      <Card>
        <CardHeader>
          <CardTitle>Diagramme de Flux - Assets</CardTitle>
          <CardDescription>
            Visualisation du workflow de validation des assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4 py-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium">Brouillon</span>
              <span className="text-xs text-muted-foreground">Création</span>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground" />

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <GitBranch className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Soumis</span>
              <span className="text-xs text-muted-foreground">Validation</span>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground" />

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <span className="text-sm font-medium">Approuvé</span>
              <span className="text-xs text-muted-foreground">Final</span>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Les assets suivent ce workflow de validation pour assurer la
              qualité des données
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
