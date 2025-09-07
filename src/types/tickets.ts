// src/types/tickets.ts - Types pour Tickets Jira
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

// Filtres pour la recherche
export interface TicketFilters {
  search: string;
  status: string;
  issueType: string;
  priority: string;
  assignee: string;
}
