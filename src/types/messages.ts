// src/types/messages.ts - Types complets pour le système de messagerie

export type ConversationType = "PRIVATE" | "GROUP";
export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "DISABLED" | "DELETED";
export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "FILE"
  | "VIDEO"
  | "AUDIO"
  | "SYSTEM";
export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";

// ===================================================================
// INTERFACES UTILISATEUR
// ===================================================================

// Interface utilisateur enrichie pour les conversations
export interface UserInfo {
  keycloakUserId: string;
  username: string;
  displayName: string;
  email?: string;
  roles?: string[];
  enabled: boolean;
}

// Participant d'une conversation
export interface ParticipantInfo {
  keycloakUserId: string;
  username: string;
  displayName: string;
  email?: string;
  enabled: boolean;
}

// Dernier message enrichi
export interface EnrichedLastMessageInfo {
  id: string;
  content: string;
  senderInfo: UserInfo;
  timestamp: string;
}

// ===================================================================
// INTERFACES PRINCIPALES
// ===================================================================

// Conversation enrichie avec infos utilisateurs
export interface Conversation {
  id: string;
  name?: string;
  description?: string;
  type: ConversationType;
  status: ConversationStatus;
  participants: ParticipantInfo[];
  createdBy: UserInfo;
  admins: UserInfo[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  activeParticipantCount: number;
  isArchived: boolean;
  avatarUrl?: string;
  onlyAdminsCanAddMembers: boolean;
  onlyAdminsCanRemoveMembers: boolean;
  lastMessage?: EnrichedLastMessageInfo;
  unreadCount: number;
  isParticipant: boolean;
  isAdmin: boolean;
}

// Informations de pièce jointe
export interface AttachmentInfo {
  url: string;
  type: string;
  name: string;
  size: number;
}

// Message enrichi
export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: string;
  updatedAt: string;
  replyToMessageId?: string;
  isEdited: boolean;
  editedAt?: string;
  deliveredAt?: string;
  readAt?: string;
  attachment?: AttachmentInfo;

  // Informations enrichies côté frontend
  senderInfo?: UserInfo;
}

// ===================================================================
// REQUÊTES API
// ===================================================================

export interface CreateConversationRequest {
  type: ConversationType;
  name?: string;
  description?: string;
  participants: string[];
  avatarUrl?: string;
  onlyAdminsCanAddMembers?: boolean;
  onlyAdminsCanRemoveMembers?: boolean;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType: MessageType;
  replyToId?: string;
  attachments?: AttachmentInfo[];
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  attachmentSize?: number;
}

export interface AddParticipantsRequest {
  participantIds: string[];
}

// Réponse API générique
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  errors?: string[];
}

// ===================================================================
// WEBSOCKET - COMPATIBLE AVEC VOTRE useWebSocket.ts
// ===================================================================

// Interface WebSocket compatible avec votre hook existant
export interface WebSocketMessage {
  type: string;
  message?: Message;
  userId?: string;
  username?: string;
  isTyping?: boolean;
  conversationId?: string;
  content?: string;
  isOnline?: boolean;
  timestamp?: string;
  error?: string;
  senderUsername?: string;
  [key: string]: unknown; // Compatible avec votre interface existante
}

// Types spécifiques pour les messages WebSocket
export interface NewMessageWebSocketEvent extends WebSocketMessage {
  type: "NEW_MESSAGE";
  message: Message;
  senderUsername: string;
  timestamp: string;
}

export interface TypingWebSocketEvent extends WebSocketMessage {
  type: "TYPING";
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: string;
}

export interface UserStatusWebSocketEvent extends WebSocketMessage {
  type: "USER_STATUS";
  userId: string;
  username: string;
  isOnline: boolean;
  timestamp: string;
}

export interface UserJoinedWebSocketEvent extends WebSocketMessage {
  type: "USER_JOINED";
  userId: string;
  username: string;
  conversationId: string;
  timestamp: string;
}

export interface UserLeftWebSocketEvent extends WebSocketMessage {
  type: "USER_LEFT";
  userId: string;
  username: string;
  conversationId: string;
  timestamp: string;
}

export interface ErrorWebSocketEvent extends WebSocketMessage {
  type: "ERROR";
  error: string;
  timestamp: string;
}

// Union type pour tous les événements WebSocket
export type TypedWebSocketEvent =
  | NewMessageWebSocketEvent
  | TypingWebSocketEvent
  | UserStatusWebSocketEvent
  | UserJoinedWebSocketEvent
  | UserLeftWebSocketEvent
  | ErrorWebSocketEvent;

// ===================================================================
// ÉTATS ET INDICATEURS
// ===================================================================

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

// État du composant de messagerie
export interface MessagingState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation?: string;
  isLoading: boolean;
  error?: string;
  unreadCount: number;
  typingUsers: Record<string, TypingIndicator[]>;
  isConnected: boolean;
}

// ===================================================================
// HOOKS ET CONTEXTES
// ===================================================================

export interface UseMessagingReturn {
  // État
  state: MessagingState;

  // Actions conversations
  createConversation: (request: CreateConversationRequest) => Promise<void>;
  getConversations: () => Promise<void>;
  getConversation: (id: string) => Promise<Conversation | null>;
  addParticipants: (
    conversationId: string,
    participantIds: string[]
  ) => Promise<void>;
  removeParticipant: (
    conversationId: string,
    participantId: string
  ) => Promise<void>;

  // Actions messages
  sendMessage: (request: SendMessageRequest) => Promise<void>;
  getMessages: (conversationId: string, page?: number) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // WebSocket
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;

  // Utilitaires
  setActiveConversation: (conversationId?: string) => void;
  getUnreadCount: (conversationId?: string) => number;

  // États de connexion
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

// ===================================================================
// CONFIGURATION WEBSOCKET
// ===================================================================

// Configuration WebSocket pour STOMP (compatible avec votre hook)
export interface WebSocketConfig {
  url: string;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error | Event) => void;
  enableReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

// Configuration pour l'abonnement aux topics
export interface SubscriptionConfig {
  destination: string;
  callback: (message: WebSocketMessage) => void;
}

// ===================================================================
// RECHERCHE ET UTILITAIRES
// ===================================================================

// Recherche d'utilisateurs
export interface UserSearchResult {
  keycloakUserId: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  enabled: boolean;
}

// Statistiques de messagerie
export interface MessagingStats {
  totalConversations: number;
  unreadMessages: number;
  totalMessages: number;
  activeConversations: number;
  privateConversations: number;
  groupConversations: number;
}

// Préférences utilisateur
export interface MessagingPreferences {
  notifications: boolean;
  emailNotifications: boolean;
  soundNotifications: boolean;
  showTypingIndicators: boolean;
  showOnlineStatus: boolean;
  autoMarkAsRead: boolean;
  compactView: boolean;
  darkTheme: boolean;
}

// ===================================================================
// CONSTANTES ET CONFIGURATIONS
// ===================================================================

// Topics WebSocket STOMP
export const WEBSOCKET_TOPICS = {
  // Topics globaux
  USER_STATUS: "/topic/user-status",

  // Topics par conversation (dynamiques)
  CONVERSATION: (conversationId: string) =>
    `/topic/conversation/${conversationId}`,
  CONVERSATION_TYPING: (conversationId: string) =>
    `/topic/conversation/${conversationId}/typing`,

  // Topics personnels
  USER_NOTIFICATIONS: (userId: string) => `/user/${userId}/queue/notifications`,
  USER_ERRORS: (userId: string) => `/user/${userId}/queue/errors`,
} as const;

// Destinations pour envoyer des messages
export const WEBSOCKET_DESTINATIONS = {
  SEND_MESSAGE: "/app/message.send",
  TYPING_INDICATOR: "/app/message.typing",
  JOIN_CONVERSATION: "/app/conversation.join",
  LEAVE_CONVERSATION: "/app/conversation.leave",
} as const;

// Configuration par défaut
export const DEFAULT_MESSAGING_CONFIG = {
  PAGE_SIZE: 20,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_ATTACHMENTS: 5,
  RECONNECT_DELAY: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  TYPING_TIMEOUT: 3000,
  HEARTBEAT_INTERVAL: 30000,
} as const;

// Types d'erreurs
export type MessagingErrorType =
  | "AUTHENTICATION_ERROR"
  | "CONNECTION_ERROR"
  | "PERMISSION_ERROR"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface MessagingError {
  type: MessagingErrorType;
  message: string;
  details?: string;
  timestamp: string;
  conversationId?: string;
  messageId?: string;
}

// ===================================================================
// TYPES POUR LES COMPOSANTS UI
// ===================================================================

// Props pour les composants de messagerie
export interface ConversationListProps {
  conversations: Conversation[];
  activeConversation?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  isLoading?: boolean;
  searchTerm?: string;
  onSearch?: (term: string) => void;
}

export interface MessageListProps {
  messages: Message[];
  conversationId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onReplyToMessage?: (message: Message) => void;
}

export interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, type?: MessageType) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface ConversationHeaderProps {
  conversation: Conversation;
  isOnline?: boolean;
  typingUsers?: TypingIndicator[];
  onManageParticipants?: () => void;
  onArchiveConversation?: () => void;
  onLeaveConversation?: () => void;
}

// ===================================================================
// TYPES POUR LES NOTIFICATIONS
// ===================================================================

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// ===================================================================
// TYPES POUR LES FICHIERS/ATTACHMENTS
// ===================================================================

export interface FileUploadConfig {
  maxSize: number; // en bytes
  allowedTypes: string[];
  uploadUrl: string;
  chunkedUpload?: boolean;
  chunkSize?: number;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface AttachmentPreview {
  id: string;
  file: File;
  preview?: string; // URL pour l'aperçu
  type: "image" | "video" | "audio" | "document" | "other";
  uploadProgress?: FileUploadProgress;
}
