// src/hooks/useMeetings.ts - Version corrigée complète
import { useState, useEffect, useCallback } from "react";
import {
  eventService,
  Meeting,
  MeetingCreateRequest,
  Participant,
  Reminder,
  UserInfo,
} from "@/services/eventService";

// Types spécifiques pour éviter any
type MeetingPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type MeetingCategory = "WORK" | "PERSONAL" | "PROJECT";
type MeetingStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";

interface MeetingUpdateRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  priority?: MeetingPriority;
  category?: MeetingCategory;
  status?: MeetingStatus;
}

interface CreateReminderRequest {
  userId?: string;
  minutesBefore: number;
  type: "EMAIL" | "NOTIFICATION" | "SMS";
  message?: string;
}

// Hook principal pour les meetings
export const useMeetings = (options?: {
  autoLoad?: boolean;
  loadUpcoming?: boolean;
  loadToday?: boolean;
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Statistiques calculées
  const stats = {
    total: meetings.length,
    today: meetings.filter((meeting) => {
      const today = new Date();
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.toDateString() === today.toDateString();
    }).length,
    upcoming: meetings.filter((meeting) => meeting.isUpcoming).length,
    highPriority: meetings.filter(
      (meeting) => meeting.priority === "HIGH" || meeting.priority === "URGENT"
    ).length,
    cancelled: meetings.filter((meeting) => meeting.status === "CANCELLED")
      .length,
  };

  // Charger tous mes meetings
  const loadMyMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getMyMeetings();
      setMeetings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur chargement meetings";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger meetings à venir
  const loadUpcoming = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getUpcomingMeetings();
      setMeetings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur chargement meetings";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger meetings du jour
  const loadToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getTodayMeetings();
      setMeetings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur chargement meetings";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un meeting
  const createMeeting = useCallback(
    async (meetingData: MeetingCreateRequest): Promise<Meeting> => {
      setLoading(true);
      setError(null);
      try {
        const newMeeting = await eventService.createMeeting(meetingData);
        setMeetings((previousMeetings) => [...previousMeetings, newMeeting]);
        return newMeeting;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur création meeting";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Mettre à jour un meeting
  const updateMeeting = useCallback(
    async (id: string, updateData: MeetingUpdateRequest): Promise<Meeting> => {
      setLoading(true);
      setError(null);
      try {
        const updatedMeeting = await eventService.updateMeeting(id, updateData);
        setMeetings((previousMeetings) =>
          previousMeetings.map((meeting) =>
            meeting.id === id ? updatedMeeting : meeting
          )
        );
        return updatedMeeting;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur mise à jour meeting";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Supprimer un meeting
  const deleteMeeting = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await eventService.deleteMeeting(id);
      setMeetings((previousMeetings) =>
        previousMeetings.filter((meeting) => meeting.id !== id)
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur suppression meeting";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement automatique
  useEffect(() => {
    if (options?.autoLoad) {
      if (options.loadUpcoming) {
        loadUpcoming();
      } else if (options.loadToday) {
        loadToday();
      } else {
        loadMyMeetings();
      }
    }
  }, [
    options?.autoLoad,
    options?.loadUpcoming,
    options?.loadToday,
    loadMyMeetings,
    loadUpcoming,
    loadToday,
  ]);

  return {
    meetings,
    loading,
    error,
    stats,
    loadMyMeetings,
    loadUpcoming,
    loadToday,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    refresh: loadMyMeetings,
  };
};

// Hook pour le calendrier
export const useCalendar = () => {
  const [calendarMeetings, setCalendarMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMeetingsInRange = useCallback(
    async (startDate: string, endDate: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventService.getMeetingsInRange(startDate, endDate);
        setCalendarMeetings(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur chargement période";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getMonthMeetings = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getMonthMeetings(year, month);
      setCalendarMeetings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur chargement mois";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    calendarMeetings,
    loading,
    error,
    getMeetingsInRange,
    getMonthMeetings,
  };
};

// Hook pour les participants
export const useParticipants = (meetingId?: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    if (!meetingId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getMeetingParticipants(meetingId);
      setParticipants(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur chargement participants";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const addParticipant = useCallback(
    async (userId: string): Promise<Participant> => {
      if (!meetingId) throw new Error("Meeting ID requis");

      setLoading(true);
      setError(null);
      try {
        const newParticipant = await eventService.addParticipant(
          meetingId,
          userId
        );
        setParticipants((previousParticipants) => [
          ...previousParticipants,
          newParticipant,
        ]);
        return newParticipant;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur ajout participant";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [meetingId]
  );

  const removeParticipant = useCallback(
    async (participantId: string): Promise<void> => {
      if (!meetingId) throw new Error("Meeting ID requis");

      setLoading(true);
      setError(null);
      try {
        await eventService.removeParticipant(meetingId, participantId);
        setParticipants((previousParticipants) =>
          previousParticipants.filter(
            (participant) => participant.userId !== participantId
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur suppression participant";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [meetingId]
  );

  const updateParticipantStatus = useCallback(
    async (participantId: string, status: string): Promise<Participant> => {
      if (!meetingId) throw new Error("Meeting ID requis");

      setLoading(true);
      setError(null);
      try {
        const updatedParticipant = await eventService.updateParticipantStatus(
          meetingId,
          participantId,
          status
        );
        setParticipants((previousParticipants) =>
          previousParticipants.map((participant) =>
            participant.userId === participantId
              ? updatedParticipant
              : participant
          )
        );
        return updatedParticipant;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur changement statut";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [meetingId]
  );

  // Chargement automatique
  useEffect(() => {
    if (meetingId) {
      loadParticipants();
    }
  }, [meetingId, loadParticipants]);

  return {
    participants,
    loading,
    error,
    addParticipant,
    removeParticipant,
    updateParticipantStatus,
    refresh: loadParticipants,
  };
};

// Hook pour les reminders
export const useReminders = (meetingId?: string) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getMyReminders();
      // Filtrer par meetingId si fourni
      const filteredData = meetingId
        ? data.filter((reminder) => reminder.id === meetingId)
        : data;
      setReminders(filteredData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur chargement reminders";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const addReminder = useCallback(
    async (reminderData: CreateReminderRequest): Promise<Reminder> => {
      if (!meetingId) throw new Error("Meeting ID requis");

      setLoading(true);
      setError(null);
      try {
        const newReminder = await eventService.addReminder(
          meetingId,
          reminderData
        );
        setReminders((previousReminders) => [
          ...previousReminders,
          newReminder,
        ]);
        return newReminder;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur ajout reminder";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [meetingId]
  );

  const removeReminder = useCallback(
    async (reminderId: string): Promise<void> => {
      if (!meetingId) throw new Error("Meeting ID requis");

      setLoading(true);
      setError(null);
      try {
        await eventService.removeReminder(meetingId, reminderId);
        setReminders((previousReminders) =>
          previousReminders.filter((reminder) => reminder.id !== reminderId)
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur suppression reminder";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [meetingId]
  );

  // Chargement automatique
  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    loading,
    error,
    addReminder,
    removeReminder,
    refresh: loadReminders,
  };
};

// Hook pour la recherche d'utilisateurs - VERSION CORRIGÉE
export const useUserSearch = () => {
  const [users, setUsers] = useState<UserInfo[]>([]); // ✅ INITIALISÉ avec tableau vide
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]); // ✅ Toujours un tableau
      return;
    }

    if (query.trim().length < 2) {
      setUsers([]); // ✅ Toujours un tableau
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await eventService.searchUsers(query);
      // ✅ PROTECTION: S'assurer que data est toujours un tableau
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur recherche utilisateurs";
      setError(errorMessage);
      setUsers([]); // ✅ En cas d'erreur, tableau vide
      console.error("Erreur recherche utilisateurs:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fonction pour réinitialiser
  const clearUsers = useCallback(() => {
    setUsers([]);
    setError(null);
  }, []);

  return {
    users, // ✅ Sera toujours un tableau
    loading,
    error,
    searchUsers,
    clearUsers,
  };
};
