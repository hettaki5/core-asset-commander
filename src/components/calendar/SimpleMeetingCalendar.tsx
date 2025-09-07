// src/components/calendar/SimpleMeetingCalendar.tsx
import React, { useState, useEffect } from "react";
import { useMeetings, useCalendar } from "@/hooks/useMeetings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Meeting } from "@/services/eventService";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleMeetingCalendarProps {
  onMeetingClick?: (meeting: Meeting) => void;
  onDateClick?: (date: Date) => void;
}

export const SimpleMeetingCalendar: React.FC<SimpleMeetingCalendarProps> = ({
  onMeetingClick,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { stats, loading, error } = useMeetings({ autoLoad: true });
  const { calendarMeetings, getMonthMeetings } = useCalendar();

  // Charger les meetings du mois courant
  useEffect(() => {
    getMonthMeetings(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate, getMonthMeetings]);

  // Navigation du calendrier
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Obtenir les meetings d'une date donnée
  const getMeetingsForDate = (date: Date): Meeting[] => {
    return calendarMeetings.filter((meeting) =>
      isSameDay(new Date(meeting.startTime), date)
    );
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

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: fr });
    const endDate = endOfWeek(monthEnd, { locale: fr });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Erreur lors du chargement du calendrier</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Meetings
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Aujourd'hui
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            À venir
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.upcoming}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Haute priorité
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.highPriority}
          </div>
        </Card>
      </div>

      {/* Calendrier */}
      <Card>
        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grille du calendrier */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-muted-foreground">
                Chargement du calendrier...
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* En-têtes des jours */}
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                (dayName) => (
                  <div
                    key={dayName}
                    className="p-2 text-center font-semibold text-sm text-muted-foreground"
                  >
                    {dayName}
                  </div>
                )
              )}

              {/* Jours du mois */}
              {calendarDays.map((day) => {
                const dayMeetings = getMeetingsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelectedDay =
                  selectedDate && isSameDay(day, selectedDate);
                const isTodayDay = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[100px] p-2 border rounded cursor-pointer transition-colors",
                      isCurrentMonth ? "bg-background" : "bg-muted/30",
                      isSelectedDay && "ring-2 ring-primary",
                      isTodayDay && "bg-primary/10 border-primary",
                      "hover:bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedDate(day);
                      onDateClick?.(day);
                    }}
                  >
                    {/* Numéro du jour */}
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        !isCurrentMonth && "text-muted-foreground",
                        isTodayDay && "text-primary font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Meetings du jour */}
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 2).map((meeting) => (
                        <div
                          key={meeting.id}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer truncate",
                            getPriorityColor(meeting.priority)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMeetingClick?.(meeting);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {format(new Date(meeting.startTime), "HH:mm")}
                            </span>
                          </div>
                          <div className="truncate font-medium">
                            {meeting.title}
                          </div>
                        </div>
                      ))}

                      {/* Indicateur s'il y a plus de meetings */}
                      {dayMeetings.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayMeetings.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Liste des meetings de la date sélectionnée */}
      {selectedDate && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Meetings du {format(selectedDate, "PPP", { locale: fr })}
            </h3>
          </div>
          <div className="p-4">
            {(() => {
              const selectedDateMeetings = getMeetingsForDate(selectedDate);

              if (selectedDateMeetings.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun meeting ce jour</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {selectedDateMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-start justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => onMeetingClick?.(meeting)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <Badge className={getPriorityColor(meeting.priority)}>
                            {meeting.priority === "URGENT" && (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {meeting.priority}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(meeting.startTime), "HH:mm")} -
                              {format(new Date(meeting.endTime), "HH:mm")}
                            </span>
                            {meeting.location && (
                              <span>{meeting.location}</span>
                            )}
                          </div>
                          {meeting.description && (
                            <p className="mt-1 line-clamp-2">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </Card>
      )}
    </div>
  );
};
