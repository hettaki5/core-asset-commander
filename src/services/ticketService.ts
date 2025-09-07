// src/services/ticketService.ts
import {
  JiraTicketDto,
  TicketStats,
  TicketRefreshResponse,
  TicketHealthResponse,
} from "@/types/tickets";
import { buildUrl, getApiHeaders } from "@/config/api";

class TicketService {
  private readonly baseUrl = buildUrl.tickets(""); // Via Gateway avec headers

  /**
   * Récupère tous les tickets depuis Jira
   */
  async getAllTickets(): Promise<JiraTicketDto[]> {
    const url = this.baseUrl;
    console.log("🔗 Fetch API call to:", url);
    const headers = getApiHeaders();
    console.log("📋 Headers:", headers);

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    console.log("📡 Response status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupère un ticket par son ID ou sa clé
   */
  async getTicketById(idOrKey: string): Promise<JiraTicketDto> {
    const url = buildUrl.tickets(`/${idOrKey}`);
    console.log("🔗 Fetch API call to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Ticket ${idOrKey} non trouvé`);
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupère les statistiques des tickets
   */
  async getTicketStats(): Promise<TicketStats> {
    const url = buildUrl.tickets("/stats");
    console.log("🔗 Fetch API call to:", url);
    const headers = getApiHeaders();
    console.log("📋 Headers:", headers);

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    console.log("📡 Response status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Force le rafraîchissement des tickets depuis Jira
   */
  async refreshTickets(): Promise<TicketRefreshResponse> {
    const response = await fetch(buildUrl.tickets("/refresh"), {
      method: "POST",
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Vérifie l'état de santé du service
   */
  async getHealth(): Promise<TicketHealthResponse> {
    const url = buildUrl.tickets("/health");
    console.log("🔗 Health check URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(),
    });

    console.log(
      "📡 Health check response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(`Service indisponible: ${response.status}`);
    }

    return response.json();
  }
}

export const ticketService = new TicketService();
