import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ||
  `http://127.0.0.1:${process.env.COURTLY_API_PORT || "3100"}`;

const previewAccessUrlLogger: Plugin = {
  name: "courtly-preview-access-url",
  configurePreviewServer(server) {
    server.httpServer.once("listening", () => {
      const address = server.httpServer.address();
      const activePort = address && typeof address !== "string" ? address.port : server.config.preview.port;
      const publicPort = process.env.COURTLY_WEB_HOST_PORT ?? activePort;
      console.info(`Courtly web is ready: http://localhost:${publicPort}`);
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), previewAccessUrlLogger],
  server: {
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
