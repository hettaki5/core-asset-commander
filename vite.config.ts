import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    strictPort: true,
    proxy: {
      // RÃˆGLES SPÃ‰CIFIQUES EN PREMIER (auth-service direct sur port 8090)
      "/api/auth": {
        target: "http://localhost:8090",
        changeOrigin: true,
        secure: false,
      },
      "/api/admin": {
        target: "http://localhost:8090",
        changeOrigin: true,
        secure: false,
      },
      "/api/users": {
        target: "http://localhost:8090",
        changeOrigin: true,
        secure: false,
      },

      // RÃˆGLE GÃ‰NÃ‰RALE EN DERNIER (gateway pour tous les autres microservices)
      // Ceci inclut automatiquement /api/tickets et /api/events
      "/api": {
        target: "http://localhost:8086",
        changeOrigin: true,
        secure: false,
      },

      // Support WebSocket pour message-service
      "/ws": {
        target: "ws://localhost:8086",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
