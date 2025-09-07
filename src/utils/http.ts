// src/utils/http.ts - Interceptor pour headers automatiques
import { getApiHeaders } from "@/config/api";

// Configuration globale pour fetch avec headers automatiques
const originalFetch = window.fetch;

window.fetch = async (
  url: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> => {
  const urlStr = url.toString();

  // Ajouter headers Authorization automatiquement pour les appels API
  if (
    urlStr.includes("/api/") ||
    urlStr.startsWith("/api") ||
    urlStr.startsWith("http://localhost:8086")
  ) {
    const apiHeaders = getApiHeaders();

    const newOptions: RequestInit = {
      ...options,
      headers: {
        ...apiHeaders,
        ...(options?.headers || {}),
      },
    };

    console.log(`🔗 Fetch API call to: ${urlStr}`);
    console.log(`📋 Headers:`, newOptions.headers);

    return originalFetch(url, newOptions);
  }

  // Pour les autres requêtes, laisser tel quel
  return originalFetch(url, options);
};

export {}; // Make it a module
