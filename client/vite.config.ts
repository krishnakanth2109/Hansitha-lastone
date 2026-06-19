import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  base: "/", // Required for Render routing

  server: {
    host: "::",
    port: 8080,
    // START: CORRECTED PROXY
    // This now correctly points to your backend server running on port 3000
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Optional: you can rewrite the path if needed, but likely not necessary
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
    // END: CORRECTED PROXY

    // This header configuration is correct and necessary for Google Login
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),

    // ✅ PWA Plugin
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "My App",
        short_name: "App",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));