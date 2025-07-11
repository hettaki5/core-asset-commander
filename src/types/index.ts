
// Types pour l'application microservices

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'ingenieurpr' | 'validateur' | 'observateur';

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

export type AssetStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';

export interface AssetSection {
  id: string;
  name: string;
  fields: AssetField[];
}

export interface AssetField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  value: any;
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
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  required: boolean;
  options?: string[];
  validation?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'configuration' | 'support' | 'bug' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
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
  entityType: 'asset' | 'ticket';
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
  type: 'maintenance' | 'meeting' | 'deadline' | 'reminder';
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
  entityType: 'user' | 'asset' | 'ticket' | 'config';
  entityId: string;
  performedBy: string;
  performedAt: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export interface ApiResponse<T> {
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
