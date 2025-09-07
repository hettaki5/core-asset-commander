// src/services/eventService.ts - Service corrigé pour Event-Service
import { buildUrl, getApiHeaders } from "@/config/api";

// Types pour Event-Service (basés sur vos DTOs Java)
export interface Meeting {
  id?: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;
  location?: string;
  meetingLink?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: "WORK" | "PERSONAL" | "PROJECT";
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  participants?: Participant[];
  reminders?: Reminder[];
  isUpcoming?: boolean;
  isOngoing?: boolean;
  isPast?: boolean;
  canEdit?: boolean;
  participantCount?: number;
  reminderCount?: number;
}

export interface Participant {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "INVITED" | "ACCEPTED" | "DECLINED" | "PENDING";
  addedAt: string;
  addedBy: string;
}

export interface Reminder {
  id?: string;
  userId: string;
  minutesBefore: number;
  triggerTime?: string;
  type: "EMAIL" | "NOTIFICATION" | "SMS";
  status?: "PENDING" | "SENT" | "FAILED";
  message?: string;
  createdAt?: string;
  sentAt?: string;
}

export interface MeetingCreateRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: "WORK" | "PERSONAL" | "PROJECT";
  participantUserIds?: string[];
  reminders?: {
    userId: string;
    minutesBefore: number;
    type: "EMAIL" | "NOTIFICATION" | "SMS";
    message?: string;
  }[];
}

export interface MeetingUpdateRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: "WORK" | "PERSONAL" | "PROJECT";
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  enabled: boolean;
}

class EventService {
  // ===== MEETINGS =====

  async createMeeting(meetingData: MeetingCreateRequest): Promise<Meeting> {
    const response = await fetch(buildUrl.events("/meetings"), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      throw new Error(`Erreur création meeting: ${response.statusText}`);
    }

    return response.json();
  }

  async getMeeting(id: string): Promise<Meeting> {
    const response = await fetch(buildUrl.events(`/meetings/${id}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur récupération meeting: ${response.statusText}`);
    }

    return response.json();
  }

  async getMyMeetings(): Promise<Meeting[]> {
    const response = await fetch(buildUrl.events("/meetings/my"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur récupération meetings: ${response.statusText}`);
    }

    return response.json();
  }

  async getUpcomingMeetings(): Promise<Meeting[]> {
    const response = await fetch(buildUrl.events("/meetings/upcoming"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur récupération meetings à venir: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getTodayMeetings(): Promise<Meeting[]> {
    const response = await fetch(buildUrl.events("/meetings/today"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur récupération meetings du jour: ${response.statusText}`
      );
    }

    return response.json();
  }

  async updateMeeting(
    id: string,
    updateData: MeetingUpdateRequest
  ): Promise<Meeting> {
    const response = await fetch(buildUrl.events(`/meetings/${id}`), {
      method: "PUT",
      headers: getApiHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Erreur modification meeting: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteMeeting(id: string): Promise<{ message: string }> {
    const response = await fetch(buildUrl.events(`/meetings/${id}`), {
      method: "DELETE",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur suppression meeting: ${response.statusText}`);
    }

    return response.json();
  }

  async cancelMeeting(id: string): Promise<Meeting> {
    const response = await fetch(buildUrl.events(`/meetings/${id}/cancel`), {
      method: "PATCH",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur annulation meeting: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== CALENDAR =====

  async getMeetingsInRange(
    startDate: string,
    endDate: string
  ): Promise<Meeting[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await fetch(buildUrl.events(`/calendar/range?${params}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur récupération meetings période: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getMonthMeetings(year: number, month: number): Promise<Meeting[]> {
    const response = await fetch(
      buildUrl.events(`/calendar/month/${year}/${month}`),
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur récupération meetings du mois: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getWeekMeetings(weekStart: string): Promise<Meeting[]> {
    const params = new URLSearchParams({ weekStart });

    const response = await fetch(buildUrl.events(`/calendar/week?${params}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur récupération meetings de la semaine: ${response.statusText}`
      );
    }

    return response.json();
  }

  // ===== PARTICIPANTS =====

  async addParticipant(
    meetingId: string,
    userId: string
  ): Promise<Participant> {
    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/participants`),
      {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ajout participant: ${response.statusText}`);
    }

    return response.json();
  }

  async addMultipleParticipants(
    meetingId: string,
    userIds: string[]
  ): Promise<Participant[]> {
    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/participants/batch`),
      {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ userIds }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur ajout participants multiples: ${response.statusText}`
      );
    }

    return response.json();
  }

  async removeParticipant(
    meetingId: string,
    participantId: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/participants/${participantId}`),
      {
        method: "DELETE",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur suppression participant: ${response.statusText}`);
    }

    return response.json();
  }

  async getMeetingParticipants(meetingId: string): Promise<Participant[]> {
    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/participants`),
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur récupération participants: ${response.statusText}`
      );
    }

    return response.json();
  }

  async updateParticipantStatus(
    meetingId: string,
    participantId: string,
    status: string
  ): Promise<Participant> {
    const response = await fetch(
      buildUrl.events(
        `/meetings/${meetingId}/participants/${participantId}/status`
      ),
      {
        method: "PATCH",
        headers: getApiHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur changement statut participant: ${response.statusText}`
      );
    }

    return response.json();
  }

  async searchPotentialParticipants(
    meetingId: string,
    query: string,
    maxResults = 10
  ): Promise<UserInfo[]> {
    const params = new URLSearchParams({
      query,
      maxResults: maxResults.toString(),
    });

    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/participants/search?${params}`),
      {
        method: "GET",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur recherche participants potentiels: ${response.statusText}`
      );
    }

    return response.json();
  }

  // ===== REMINDERS =====

  async addReminder(
    meetingId: string,
    reminderData: {
      userId?: string;
      minutesBefore: number;
      type: "EMAIL" | "NOTIFICATION" | "SMS";
      message?: string;
    }
  ): Promise<Reminder> {
    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/reminders`),
      {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(reminderData),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ajout reminder: ${response.statusText}`);
    }

    return response.json();
  }

  async removeReminder(
    meetingId: string,
    reminderId: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      buildUrl.events(`/meetings/${meetingId}/reminders/${reminderId}`),
      {
        method: "DELETE",
        headers: getApiHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur suppression reminder: ${response.statusText}`);
    }

    return response.json();
  }

  async getMyReminders(): Promise<Reminder[]> {
    const response = await fetch(buildUrl.events("/reminders/my"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur récupération reminders: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== USERS =====

  async searchUsers(query: string, maxResults = 10): Promise<UserInfo[]> {
    const params = new URLSearchParams({
      query,
      maxResults: maxResults.toString(),
    });

    const response = await fetch(buildUrl.events(`/users/search?${params}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur recherche utilisateurs: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const response = await fetch(buildUrl.events(`/users/${userId}`), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur récupération utilisateur: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getUsersInfo(userIds: string[]): Promise<Record<string, UserInfo>> {
    const response = await fetch(buildUrl.events("/users/batch"), {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(userIds),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur récupération utilisateurs batch: ${response.statusText}`
      );
    }

    return response.json();
  }

  // ===== HEALTH CHECK =====

  async checkHealth(): Promise<{ status: string; service: string }> {
    const response = await fetch(buildUrl.events("/health"), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Service indisponible: ${response.statusText}`);
    }

    return response.json();
  }
}

export const eventService = new EventService();
