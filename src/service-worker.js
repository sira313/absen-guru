// This placeholder file prevents SvelteKit from bundling the previous custom service worker.
// The production service worker is generated automatically by vite-plugin-pwa using the
// generateSW strategy defined in vite.config.js.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
