// src/pages/Calendar.tsx
import React, { useState } from "react";
import { SimpleMeetingCalendar } from "@/components/calendar/SimpleMeetingCalendar";
import { MeetingList } from "@/components/calendar/MeetingList";
import { SimpleCreateMeetingDialog } from "@/components/calendar/SimpleCreateMeetingDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMeetings } from "@/hooks/useMeetings";
import { Meeting } from "@/services/eventService";
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  Plus,
  Users,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Calendar: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Charger les statistiques générales
  const { stats, loading, error } = useMeetings({ autoLoad: true });

  // Gérer le clic sur un meeting
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    // Vous pouvez ouvrir un dialogue de détails ici
    console.log("Meeting sélectionné:", meeting);
  };

  // Gérer le clic sur une date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Callback après création d'un meeting
  const handleMeetingCreated = () => {
    // Rafraîchir les données si nécessaire
    console.log("Meeting créé avec succès");
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendrier des Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos meetings et événements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SimpleCreateMeetingDialog
            defaultDate={selectedDate || new Date()}
            onMeetingCreated={handleMeetingCreated}
          />
        </div>
      </div>

      {/* Statistiques rapides */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Meetings
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.today}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  À venir
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.upcoming}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Haute priorité
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.highPriority}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Annulés
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Tous les meetings
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />À venir
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Aujourd'hui
          </TabsTrigger>
        </TabsList>

        {/* Vue Calendrier */}
        <TabsContent value="calendar" className="mt-6">
          <SimpleMeetingCalendar
            onMeetingClick={handleMeetingClick}
            onDateClick={handleDateClick}
          />
        </TabsContent>

        {/* Tous les meetings */}
        <TabsContent value="all" className="mt-6">
          <MeetingList
            type="all"
            onMeetingClick={handleMeetingClick}
            showActions={true}
          />
        </TabsContent>

        {/* Meetings à venir */}
        <TabsContent value="upcoming" className="mt-6">
          <MeetingList
            type="upcoming"
            onMeetingClick={handleMeetingClick}
            showActions={false}
          />
        </TabsContent>

        {/* Meetings d'aujourd'hui */}
        <TabsContent value="today" className="mt-6">
          <MeetingList
            type="today"
            onMeetingClick={handleMeetingClick}
            showActions={false}
          />
        </TabsContent>
      </Tabs>

      {/* Informations sur la date sélectionnée */}
      {selectedDate && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Date sélectionnée: {format(selectedDate, "PPP", { locale: fr })}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Cliquez sur "Nouveau Meeting" pour créer un meeting à cette date
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(null)}
            >
              Désélectionner
            </Button>
          </div>
        </Card>
      )}

      {/* Informations sur le meeting sélectionné */}
      {selectedMeeting && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">
                Meeting sélectionné: {selectedMeeting.title}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {format(new Date(selectedMeeting.startTime), "PPP à HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMeeting(null)}
            >
              Fermer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
