// src/hooks/useWebSocket.ts - Version sans 'any'
import { useCallback, useRef, useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp, Client, StompSubscription } from "@stomp/stompjs";

interface WebSocketMessage {
  type: string;
  message?: unknown;
  userId?: string;
  username?: string;
  isTyping?: boolean;
  conversationId?: string;
  content?: string;
  [key: string]: unknown;
}

interface WebSocketHookProps {
  url: string;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error | Event) => void;
}

interface Subscription {
  unsubscribe: () => void;
}

export const useWebSocket = ({
  url,
  token,
  onConnected,
  onDisconnected,
  onMessage,
  onError,
}: WebSocketHookProps) => {
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      return;
    }

    try {
      console.log("Connexion WebSocket STOMP...");

      const socket = new SockJS(url);
      const stompClient = Stomp.over(socket);

      stompClient.configure({
        debug: (str: string) => {
          if (process.env.NODE_ENV === "development") {
            console.log("STOMP Debug:", str);
          }
        },

        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },

        onConnect: () => {
          console.log("WebSocket STOMP connecté");
          setIsConnected(true);
          onConnected?.();
        },

        onDisconnect: () => {
          console.log("WebSocket STOMP déconnecté");
          setIsConnected(false);
          onDisconnected?.();

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        },

        onStompError: (frame) => {
          console.error("Erreur STOMP:", frame);
          setIsConnected(false);
          onError?.(
            new Error(
              `STOMP Error: ${frame.headers?.message || "Unknown error"}`
            )
          );
        },
      });

      clientRef.current = stompClient;
      stompClient.activate();
    } catch (error) {
      console.error("Erreur création WebSocket:", error);
      setIsConnected(false);
      onError?.(
        error instanceof Error ? error : new Error("Unknown WebSocket error")
      );
    }
  }, [url, token, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    console.log("Déconnexion WebSocket...");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (error) {
        console.warn("Erreur lors de la déconnexion:", error);
      } finally {
        clientRef.current = null;
        setIsConnected(false);
      }
    }
  }, []);

  const sendMessage = useCallback(
    (destination: string, body: Record<string, unknown>) => {
      if (clientRef.current?.connected) {
        try {
          clientRef.current.publish({
            destination,
            body: JSON.stringify(body),
          });
          console.log(`Message envoyé vers ${destination}:`, body);
        } catch (error) {
          console.error("Erreur envoi message STOMP:", error);
        }
      } else {
        console.warn(
          "WebSocket STOMP non connecté, impossible d'envoyer le message"
        );
      }
    },
    []
  );

  const subscribe = useCallback(
    (
      destination: string,
      callback: (message: WebSocketMessage) => void
    ): Subscription | null => {
      if (clientRef.current?.connected) {
        try {
          const subscription: StompSubscription = clientRef.current.subscribe(
            destination,
            (message) => {
              try {
                const parsedBody = JSON.parse(message.body) as WebSocketMessage;
                console.log(`Message reçu de ${destination}:`, parsedBody);
                callback(parsedBody);
              } catch (error) {
                console.warn("Message non-JSON reçu:", message.body);
                callback({ type: "RAW_MESSAGE", content: message.body });
              }
            }
          );

          console.log(`Abonné au topic: ${destination}`);

          return {
            unsubscribe: () => {
              subscription.unsubscribe();
              console.log(`Désabonné du topic: ${destination}`);
            },
          };
        } catch (error) {
          console.error(`Erreur abonnement à ${destination}:`, error);
          return null;
        }
      } else {
        console.warn(
          `WebSocket non connecté, impossible de s'abonner à ${destination}`
        );
        return null;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    subscribe,
    isConnected,
  };
};
