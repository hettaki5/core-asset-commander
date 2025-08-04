// src/pages/Dashboard.tsx - VERSION CORRIGÉE
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/contexts/AppDataContext";
import {
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ticket,
  Calendar,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { assets, tickets, events, messages } = useAppData();

  if (!user) return null;

  // Helper pour vérifier les rôles (car user.roles est un tableau)
  const hasRole = (role: string) => user.roles.includes(role);

  // Statistiques basées sur le rôle
  const totalAssets = assets.length;
  const approvedAssets = assets.filter((a) => a.status === "approved").length;
  const pendingAssets = assets.filter(
    (a) => a.status === "submitted" || a.status === "pending"
  ).length;
  const myAssets = assets.filter((a) => a.createdBy === user.id).length;

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const myTickets = tickets.filter(
    (t) => t.createdBy === user.id || t.assignedTo === user.id
  ).length;

  const upcomingEvents = events.filter((e) => {
    const eventDate = new Date(e.startDate);
    const today = new Date();
    const inNextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= inNextWeek;
  }).length;

  const unreadMessages = messages.filter(
    (m) => m.toUserId === user.id && !m.isRead
  ).length;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Bonjour";
    if (hour >= 18) greeting = "Bonsoir";
    else if (hour >= 12) greeting = "Bon après-midi";

    return `${greeting}, ${user.firstName} !`;
  };

  const getRoleSpecificStats = () => {
    // Vérifier les rôles avec user.roles.includes()
    if (hasRole("admin")) {
      return [
        {
          title: "Total des Assets",
          value: totalAssets,
          icon: Package,
          description: "Assets dans le système",
        },
        {
          title: "En attente de validation",
          value: pendingAssets,
          icon: Clock,
          description: "Nécessitent une validation",
        },
        {
          title: "Tickets ouverts",
          value: openTickets,
          icon: Ticket,
          description: "Tickets à traiter",
        },
        {
          title: "Événements à venir",
          value: upcomingEvents,
          icon: Calendar,
          description: "Cette semaine",
        },
      ];
    }

    if (hasRole("ingenieurpr")) {
      return [
        {
          title: "Mes Assets",
          value: myAssets,
          icon: Package,
          description: "Assets créés par moi",
        },
        {
          title: "En validation",
          value: assets.filter(
            (a) => a.createdBy === user.id && a.status === "submitted"
          ).length,
          icon: Clock,
          description: "En attente de validation",
        },
        {
          title: "Mes Tickets",
          value: myTickets,
          icon: Ticket,
          description: "Tickets assignés ou créés",
        },
        {
          title: "Messages non lus",
          value: unreadMessages,
          icon: MessageSquare,
          description: "Nouveaux messages",
        },
      ];
    }

    if (hasRole("validateur")) {
      return [
        {
          title: "À valider",
          value: pendingAssets,
          icon: AlertTriangle,
          description: "Assets en attente",
        },
        {
          title: "Validés ce mois",
          value: assets.filter(
            (a) => a.validatedBy === user.id && a.status === "approved"
          ).length,
          icon: CheckCircle,
          description: "Assets approuvés",
        },
        {
          title: "Tickets assignés",
          value: tickets.filter((t) => t.assignedTo === user.id).length,
          icon: Ticket,
          description: "À traiter",
        },
        {
          title: "Événements à venir",
          value: upcomingEvents,
          icon: Calendar,
          description: "Cette semaine",
        },
      ];
    }

    if (hasRole("observateur")) {
      return [
        {
          title: "Assets consultables",
          value: approvedAssets,
          icon: Package,
          description: "Assets approuvés",
        },
        {
          title: "Activité récente",
          value: Math.min(totalAssets, 12),
          icon: TrendingUp,
          description: "Dernières mises à jour",
        },
        {
          title: "Événements",
          value: upcomingEvents,
          icon: Calendar,
          description: "À venir cette semaine",
        },
        {
          title: "Messages",
          value: unreadMessages,
          icon: MessageSquare,
          description: "Non lus",
        },
      ];
    }

    // Cas par défaut
    return [];
  };

  const getRoleLabel = () => {
    if (hasRole("admin")) return "Admin";
    if (hasRole("ingenieurpr")) return "Ingénieur";
    if (hasRole("validateur")) return "Validateur";
    if (hasRole("observateur")) return "Observateur";
    return "Utilisateur";
  };

  const stats = getRoleSpecificStats();
  const recentAssets = assets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getWelcomeMessage()}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité sur la plateforme AssetFlow
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {getRoleLabel()}
        </Badge>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets récents */}
        <Card>
          <CardHeader>
            <CardTitle>Assets récents</CardTitle>
            <CardDescription>Derniers assets créés ou modifiés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{asset.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {asset.type}
                    </p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
              {recentAssets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun asset récent
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.slice(0, 3).map((asset, index) => (
                <div key={asset.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{asset.name}</span> a été{" "}
                      {asset.status === "approved"
                        ? "approuvé"
                        : asset.status === "submitted"
                        ? "soumis pour validation"
                        : "créé"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(asset.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}

              {tickets.slice(0, 2).map((ticket) => (
                <div key={ticket.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Ticket className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      Ticket <span className="font-medium">{ticket.title}</span>{" "}
                      créé
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides selon le rôle */}
      {(hasRole("admin") || hasRole("ingenieurpr")) && (
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Raccourcis vers les fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth text-left">
                <Package className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-medium">Créer un asset</h4>
                <p className="text-sm text-muted-foreground">
                  Ajouter un nouvel équipement
                </p>
              </button>

              {hasRole("admin") && (
                <button className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth text-left">
                  <Ticket className="h-8 w-8 text-orange-500 mb-2" />
                  <h4 className="font-medium">Gérer les tickets</h4>
                  <p className="text-sm text-muted-foreground">
                    Traiter les demandes
                  </p>
                </button>
              )}

              <button className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth text-left">
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <h4 className="font-medium">Planifier un événement</h4>
                <p className="text-sm text-muted-foreground">
                  Ajouter au calendrier
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
