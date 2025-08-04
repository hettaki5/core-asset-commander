export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8090/api";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  ME: `${API_BASE_URL}/auth/me`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
};

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const getAuthHeaders = () => ({
  ...DEFAULT_HEADERS,
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});
