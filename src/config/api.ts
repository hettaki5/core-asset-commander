// src/config/api.ts - Configuration API avec tous les services
export const API_CONFIG = {
  // Auth service - DIRECT (comme configuré)
  AUTH_SERVICE: "http://localhost:8090/api",

  // Tous les autres services - via Gateway ET proxy Vite (ORIGINAL CONFIG)
  GATEWAY_BASE: "/api",
  ASSET_SERVICE: "/api/assets",
  CONFIG_SERVICE: "/api/config",
  FORMS_SERVICE: "/api/form",
  METADATA_SERVICE: "/api/metadata",
  VALIDATION_SERVICE: "/api/validation",
  IMAGES_SERVICE: "/api/images",
  REPORTS_SERVICE: "/api/reports",

  // Event-Service via Gateway
  EVENT_SERVICE: "/api/events",

  // Ticket-Service via Gateway - CORRIGÉ pour utiliser le proxy
  TICKET_SERVICE: "/api/tickets",

  // Message-Service via Gateway
  MESSAGE_SERVICE: "/api/messages",
  CONVERSATION_SERVICE: "/api/conversations",

  // WebSocket pour messagerie temps réel via Gateway
  WEBSOCKET_URL: "ws://localhost:8086/ws",
};

export const buildUrl = {
  auth: (path: string) => `${API_CONFIG.AUTH_SERVICE}${path}`,
  asset: (path: string) => `${API_CONFIG.ASSET_SERVICE}${path}`,
  config: (path: string) => `${API_CONFIG.CONFIG_SERVICE}${path}`,
  form: (path: string) => `${API_CONFIG.FORMS_SERVICE}${path}`,
  metadata: (path: string) => `${API_CONFIG.METADATA_SERVICE}${path}`,
  validation: (path: string) => `${API_CONFIG.VALIDATION_SERVICE}${path}`,
  images: (path: string) => `${API_CONFIG.IMAGES_SERVICE}${path}`,
  reports: (path: string) => `${API_CONFIG.REPORTS_SERVICE}${path}`,

  // Event-Service
  events: (path: string) => `${API_CONFIG.EVENT_SERVICE}${path}`,

  // Ticket-Service - Working pattern
  tickets: (path: string) => `${API_CONFIG.TICKET_SERVICE}${path}`,

  // Message-Service - FIXED to match tickets pattern
  conversations: (path: string) => `${API_CONFIG.CONVERSATION_SERVICE}${path}`,
  messages: (path: string) => `${API_CONFIG.MESSAGE_SERVICE}${path}`,
  websocket: () => API_CONFIG.WEBSOCKET_URL,
};

// Headers API avec authentification automatique
export const getApiHeaders = () => {
  const token = localStorage.getItem("auth_token");
  console.log("Token récupéré:", token ? "Présent" : "Absent");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  console.log("Headers générés:", headers);
  return headers;
};

// Headers pour upload multipart
export const getMultipartHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Headers pour WebSocket (token séparé)
export const getWebSocketToken = (): string | null => {
  const token = localStorage.getItem("auth_token");
  return token ? token.replace("Bearer ", "") : null;
};

// Utilitaire pour vérifier la connectivité des services
export const checkServiceHealth = async (
  serviceName: keyof typeof API_CONFIG
): Promise<boolean> => {
  try {
    const baseUrl = API_CONFIG[serviceName];
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: getApiHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Configuration des timeouts
export const REQUEST_TIMEOUT = 10000; // 10 secondes
export const WEBSOCKET_RECONNECT_DELAY = 3000; // 3 secondes
