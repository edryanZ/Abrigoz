import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",

      manifest: {
        name: "Abrigo",
        short_name: "Abrigo",
        description: "Um lugar para guardar aquilo que realmente importa.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        lang: "pt-BR",
        orientation: "portrait",
        start_url: "/",
        shortcuts: [
          { name: "Só Ficar", short_name: "Só Ficar", url: "/so-ficar" },
          { name: "Reflexões", short_name: "Reflexões", url: "/reflexoes" },
          { name: "Momento do Dia", short_name: "Momento", url: "/momento-do-dia" },
          { name: "Meu Dia", short_name: "Meu Dia", url: "/meu-dia" }
        ],

        icons: [
          {
            src: "branding/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "branding/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "branding/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        // Workbox 7 não conclui a minificação em Node 24 neste projeto.
        // O restante do build continua em produção; revisar após atualização compatível.
        mode: "development",
        globPatterns: ["**/*.{js,css,html,png,webp,webmanifest}"],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [{
          urlPattern: ({ url, sameOrigin }) =>
            sameOrigin && url.pathname.startsWith("/audio/"),
          handler: "CacheFirst",
          options: {
            cacheName: "abrigo-audio-v2",
            expiration: {
              maxEntries: 6,
              maxAgeSeconds: 60 * 60 * 24 * 30,
              purgeOnQuotaError: true,
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        }],
      },
    })
  ]
});
