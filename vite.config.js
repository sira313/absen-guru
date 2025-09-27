import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import manifest from "./static/manifest.json" with { type: "json" };

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
        strategies: "generateSW",
        filename: "service-worker.js",
        registerType: "autoUpdate",
        injectRegister: false,
        scope: "/",
        base: "/",
        manifest,
        includeAssets: [
          "favicon.svg",
          "favicon.png",
          "icon-192.png",
          "icon-192.svg",
          "icon-512.png",
          "icon-512.svg",
          "offline.html"
        ],
        workbox: {
          // Define modifyURLPrefix to keep custom glob patterns untouched (avoids auto-added prerender glob)
          modifyURLPrefix: {},
          navigateFallback: undefined,
          navigateFallbackAllowlist: [],
          navigateFallbackDenylist: [/./],
          globPatterns: [
            "client/**/*.{js,css,ico,png,svg,webp,webmanifest}"
          ],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24
                },
                plugins: [
                  {
                    handlerDidError: async () =>
                      (await caches.match("/offline.html")) ?? new Response("<h1>Offline</h1>", {
                        status: 503,
                        headers: { "Content-Type": "text/html" }
                      })
                  }
                ]
              }
            },
            {
              urlPattern: ({ request }) =>
                ["style", "script", "worker"].includes(request.destination),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "assets",
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            },
            {
              urlPattern: /\/api\/(attendance|users)/,
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "api",
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200]
                },
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 5
                },
                plugins: [
                  {
                    handlerDidError: async () =>
                      new Response(
                        JSON.stringify({ error: "offline", message: "Data tidak bisa dimuat saat offline" }),
                        {
                          status: 503,
                          headers: { "Content-Type": "application/json" }
                        }
                      )
                  }
                ]
              }
            }
          ],
          additionalManifestEntries: [
            "/",
            "/login",
            "/logout",
            "/guru",
            "/guru/riwayat",
            "/admin",
            "/admin/users",
            "/admin/laporan",
            "/admin/pengaturan",
            "/profile",
            "/about"
          ].map((url) => ({ url, revision: null }))
        },
        devOptions: {
          enabled: true,
          suppressWarnings: true,
          type: "module"
        },
        kit: {
          includeVersionFile: true
        }
    })
  ],
  optimizeDeps: {
    exclude: ["cally"],
  },
  server: {
    host: "0.0.0.0", // Untuk akses dari network lain (RasPi)
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    rollupOptions: {
      external: ['events'], // Suppress PouchDB events warning
    }
  },
  define: {
    global: 'globalThis', // PouchDB compatibility
  }
});
