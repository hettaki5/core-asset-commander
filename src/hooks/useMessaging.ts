// src/hooks/useMessaging.ts - Version corrigée sans erreurs TypeScript
import { useState, useEffect, useRef, useCallback } from "react";
import { messageService } from "@/services/messageService";
import { useWebSocket } from "@/hooks/useWebSocket";
import { API_CONFIG } from "@/config/api";
import type {
  Conversation,
  Message,
  MessagingState,
  WebSocketMessage,
  CreateConversationRequest,
  SendMessageRequest,
  UseMessagingReturn,
  WEBSOCKET_TOPICS,
  WEBSOCKET_DESTINATIONS,
} from "@/types/messages";

const INITIAL_STATE: MessagingState = {
  conversations: [],
  messages: {},
  isLoading: true,
  unreadCount: 0,
  typingUsers: {},
  isConnected: false,
};

export function useMessaging(): UseMessagingReturn {
  const [state, setState] = useState<MessagingState>(INITIAL_STATE);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // ===================================================================
  // CALLBACKS POUR WEBSOCKET
  // ===================================================================

  const handleNewMessage = useCallback((message: Message) => {
    setState((prev) => {
      const conversationMessages = prev.messages[message.conversationId] || [];
      const updatedMessages = [message, ...conversationMessages];

      const updatedConversations = prev.conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderInfo: message.senderInfo || {
                keycloakUserId: message.senderId,
                username: "Utilisateur Inconnu",
                displayName: "Utilisateur Inconnu",
                enabled: true,
              },
              timestamp: message.timestamp,
            },
            unreadCount: conv.unreadCount + 1,
            messageCount: conv.messageCount + 1,
          };
        }
        return conv;
      });

      return {
        ...prev,
        messages: {
          ...prev.messages,
          [message.conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
        unreadCount: prev.unreadCount + 1,
      };
    });
  }, []);

  const handleTypingIndicator = useCallback((message: WebSocketMessage) => {
    const userId = message.userId;
    const conversationId = message.conversationId;

    if (!userId || !conversationId) return;

    setState((prev) => {
      const conversationTyping = prev.typingUsers[conversationId] || [];

      let updatedTyping;
      if (message.isTyping) {
        if (!conversationTyping.find((t) => t.userId === userId)) {
          updatedTyping = [
            ...conversationTyping,
            {
              conversationId,
              userId,
              username: message.username || "Utilisateur Inconnu",
              isTyping: true,
            },
          ];
        } else {
          updatedTyping = conversationTyping;
        }
      } else {
        updatedTyping = conversationTyping.filter((t) => t.userId !== userId);
      }

      return {
        ...prev,
        typingUsers: {
          ...prev.typingUsers,
          [conversationId]: updatedTyping,
        },
      };
    });
  }, []);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("📨 Message WebSocket reçu:", message.type);

      switch (message.type) {
        case "NEW_MESSAGE":
          if (message.message) {
            handleNewMessage(message.message as Message);
          }
          break;

        case "TYPING":
          handleTypingIndicator(message);
          break;

        case "USER_JOINED":
        case "USER_LEFT":
          console.log(`👤 ${message.type}: ${message.username}`);
          break;

        case "USER_STATUS":
          console.log(
            `📡 Statut utilisateur: ${message.username} ${
              message.isOnline ? "en ligne" : "hors ligne"
            }`
          );
          break;

        case "ERROR":
          console.error("❌ Erreur WebSocket:", message.error);
          setState((prev) => ({
            ...prev,
            error:
              typeof message.error === "string"
                ? message.error
                : "Erreur WebSocket inconnue",
          }));
          break;

        default:
          console.log("❓ Type de message WebSocket non géré:", message.type);
      }
    },
    [handleNewMessage, handleTypingIndicator]
  );

  // ===================================================================
  // WEBSOCKET SETUP
  // ===================================================================

  const token =
    localStorage.getItem("auth_token")?.replace("Bearer ", "") || "";

  const {
    connect: wsConnect,
    disconnect: wsDisconnect,
    sendMessage: wsSendMessage,
    subscribe,
    isConnected: wsIsConnected,
  } = useWebSocket({
    url: API_CONFIG.WEBSOCKET_URL, // SUPPRIMÉ .replace('ws://', 'http://')
    token,
    onConnected: () => {
      console.log("✅ WebSocket connecté");
      reconnectAttempts.current = 0;
      setState((prev) => ({
        ...prev,
        isConnected: true,
        error: undefined,
      }));
    },
    onDisconnected: () => {
      console.log("🔌 WebSocket déconnecté");
      setState((prev) => ({ ...prev, isConnected: false }));
    },
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      console.error("❌ Erreur WebSocket:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erreur WebSocket",
        isConnected: false,
      }));
    },
  });

  // ===================================================================
  // API METHODS
  // ===================================================================

  const getConversations = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const conversations = await messageService.getConversations();

      const totalUnread = conversations.reduce(
        (sum, conv) => sum + conv.unreadCount,
        0
      );

      setState((prev) => ({
        ...prev,
        conversations,
        unreadCount: totalUnread,
        isLoading: false,
        error: undefined,
      }));

      console.log(`✅ ${conversations.length} conversations récupérées`);
    } catch (error) {
      console.error("❌ Erreur récupération conversations:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Erreur récupération conversations",
        isLoading: false,
      }));
    }
  }, []);

  const getConversation = useCallback(
    async (id: string): Promise<Conversation | null> => {
      try {
        const conversation = await messageService.getConversation(id);

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((conv) =>
            conv.id === id ? conversation : conv
          ),
        }));

        return conversation;
      } catch (error) {
        console.error(`❌ Erreur récupération conversation ${id}:`, error);
        return null;
      }
    },
    []
  );

  const createConversation = useCallback(
    async (request: CreateConversationRequest) => {
      try {
        const conversation = await messageService.createConversation(request);

        setState((prev) => ({
          ...prev,
          conversations: [conversation, ...prev.conversations],
        }));

        console.log("✅ Conversation créée:", conversation.id);
      } catch (error) {
        console.error("❌ Erreur création conversation:", error);
        throw error;
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (request: SendMessageRequest) => {
      try {
        const message = await messageService.sendMessage(request);

        setState((prev) => {
          const conversationMessages =
            prev.messages[request.conversationId] || [];
          return {
            ...prev,
            messages: {
              ...prev.messages,
              [request.conversationId]: [message, ...conversationMessages],
            },
          };
        });

        // Envoyer via WebSocket pour notifier les autres participants
        if (wsIsConnected) {
          wsSendMessage("/app/message.send", {
            conversationId: request.conversationId,
            content: request.content,
            messageType: request.messageType,
          });
        }

        console.log("✅ Message envoyé:", message.id);
      } catch (error) {
        console.error("❌ Erreur envoi message:", error);
        throw error;
      }
    },
    [wsSendMessage, wsIsConnected]
  );

  const getMessages = useCallback(
    async (conversationId: string, page?: number) => {
      try {
        const messages = await messageService.getMessages(conversationId, page);

        setState((prev) => ({
          ...prev,
          messages: {
            ...prev.messages,
            [conversationId]:
              page === 0 || !page
                ? messages
                : [...(prev.messages[conversationId] || []), ...messages],
          },
        }));

        console.log(
          `✅ ${messages.length} messages récupérés pour conversation ${conversationId}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur récupération messages conversation ${conversationId}:`,
          error
        );
        throw error;
      }
    },
    []
  );

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    try {
      await messageService.markMessagesAsRead(conversationId);

      setState((prev) => {
        const conversation = prev.conversations.find(
          (c) => c.id === conversationId
        );
        const unreadCount = conversation?.unreadCount || 0;

        return {
          ...prev,
          conversations: prev.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ),
          unreadCount: prev.unreadCount - unreadCount,
        };
      });

      console.log(`✅ Messages marqués comme lus: ${conversationId}`);
    } catch (error) {
      console.error(
        `❌ Erreur marquage messages lus ${conversationId}:`,
        error
      );
      throw error;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);

      setState((prev) => {
        const updatedMessages = { ...prev.messages };
        Object.keys(updatedMessages).forEach((conversationId) => {
          updatedMessages[conversationId] = updatedMessages[
            conversationId
          ].filter((m) => m.id !== messageId);
        });

        return {
          ...prev,
          messages: updatedMessages,
        };
      });

      console.log(`✅ Message supprimé: ${messageId}`);
    } catch (error) {
      console.error(`❌ Erreur suppression message ${messageId}:`, error);
      throw error;
    }
  }, []);

  const addParticipants = useCallback(
    async (conversationId: string, participantIds: string[]) => {
      try {
        const updatedConversation = await messageService.addParticipants(
          conversationId,
          participantIds
        );

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((conv) =>
            conv.id === conversationId ? updatedConversation : conv
          ),
        }));

        console.log(
          `✅ ${participantIds.length} participants ajoutés à ${conversationId}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur ajout participants à ${conversationId}:`,
          error
        );
        throw error;
      }
    },
    []
  );

  const removeParticipant = useCallback(
    async (conversationId: string, participantId: string) => {
      try {
        const updatedConversation = await messageService.removeParticipant(
          conversationId,
          participantId
        );

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((conv) =>
            conv.id === conversationId ? updatedConversation : conv
          ),
        }));

        console.log(
          `✅ Participant ${participantId} retiré de ${conversationId}`
        );
      } catch (error) {
        console.error(
          `❌ Erreur retrait participant ${participantId} de ${conversationId}:`,
          error
        );
        throw error;
      }
    },
    []
  );

  // ===================================================================
  // WEBSOCKET ACTIONS
  // ===================================================================

  const joinConversation = useCallback(
    (conversationId: string) => {
      if (wsIsConnected) {
        wsSendMessage("/app/conversation.join", { conversationId });
        console.log(
          `👋 Rejoint la conversation ${conversationId} via WebSocket`
        );
      }
    },
    [wsSendMessage, wsIsConnected]
  );

  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (wsIsConnected) {
        wsSendMessage("/app/conversation.leave", { conversationId });
        console.log(
          `👋 Quitté la conversation ${conversationId} via WebSocket`
        );
      }
    },
    [wsSendMessage, wsIsConnected]
  );

  const sendTypingIndicator = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (wsIsConnected) {
        wsSendMessage("/app/message.typing", { conversationId, isTyping });
      }
    },
    [wsSendMessage, wsIsConnected]
  );

  // ===================================================================
  // UTILITY METHODS
  // ===================================================================

  const setActiveConversation = useCallback(
    (conversationId?: string) => {
      setState((prev) => ({ ...prev, activeConversation: conversationId }));

      if (conversationId) {
        joinConversation(conversationId);
        markMessagesAsRead(conversationId).catch(console.error);

        // Charger les messages si pas encore fait
        if (!state.messages[conversationId]) {
          getMessages(conversationId).catch(console.error);
        }
      }
    },
    [joinConversation, markMessagesAsRead, getMessages, state.messages]
  );

  const getUnreadCount = useCallback(
    (conversationId?: string): number => {
      if (conversationId) {
        const conversation = state.conversations.find(
          (c) => c.id === conversationId
        );
        return conversation?.unreadCount || 0;
      }
      return state.unreadCount;
    },
    [state.conversations, state.unreadCount]
  );

  // ===================================================================
  // LIFECYCLE
  // ===================================================================

  useEffect(() => {
    console.log("🚀 Initialisation du service de messagerie...");

    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("❌ Pas de token d'authentification");
      setState((prev) => ({
        ...prev,
        error: "Non authentifié",
        isLoading: false,
      }));
      return;
    }

    const initialize = async () => {
      try {
        const isHealthy = await messageService.checkHealth();
        if (!isHealthy) {
          throw new Error("Service de messagerie indisponible");
        }

        await getConversations();
        wsConnect();

        console.log("✅ Service de messagerie initialisé");
      } catch (error) {
        console.error("❌ Erreur initialisation service de messagerie:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erreur d'initialisation",
          isLoading: false,
        }));
      }
    };

    initialize();

    return () => {
      console.log("🧹 Nettoyage du service de messagerie");
      wsDisconnect();
    };
  }, [getConversations, wsConnect, wsDisconnect]);

  // Mettre à jour l'état de connexion basé sur WebSocket
  useEffect(() => {
    setState((prev) => ({ ...prev, isConnected: wsIsConnected }));
  }, [wsIsConnected]);

  // ===================================================================
  // RETURN API
  // ===================================================================

  return {
    // État
    state,

    // Actions conversations
    createConversation,
    getConversations,
    getConversation,
    addParticipants,
    removeParticipant,

    // Actions messages
    sendMessage,
    getMessages,
    markMessagesAsRead,
    deleteMessage,

    // WebSocket
    joinConversation,
    leaveConversation,
    sendTypingIndicator,

    // Utilitaires
    setActiveConversation,
    getUnreadCount,

    // États de connexion
    connect: wsConnect,
    disconnect: wsDisconnect,
    reconnect: wsConnect,
  };
}
