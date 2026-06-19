// vite.config.ts
import { defineConfig } from "file:///E:/new/New%20folder/hansitha-web-storefront/client/node_modules/vite/dist/node/index.js";
import react from "file:///E:/new/New%20folder/hansitha-web-storefront/client/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///E:/new/New%20folder/hansitha-web-storefront/client/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///E:/new/New%20folder/hansitha-web-storefront/client/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "E:\\new\\New folder\\hansitha-web-storefront\\client";
var vite_config_default = defineConfig(({ mode }) => ({
  base: "/",
  // Required for Render routing
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": "http://localhost:8080"
    },
    // START: ADD THIS BLOCK
    // This is the fix for the "Cross-Origin-Opener-Policy" error
    // It allows the Google login popup to communicate back to your app
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    }
    // END: ADD THIS BLOCK
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // ✅ PWA Plugin
    VitePWA({
      registerType: "autoUpdate",
      // Automatically update SW
      includeAssets: ["favicon.svg", "robots.txt"],
      // 👇 Web App Manifest (no `serviceworker` key here!)
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
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      // 👇 Workbox settings to control caching
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      },
      // 👇 Enable service worker in dev mode for testing
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxuZXdcXFxcTmV3IGZvbGRlclxcXFxoYW5zaXRoYS13ZWItc3RvcmVmcm9udFxcXFxjbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXG5ld1xcXFxOZXcgZm9sZGVyXFxcXGhhbnNpdGhhLXdlYi1zdG9yZWZyb250XFxcXGNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovbmV3L05ldyUyMGZvbGRlci9oYW5zaXRoYS13ZWItc3RvcmVmcm9udC9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgYmFzZTogXCIvXCIsIC8vIFJlcXVpcmVkIGZvciBSZW5kZXIgcm91dGluZ1xyXG5cclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGlcIjogXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcclxuICAgIH0sXHJcbiAgICAvLyBTVEFSVDogQUREIFRISVMgQkxPQ0tcclxuICAgIC8vIFRoaXMgaXMgdGhlIGZpeCBmb3IgdGhlIFwiQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3lcIiBlcnJvclxyXG4gICAgLy8gSXQgYWxsb3dzIHRoZSBHb29nbGUgbG9naW4gcG9wdXAgdG8gY29tbXVuaWNhdGUgYmFjayB0byB5b3VyIGFwcFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3knOiAnc2FtZS1vcmlnaW4tYWxsb3ctcG9wdXBzJyxcclxuICAgIH0sXHJcbiAgICAvLyBFTkQ6IEFERCBUSElTIEJMT0NLXHJcbiAgfSxcclxuXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcclxuXHJcbiAgICAvLyBcdTI3MDUgUFdBIFBsdWdpblxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsIC8vIEF1dG9tYXRpY2FsbHkgdXBkYXRlIFNXXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFtcImZhdmljb24uc3ZnXCIsIFwicm9ib3RzLnR4dFwiXSxcclxuXHJcbiAgICAgIC8vIFx1RDgzRFx1REM0NyBXZWIgQXBwIE1hbmlmZXN0IChubyBgc2VydmljZXdvcmtlcmAga2V5IGhlcmUhKVxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6IFwiTXkgQXBwXCIsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogXCJBcHBcIixcclxuICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxyXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6IFwiI2ZmZmZmZlwiLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiMwMDAwMDBcIixcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiL3B3YS0xOTJ4MTkyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCIxOTJ4MTkyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiL3B3YS01MTJ4NTEyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBcdUQ4M0RcdURDNDcgV29ya2JveCBzZXR0aW5ncyB0byBjb250cm9sIGNhY2hpbmdcclxuICAgICAgd29ya2JveDoge1xyXG4gICAgICAgIGdsb2JQYXR0ZXJuczogW1wiKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmd9XCJdLFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gXHVEODNEXHVEQzQ3IEVuYWJsZSBzZXJ2aWNlIHdvcmtlciBpbiBkZXYgbW9kZSBmb3IgdGVzdGluZ1xyXG4gICAgICBkZXZPcHRpb25zOiB7XHJcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG5cclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFUsU0FBUyxvQkFBb0I7QUFDM1csT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxNQUFNO0FBQUE7QUFBQSxFQUVOLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNWO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJQSxTQUFTO0FBQUEsTUFDUCw4QkFBOEI7QUFBQSxJQUNoQztBQUFBO0FBQUEsRUFFRjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUE7QUFBQSxJQUcxQyxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUE7QUFBQSxNQUNkLGVBQWUsQ0FBQyxlQUFlLFlBQVk7QUFBQTtBQUFBLE1BRzNDLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULGtCQUFrQjtBQUFBLFFBQ2xCLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BR0EsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLGdDQUFnQztBQUFBLE1BQ2pEO0FBQUE7QUFBQSxNQUdBLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBRWhCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
