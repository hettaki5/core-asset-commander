// src/components/calendar/MeetingList.tsx
import React from "react";
import { useMeetings } from "@/hooks/useMeetings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Meeting } from "@/services/eventService";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MeetingListProps {
  type?: "all" | "upcoming" | "today";
  onMeetingClick?: (meeting: Meeting) => void;
  showActions?: boolean;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  type = "all",
  onMeetingClick,
  showActions = false,
}) => {
  const {
    meetings,
    loading,
    error,
    loadMyMeetings,
    loadUpcoming,
    loadToday,
    deleteMeeting,
  } = useMeetings({
    autoLoad: true,
    loadUpcoming: type === "upcoming",
    loadToday: type === "today",
  });

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    switch (type) {
      case "upcoming":
        loadUpcoming();
        break;
      case "today":
        loadToday();
        break;
      default:
        loadMyMeetings();
    }
  };

  // Supprimer un meeting
  const handleDeleteMeeting = async (
    meetingId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Empêcher le clic sur la carte

    if (confirm("Êtes-vous sûr de vouloir supprimer ce meeting ?")) {
      try {
        await deleteMeeting(meetingId);
      } catch (error) {
        console.error("Erreur suppression meeting:", error);
      }
    }
  };

  // Obtenir la couleur du badge selon la priorité
  const getPriorityColor = (priority: Meeting["priority"]) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return colors[priority];
  };

  // Obtenir le badge de statut
  const getStatusBadge = (meeting: Meeting) => {
    if (meeting.isUpcoming) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          À venir
        </Badge>
      );
    }
    if (meeting.isOngoing) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          En cours
        </Badge>
      );
    }
    if (meeting.isPast) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700">
          Passé
        </Badge>
      );
    }
    return null;
  };

  // Titre de la section
  const getTitle = () => {
    switch (type) {
      case "upcoming":
        return "Meetings à venir";
      case "today":
        return "Meetings d'aujourd'hui";
      default:
        return "Mes meetings";
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Erreur lors du chargement des meetings</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-1", loading && "animate-spin")}
          />
          Actualiser
        </Button>
      </div>

      {/* Liste des meetings */}
      {loading ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Chargement des meetings...
          </div>
        </Card>
      ) : meetings.length === 0 ? (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun meeting trouvé</p>
            <p className="text-sm mt-1">
              {type === "today"
                ? "Vous n'avez aucun meeting aujourd'hui"
                : type === "upcoming"
                ? "Vous n'avez aucun meeting à venir"
                : "Vous n'avez créé aucun meeting"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onMeetingClick?.(meeting)}
            >
              <div className="p-4">
                {/* En-tête du meeting */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {meeting.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getPriorityColor(meeting.priority)}>
                        {meeting.priority === "URGENT" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {meeting.priority}
                      </Badge>

                      <Badge variant="outline">{meeting.status}</Badge>

                      {getStatusBadge(meeting)}

                      <Badge variant="secondary">{meeting.category}</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  {showActions && meeting.canEdit && (
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteMeeting(meeting.id!, e)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>

                {/* Description */}
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {meeting.description}
                  </p>
                )}

                {/* Informations du meeting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  {/* Date et heure */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {format(new Date(meeting.startTime), "PPP", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {format(new Date(meeting.startTime), "HH:mm")} -
                        {format(new Date(meeting.endTime), "HH:mm")}
                      </span>
                    </div>
                  </div>

                  {/* Lieu et participants */}
                  <div className="space-y-1">
                    {meeting.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{meeting.location}</span>
                      </div>
                    )}

                    {meeting.meetingLink && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-blue-600 hover:text-blue-800 truncate">
                          Lien de réunion
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {meeting.participantCount || 0} participant
                        {(meeting.participantCount || 0) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organisateur */}
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      Organisé par: {meeting.createdByName || "Utilisateur"}
                    </span>
                    {meeting.createdAt && (
                      <span>
                        Créé le{" "}
                        {format(new Date(meeting.createdAt), "dd/MM/yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
