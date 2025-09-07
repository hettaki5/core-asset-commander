// Types pour l'application microservices - VERSION SANS ERREURS ANY

// ✅ INTERFACE USER ÉTENDUE POUR COMPATIBILITÉ
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[]; // ✅ CHANGÉ: Array au lieu de single role
  role?: UserRole; // ✅ GARDE pour rétrocompatibilité
  enabled: boolean; // ✅ AJOUTÉ: Remplace isActive
  isActive?: boolean; // ✅ GARDE pour rétrocompatibilité
  status: string; // ✅ AJOUTÉ
  emailVerified: boolean; // ✅ AJOUTÉ
  mustChangePassword: boolean; // ✅ ÉTENDU: Plus optionnel
  createdAt: string;
  updatedAt: string; // ✅ AJOUTÉ
  createdBy: string; // ✅ AJOUTÉ
  createdByName: string; // ✅ AJOUTÉ
  department?: string; // ✅ AJOUTÉ
  position?: string; // ✅ AJOUTÉ
  phone?: string; // ✅ AJOUTÉ
  lastLoginAt?: string; // ✅ RENOMMÉ de lastLogin
  lastLogin?: string; // ✅ GARDE pour rétrocompatibilité
  loginCount: number; // ✅ AJOUTÉ
}

export type UserRole = "admin" | "ingenieurpr" | "validateur" | "observateur";

// ✅ NOUVELLES INTERFACES POUR GESTION UTILISATEURS
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  department?: string;
  position?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: UserRole[];
  department?: string;
  position?: string;
  phone?: string;
  enabled?: boolean;
  status?: string;
  mustChangePassword?: boolean;
}

export interface UserListResponse {
  users: User[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersRequiringPasswordChange: number;
  usersByRole: Record<string, number>;
  usersByDepartment: Record<string, number>;
  usersByStatus: Record<string, number>;
  newUsersThisMonth: number;
}

export interface ListUsersFilters {
  page?: number;
  size?: number;
  search?: string;
  roles?: string[];
  statuses?: string[];
  enabled?: boolean;
  department?: string;
  sortBy?: string;
  sortOrder?: string;
}

// ✅ INTERFACE GÉNÉRIQUE API RESPONSE
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// ✅ TYPES POUR ASSET FIELD VALUE (au lieu de any)
export type AssetFieldValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | null;

export interface JiraTicketDto {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: string;
  priority: string;
  issueType: string;
  creator?: string;
  assignee?: string;
  created: string; // LocalDateTime en ISO string
  updated: string; // LocalDateTime en ISO string
  labels: string[];
  projectKey: string;
}

export interface TicketStats {
  totalTickets: number;
  statusBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  lastUpdate: number;
}

export interface TicketRefreshResponse {
  status: "success" | "error";
  message: string;
  ticketCount?: string;
  timestamp: string;
}

export interface TicketHealthResponse {
  status: "UP" | "DOWN";
  service: string;
  timestamp: string;
  version: string;
}

export interface TicketFilters {
  search: string;
  status: string;
  issueType: string;
  priority: string;
  assignee: string;
}

// ✅ MISE À JOUR: Interface Ticket existante (garde pour rétrocompatibilité)
export interface Ticket {
  id: string;
  title: string; // Équivalent à summary dans Jira
  description: string;
  type: "configuration" | "support" | "bug" | "feature";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolution?: string;

  // ✅ NOUVEAUX CHAMPS pour compatibilité Jira
  key?: string; // Clé Jira (ex: PLM-123)
  issueType?: string; // Type Jira
  projectKey?: string; // Projet Jira
  labels?: string[]; // Labels Jira
}
// ✅ GARDE TES INTERFACES EXISTANTES (Assets, Tickets, etc.)
export interface Asset {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  model: string;
  serialNumber?: string;
  supplier?: string;
  assignedTo?: string;
  location?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
  sections: AssetSection[];
}

export type AssetStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "approved"
  | "rejected";

export interface AssetSection {
  id: string;
  name: string;
  fields: AssetField[];
}

export interface AssetField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  value: AssetFieldValue; // ✅ CORRIGÉ: Plus de any
  required: boolean;
  options?: string[];
}

export interface AssetType {
  id: string;
  name: string;
  description: string;
  sections: AssetSectionTemplate[];
  isActive: boolean;
}

export interface AssetSectionTemplate {
  id: string;
  name: string;
  order: number;
  fields: AssetFieldTemplate[];
}

export interface AssetFieldTemplate {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required: boolean;
  options?: string[];
  validation?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: "configuration" | "support" | "bug" | "feature";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolution?: string;
}

export interface WorkflowHistory {
  id: string;
  entityId: string;
  entityType: "asset" | "ticket";
  fromStatus: string;
  toStatus: string;
  performedBy: string;
  performedAt: string;
  comment?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: "maintenance" | "meeting" | "deadline" | "reminder";
  relatedAssetId?: string;
  relatedTicketId?: string;
  assignedTo: string[];
  createdBy: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  fromUserId: string;
  toUserId: string;
  relatedAssetId?: string;
  relatedTicketId?: string;
  isRead: boolean;
  sentAt: string;
}

export interface LogEntry {
  id: string;
  action: string;
  entityType: "user" | "asset" | "ticket" | "config";
  entityId: string;
  performedBy: string;
  performedAt: string;
  details: Record<string, unknown>; // ✅ CORRIGÉ: Plus de any
  ipAddress?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  isLoading: boolean;
}

// ✅ GARDE POUR RÉTROCOMPATIBILITÉ MAIS DÉPRÉCIÉE
/** @deprecated Use ApiResponse<T> instead */
export interface ApiResponseLegacy<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ TYPES UTILITAIRES POUR ADMIN
export interface AdminPermissions {
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canManageRoles: boolean;
  canResetPasswords: boolean;
  canViewLogs: boolean;
}

export interface TableAction<T = unknown> {
  id: string;
  label: string;
  icon: React.ComponentType;
  color?: "default" | "destructive" | "secondary";
  onClick: (item: T) => void;
  disabled?: boolean;
}

export interface ModalState<T = unknown> {
  isOpen: boolean;
  data?: T;
  loading?: boolean;
}

export interface FilterState {
  search: string;
  role: string;
  status: string;
  department?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}

// ✅ TYPE POUR STATISTIQUES ÉTENDUES (au lieu de any dans adminUserService)
export interface ExtendedUserStats extends UserStats {
  basic: UserStats;
  newUsersLastWeek: number;
  newUsersLastMonth: number;
  deletedUsers: number;
  pendingUsers: number;
}
