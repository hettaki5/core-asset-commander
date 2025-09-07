// src/types/meetings.ts - Types spécifiques pour Event-Service (évite conflits)

// Types de priorité et statut spécifiques aux meetings
export type MeetingPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MeetingStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";
export type MeetingCategory = "WORK" | "PERSONAL" | "PROJECT";
export type ParticipantStatus = "INVITED" | "ACCEPTED" | "DECLINED" | "PENDING";
export type ReminderType = "EMAIL" | "NOTIFICATION" | "SMS";
export type ReminderStatus = "PENDING" | "SENT" | "FAILED";

// Interface Meeting étendue (compatible avec votre Event existant)
export interface EventMeeting {
  id?: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;
  location?: string;
  meetingLink?: string;
  priority: MeetingPriority;
  category: MeetingCategory;
  status: MeetingStatus;

  // Informations de création
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt?: string;
  updatedAt?: string;

  // Relations
  participants?: MeetingParticipant[];
  reminders?: MeetingReminder[];

  // Propriétés calculées
  isUpcoming?: boolean;
  isOngoing?: boolean;
  isPast?: boolean;
  canEdit?: boolean;
  participantCount?: number;
  reminderCount?: number;
}

export interface MeetingParticipant {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: ParticipantStatus;
  addedAt: string;
  addedBy: string;
}

export interface MeetingReminder {
  id?: string;
  userId: string;
  minutesBefore: number;
  triggerTime?: string;
  type: ReminderType;
  status?: ReminderStatus;
  message?: string;
  createdAt?: string;
  sentAt?: string;
}

// Requêtes API
export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  priority?: MeetingPriority;
  category?: MeetingCategory;
  participantUserIds?: string[];
  reminders?: CreateReminderRequest[];
}

export interface UpdateMeetingRequest {
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

export interface CreateReminderRequest {
  userId: string;
  minutesBefore: number;
  type: ReminderType;
  message?: string;
}

// Réponses et statistiques
export interface MeetingStats {
  total: number;
  today: number;
  upcoming: number;
  highPriority: number;
  cancelled: number;
  completed: number;
  byCategory: Record<MeetingCategory, number>;
  byPriority: Record<MeetingPriority, number>;
}

// Utilisateur pour recherche et participants
export interface MeetingUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  enabled: boolean;
}

// Filtres pour les requêtes
export interface MeetingFilters {
  startDate?: string;
  endDate?: string;
  priority?: MeetingPriority[];
  category?: MeetingCategory[];
  status?: MeetingStatus[];
  participantId?: string;
  createdBy?: string;
}

// Hooks et états
export interface UseMeetingsOptions {
  autoLoad?: boolean;
  loadUpcoming?: boolean;
  loadToday?: boolean;
  filters?: MeetingFilters;
}

export interface MeetingsState {
  meetings: EventMeeting[];
  loading: boolean;
  error: string | null;
  stats: MeetingStats;
}

export interface CalendarState {
  calendarMeetings: EventMeeting[];
  loading: boolean;
  error: string | null;
  selectedDate?: Date;
  currentMonth: number;
  currentYear: number;
}

// Composant props
export interface MeetingCardProps {
  meeting: EventMeeting;
  onClick?: (meeting: EventMeeting) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface CalendarProps {
  onMeetingClick?: (meeting: EventMeeting) => void;
  onDateClick?: (date: Date) => void;
  defaultDate?: Date;
  showWeekends?: boolean;
  filters?: MeetingFilters;
}

export interface CreateMeetingDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultDate?: Date;
  defaultValues?: Partial<CreateMeetingRequest>;
  onSuccess?: (meeting: EventMeeting) => void;
  onError?: (error: string) => void;
}

// Utilitaires et helpers
export interface MeetingTimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  meeting?: EventMeeting;
}

export interface WeekView {
  weekStart: Date;
  weekEnd: Date;
  days: Date[];
  meetings: EventMeeting[];
}

export interface MonthView {
  monthStart: Date;
  monthEnd: Date;
  weeks: Date[][];
  meetings: EventMeeting[];
}

// Notifications et alertes
export interface MeetingNotification {
  id: string;
  meetingId: string;
  type: "reminder" | "invitation" | "update" | "cancellation";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Export des types réutilisés depuis eventService.ts pour éviter duplication
export type {
  Meeting,
  Participant,
  Reminder,
  UserInfo,
  MeetingCreateRequest,
  MeetingUpdateRequest,
} from "@/services/eventService";
