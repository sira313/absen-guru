// Service Worker untuk PWA
const CACHE_VERSION = "1.0.0";
const CACHE = `cache-${CACHE_VERSION}`;

// Assets to cache (app shell)
const ASSETS = [
  "/",
  "/favicon.png",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// Install service worker
self.addEventListener("install", (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

// Activate service worker
self.addEventListener("activate", (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

// Handle fetch events
self.addEventListener("fetch", (event) => {
  // Ignore non-http requests
  if (event.request.method !== "GET") return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // Serve build files from cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) {
        return response;
      }
    }

    // Try the network first, fall back to cache
    try {
      const response = await fetch(event.request);

      // Cache successful responses
      if (!(response instanceof Response)) {
        throw new Error("invalid response from fetch");
      }

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (err) {
      // Network failed, try cache
      const response = await cache.match(event.request);
      if (response) {
        return response;
      }

      // If we don't have it cached, return a fallback
      throw err;
    }
  }

  event.respondWith(respond());
});
