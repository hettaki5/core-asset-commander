// src/services/messageService.ts - Service API pour les messages via Gateway
import { buildUrl, getApiHeaders } from "@/config/api";
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  UserSearchResult,
  MessagingStats,
  ApiResponse,
} from "@/types/messages";

class MessageService {
  // Use the same pattern as ticketService - via buildUrl helper
  private readonly conversationsBaseUrl = buildUrl.conversations("");
  private readonly messagesBaseUrl = buildUrl.messages("");

  // ================================
  // CONVERSATIONS
  // ================================

  async getConversations(): Promise<Conversation[]> {
    try {
      console.log("📋 Récupération conversations...");
      const url = this.conversationsBaseUrl;
      console.log("🔗 Fetch API call to:", url);
      const headers = getApiHeaders();
      console.log("📋 Headers:", headers);

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<Conversation[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur récupération conversations");
      }

      console.log(`✅ ${data.data.length} conversations récupérées`);
      return data.data;
    } catch (error) {
      console.error("💥 Erreur récupération conversations:", error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      console.log(`📄 Récupération conversation ${conversationId}...`);
      const url = buildUrl.conversations(`/${conversationId}`);
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Conversation non trouvée");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<Conversation> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur récupération conversation");
      }

      return data.data;
    } catch (error) {
      console.error(
        `💥 Erreur récupération conversation ${conversationId}:`,
        error
      );
      throw error;
    }
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    try {
      console.log("🆕 Création conversation...", request);
      const url = this.conversationsBaseUrl;
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(request),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: ApiResponse<Conversation> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur création conversation");
      }

      console.log("✅ Conversation créée:", data.data.id);
      return data.data;
    } catch (error) {
      console.error("💥 Erreur création conversation:", error);
      throw error;
    }
  }

  async addParticipants(
    conversationId: string,
    participantIds: string[]
  ): Promise<Conversation> {
    try {
      console.log(`👥 Ajout participants à ${conversationId}:`, participantIds);
      const url = buildUrl.conversations(`/${conversationId}/participants`);
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ participantIds }),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<Conversation> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur ajout participants");
      }

      return data.data;
    } catch (error) {
      console.error("💥 Erreur ajout participants:", error);
      throw error;
    }
  }

  async removeParticipant(
    conversationId: string,
    participantId: string
  ): Promise<Conversation> {
    try {
      console.log(
        `👤 Retrait participant ${participantId} de ${conversationId}`
      );
      const url = buildUrl.conversations(
        `/${conversationId}/participants/${participantId}`
      );
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<Conversation> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur retrait participant");
      }

      return data.data;
    } catch (error) {
      console.error("💥 Erreur retrait participant:", error);
      throw error;
    }
  }

  // ================================
  // MESSAGES
  // ================================

  async getMessages(
    conversationId: string,
    page?: number,
    size?: number
  ): Promise<Message[]> {
    try {
      console.log(`📨 Récupération messages conversation ${conversationId}`);

      const params = new URLSearchParams();
      if (page !== undefined) params.set("page", page.toString());
      if (size !== undefined) params.set("size", size.toString());
      if (page !== undefined || size !== undefined)
        params.set("paginated", "true");

      const url = buildUrl.messages(
        `/conversation/${conversationId}?${params}`
      );
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<Message[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur récupération messages");
      }

      console.log(`✅ ${data.data.length} messages récupérés`);
      return data.data;
    } catch (error) {
      console.error("💥 Erreur récupération messages:", error);
      throw error;
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    try {
      console.log("📤 Envoi message...", request);
      const url = this.messagesBaseUrl;
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(request),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<Message> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur envoi message");
      }

      console.log("✅ Message envoyé:", data.data.id);
      return data.data;
    } catch (error) {
      console.error("💥 Erreur envoi message:", error);
      throw error;
    }
  }

  async getUnreadMessages(conversationId: string): Promise<Message[]> {
    try {
      console.log(`📢 Récupération messages non lus pour ${conversationId}`);
      const url = buildUrl.messages(`/conversation/${conversationId}/unread`);
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<Message[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur récupération messages non lus");
      }

      return data.data;
    } catch (error) {
      console.error("💥 Erreur récupération messages non lus:", error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      console.log(`👁️ Marquage messages comme lus pour ${conversationId}`);
      const url = buildUrl.messages(
        `/conversation/${conversationId}/mark-read`
      );
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<string> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur marquage messages lus");
      }

      console.log("✅ Messages marqués comme lus");
    } catch (error) {
      console.error("💥 Erreur marquage messages lus:", error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      console.log(`🗑️ Suppression message ${messageId}`);
      const url = buildUrl.messages(`/${messageId}`);
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: ApiResponse<string> = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur suppression message");
      }

      console.log("✅ Message supprimé");
    } catch (error) {
      console.error("💥 Erreur suppression message:", error);
      throw error;
    }
  }

  // ================================
  // RECHERCHE UTILISATEURS
  // ================================

  async searchUsers(searchTerm: string): Promise<UserSearchResult[]> {
    try {
      console.log(`🔍 Recherche utilisateurs: "${searchTerm}"`);

      // Use auth service route for user search - same pattern as tickets
      const url = `/api/admin/users?search=${encodeURIComponent(
        searchTerm
      )}&size=20`;
      console.log("🔗 Fetch API call to:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getApiHeaders(),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur recherche utilisateurs");
      }

      // Type guard pour vérifier la structure des données
      if (!data.data || !data.data.users || !Array.isArray(data.data.users)) {
        throw new Error("Format de données invalide pour les utilisateurs");
      }

      // Transformer les UserProfileDto en UserSearchResult
      const users: UserSearchResult[] = data.data.users.map((user: unknown) => {
        // Type guard pour vérifier que user a la structure attendue
        if (!user || typeof user !== "object") {
          throw new Error("Format utilisateur invalide");
        }

        const userObj = user as Record<string, unknown>;

        return {
          keycloakUserId:
            typeof userObj.keycloakUserId === "string"
              ? userObj.keycloakUserId
              : "",
          username:
            typeof userObj.username === "string" ? userObj.username : "",
          fullName: `${userObj.firstName || ""} ${
            userObj.lastName || ""
          }`.trim(),
          email: typeof userObj.email === "string" ? userObj.email : "",
          roles: Array.isArray(userObj.roles)
            ? (userObj.roles as string[])
            : [],
          enabled:
            typeof userObj.enabled === "boolean" ? userObj.enabled : true,
        };
      });

      console.log(`✅ ${users.length} utilisateurs trouvés`);
      return users;
    } catch (error) {
      console.error("💥 Erreur recherche utilisateurs:", error);
      throw error;
    }
  }

  // ================================
  // STATISTIQUES
  // ================================

  async getMessagingStats(): Promise<MessagingStats> {
    try {
      const conversations = await this.getConversations();

      const totalConversations = conversations.length;
      const unreadMessages = conversations.reduce(
        (sum, conv) => sum + conv.unreadCount,
        0
      );
      const totalMessages = conversations.reduce(
        (sum, conv) => sum + conv.messageCount,
        0
      );
      const activeConversations = conversations.filter(
        (conv) => conv.messageCount > 0
      ).length;
      const privateConversations = conversations.filter(
        (conv) => conv.type === "PRIVATE"
      ).length;
      const groupConversations = conversations.filter(
        (conv) => conv.type === "GROUP"
      ).length;

      return {
        totalConversations,
        unreadMessages,
        totalMessages,
        activeConversations,
        privateConversations,
        groupConversations,
      };
    } catch (error) {
      console.error("💥 Erreur calcul statistiques:", error);
      return {
        totalConversations: 0,
        unreadMessages: 0,
        totalMessages: 0,
        activeConversations: 0,
        privateConversations: 0,
        groupConversations: 0,
      };
    }
  }

  // ================================
  // SANTÉ DU SERVICE
  // ================================

  async checkHealth(): Promise<boolean> {
    try {
      const url = buildUrl.conversations("/health");
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

      return response.ok;
    } catch (error) {
      console.error("💥 Erreur vérification santé service:", error);
      return false;
    }
  }
}

// Instance singleton
export const messageService = new MessageService();
export default messageService;
