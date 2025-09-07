// src/pages/Dashboard.tsx - REMPLACE TOUT LE CONTENU
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useAssets } from "@/hooks/useAssets";
import {
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ticket,
  Calendar,
  MessageSquare,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { assets, loading, error, stats, refreshAssets, getAssetsByStatus } =
    useAssets();

  if (!user) return null;

  // Helper pour vérifier les rôles
  const hasRole = (role: string) => user.roles.includes(role);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Bonjour";
    if (hour >= 18) greeting = "Bonsoir";
    else if (hour >= 12) greeting = "Bon après-midi";

    return `${greeting}, ${user.firstName} !`;
  };

  const getRoleSpecificStats = () => {
    if (hasRole("admin")) {
      return [
        {
          title: "Total des Assets",
          value: stats.totalAssets,
          icon: Package,
          description: "Assets dans le système",
          color: "text-blue-600",
        },
        {
          title: "En attente de validation",
          value: stats.pendingAssets,
          icon: Clock,
          description: "Nécessitent une validation",
          color: "text-orange-600",
        },
        {
          title: "Approuvés",
          value: stats.approvedAssets,
          icon: CheckCircle,
          description: "Assets validés",
          color: "text-green-600",
        },
        {
          title: "Mes Assets",
          value: stats.myAssets,
          icon: Package,
          description: "Assets créés par moi",
          color: "text-purple-600",
        },
      ];
    }

    if (hasRole("ingenieurpr")) {
      return [
        {
          title: "Mes Assets",
          value: stats.myAssets,
          icon: Package,
          description: "Assets créés par moi",
          color: "text-blue-600",
        },
        {
          title: "En validation",
          value: getAssetsByStatus("SUBMITTED").filter(
            (a) => a.createdBy === user.id
          ).length,
          icon: Clock,
          description: "En attente de validation",
          color: "text-orange-600",
        },
        {
          title: "Approuvés",
          value: getAssetsByStatus("APPROVED").filter(
            (a) => a.createdBy === user.id
          ).length,
          icon: CheckCircle,
          description: "Mes assets approuvés",
          color: "text-green-600",
        },
        {
          title: "Brouillons",
          value: getAssetsByStatus("DRAFT").filter(
            (a) => a.createdBy === user.id
          ).length,
          icon: AlertTriangle,
          description: "À compléter",
          color: "text-gray-600",
        },
      ];
    }

    if (hasRole("validateur")) {
      return [
        {
          title: "À valider",
          value: stats.pendingAssets,
          icon: AlertTriangle,
          description: "Assets en attente",
          color: "text-orange-600",
        },
        {
          title: "Total validés",
          value: stats.approvedAssets,
          icon: CheckCircle,
          description: "Assets approuvés",
          color: "text-green-600",
        },
        {
          title: "Total Assets",
          value: stats.totalAssets,
          icon: Package,
          description: "Dans le système",
          color: "text-blue-600",
        },
        {
          title: "Rejetés",
          value: stats.rejectedAssets,
          icon: AlertTriangle,
          description: "Nécessitent correction",
          color: "text-red-600",
        },
      ];
    }

    if (hasRole("observateur")) {
      return [
        {
          title: "Assets consultables",
          value: stats.approvedAssets,
          icon: Package,
          description: "Assets approuvés",
          color: "text-green-600",
        },
        {
          title: "Activité récente",
          value: Math.min(stats.totalAssets, 12),
          icon: TrendingUp,
          description: "Dernières mises à jour",
          color: "text-blue-600",
        },
        {
          title: "Total Assets",
          value: stats.totalAssets,
          icon: Package,
          description: "Dans le système",
          color: "text-gray-600",
        },
        {
          title: "En cours",
          value: stats.pendingAssets,
          icon: Clock,
          description: "En validation",
          color: "text-orange-600",
        },
      ];
    }

    return [];
  };

  const getRoleLabel = () => {
    if (hasRole("admin")) return "Admin";
    if (hasRole("ingenieurpr")) return "Ingénieur";
    if (hasRole("validateur")) return "Validateur";
    if (hasRole("observateur")) return "Observateur";
    return "Utilisateur";
  };

  const roleStats = getRoleSpecificStats();
  const recentAssets = assets.slice(0, 5);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getWelcomeMessage()}
            </h1>
            <p className="text-muted-foreground">Tableau de bord PLM</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {getRoleLabel()}
          </Badge>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Erreur lors du chargement des données: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAssets}
              className="ml-4"
            >
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {getRoleLabel()}
          </Badge>
          {!loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAssets}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : roleStats.map((stat, index) => (
              <Card key={index} className="transition-smooth hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : (
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
                {recentAssets.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun asset récent
                  </p>
                )}
              </div>
            )}
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
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {assets.slice(0, 5).map((asset, index) => (
                  <div key={asset.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{asset.name}</span> a été{" "}
                        {asset.status === "APPROVED"
                          ? "approuvé"
                          : asset.status === "SUBMITTED"
                          ? "soumis pour validation"
                          : asset.status === "PENDING_VALIDATION"
                          ? "mis en attente de validation"
                          : asset.status === "REJECTED"
                          ? "rejeté"
                          : "créé"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(asset.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}

                {assets.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune activité récente
                  </p>
                )}
              </div>
            )}
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
              <button
                className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth text-left"
                onClick={() => (window.location.href = "/assets?action=create")}
              >
                <Package className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-medium">Créer un asset</h4>
                <p className="text-sm text-muted-foreground">
                  Ajouter un nouvel équipement
                </p>
              </button>

              {hasRole("admin") && (
                <button
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth text-left"
                  onClick={() => (window.location.href = "/config")}
                >
                  <Ticket className="h-8 w-8 text-orange-500 mb-2" />
                  <h4 className="font-medium">Gérer les configurations</h4>
                  <p className="text-sm text-muted-foreground">
                    Configurer les formulaires
                  </p>
                </button>
              )}

              <button
                className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth text-left"
                onClick={() =>
                  (window.location.href = "/assets?status=PENDING_VALIDATION")
                }
              >
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <h4 className="font-medium">Assets à valider</h4>
                <p className="text-sm text-muted-foreground">
                  Voir les validations en attente
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
