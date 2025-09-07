// src/pages/Tickets.tsx - Enhanced version with pagination and improved styling
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bug,
  Settings,
  FileText,
  Zap,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { JiraTicketDto } from "@/types/tickets";

export const Tickets: React.FC = () => {
  const { user } = useAuth();
  const {
    tickets,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshTickets,
  } = useTickets();

  // Local filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Vérification des permissions admin
  const isAdmin = user?.roles.includes("admin");

  // Apply filters to tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description &&
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesType = typeFilter === "all" || ticket.issueType === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, priorityFilter]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les administrateurs peuvent accéder aux tickets Jira.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "highest":
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-orange-600 bg-orange-100";
      case "low":
      case "lowest":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "highest":
        return <AlertCircle className="h-4 w-4" />;
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "low":
      case "lowest":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "task":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "story":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "epic":
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "to do":
      case "open":
        return "bg-blue-500 text-white";
      case "in progress":
        return "bg-orange-500 text-white";
      case "done":
      case "resolved":
      case "closed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tickets Jira</h1>
            <p className="text-muted-foreground">Une erreur s'est produite</p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Erreur: {error}</span>
            <Button variant="outline" size="sm" onClick={refreshTickets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets Jira</h1>
          <p className="text-muted-foreground">
            Gestion des demandes de configuration depuis Jira
          </p>
        </div>
        <Button onClick={refreshTickets} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
              </CardContent>
            </Card>

            {Object.entries(stats.statusBreakdown)
              .slice(0, 3)
              .map(([status, count]) => (
                <Card key={status}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {status}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                  </CardContent>
                </Card>
              ))}
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                Aucune statistique disponible
              </div>
            </CardContent>
          </Card>
        )}
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
                  placeholder="Rechercher un ticket..."
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
                {stats &&
                  Object.keys(stats.statusBreakdown).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {stats &&
                  Object.keys(stats.typeBreakdown).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table des tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Clé
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Résumé
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Priorité
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Statut
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Assigné à
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Mis à jour
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTickets.map((ticket: JiraTicketDto, index) => (
                    <TableRow
                      key={ticket.id}
                      className={`
                        border-b border-gray-100 
                        hover:bg-gray-50 
                        transition-colors 
                        duration-150 
                        ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}
                      `}
                    >
                      <TableCell className="font-medium py-4 px-6 text-center">
                        <Badge variant="outline" className="font-mono">
                          {ticket.key}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center max-w-xs">
                        <div>
                          <div className="font-medium text-gray-900 truncate">
                            {ticket.summary}
                          </div>
                          {ticket.description && (
                            <div className="text-sm text-gray-600 truncate mt-1">
                              {ticket.description.substring(0, 80)}
                              {ticket.description.length > 80 && "..."}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getTypeIcon(ticket.issueType)}
                          <span className="text-sm">{ticket.issueType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {getPriorityIcon(ticket.priority)}
                            {ticket.priority}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          <Badge
                            className={`${getStatusColor(
                              ticket.status
                            )} font-medium px-3 py-1`}
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        {ticket.assignee || (
                          <span className="text-muted-foreground italic">
                            Non assigné
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600 text-center">
                        {new Date(ticket.updated).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://hasnaettaki5.atlassian.net/browse/${ticket.key}`,
                              "_blank"
                            )
                          }
                          title="Voir dans Jira"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && filteredTickets.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Affichage de {startIndex + 1} à{" "}
                {Math.min(endIndex, filteredTickets.length)} sur{" "}
                {filteredTickets.length} résultats
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {filteredTickets.length === 0 && !loading && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun ticket trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                Aucun ticket ne correspond aux filtres actuels
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="mr-2"
                >
                  Réinitialiser les filtres
                </Button>
                <Button onClick={refreshTickets}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
