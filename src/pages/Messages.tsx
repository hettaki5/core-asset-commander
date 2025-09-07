/* Working Messages.tsx with actual MessagingInterface */
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessagingInterface } from "@/components/messages/MessagingInterface"; // Adjust path if needed
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Clock, TrendingUp } from "lucide-react";

export const Messages: React.FC = () => {
  const { user } = useAuth();

  // Mock data for now since we don't have useMessaging hook yet
  const conversations = [];
  const unreadCount = 0;
  const isConnected = false;
  const isLoading = false;

  // Calculs des statistiques
  const totalConversations = conversations.length;
  const privateConversations = conversations.filter(
    (c: any) => c.type === "PRIVATE"
  ).length;
  const groupConversations = conversations.filter(
    (c: any) => c.type === "GROUP"
  ).length;
  const activeConversations = conversations.filter(
    (c: any) => c.messageCount > 0
  ).length;
  const totalMessages = conversations.reduce(
    (sum: number, conv: any) => sum + conv.messageCount,
    0
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Vous devez être connecté pour accéder aux messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communiquez en temps réel avec votre équipe
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "En ligne" : "Hors ligne"}
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              {privateConversations} privées • {groupConversations} groupes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Badge className="h-4 w-4 p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
              Non lus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">messages en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">messages échangés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeConversations}
            </div>
            <p className="text-xs text-muted-foreground">
              conversations actives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interface de messagerie principale */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">
                Chargement de vos conversations...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <MessagingInterface />
        </Card>
      )}

      {/* Guide d'utilisation pour les nouveaux utilisateurs */}
      {totalConversations === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Bienvenue dans la messagerie
            </CardTitle>
            <CardDescription>
              Voici comment commencer à utiliser la messagerie de PLM Lab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Conversations privées</h4>
                <p className="text-sm text-muted-foreground">
                  Échangez directement avec un collègue en créant une
                  conversation privée. Toutes vos communications sont sécurisées
                  et privées.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Groupes d'équipe</h4>
                <p className="text-sm text-muted-foreground">
                  Créez des groupes pour vos équipes projets. Organisez vos
                  discussions par thème et gardez tout le monde informé.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Temps réel</h4>
                <p className="text-sm text-muted-foreground">
                  Recevez vos messages instantanément. Voyez quand vos collègues
                  tapent et restez synchronisés.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Notifications intelligentes</h4>
                <p className="text-sm text-muted-foreground">
                  Ne ratez aucun message important. Le système suit
                  automatiquement vos messages non lus et vous tient informé.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
