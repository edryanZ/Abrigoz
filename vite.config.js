import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "branding/favicon-32.png",
        "branding/apple-touch-icon.png"
      ],

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
        mode: "development",
        globPatterns: ["**/*.{js,css,html,png,webp,webmanifest}"],
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.startsWith("/audio/"),
          handler: "CacheFirst",
          options: {
            cacheName: "abrigo-audio-v2",
            expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        }],
      },
    })
  ]
});
