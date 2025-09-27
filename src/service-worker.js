// Service Worker untuk PWA Offline-First
const CACHE_VERSION = "2.0.0";
const CACHE_NAME = `absen-guru-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/';

// Critical assets that must be cached for offline functionality
const STATIC_ASSETS = [
  "/",
  "/favicon.png",
  "/favicon.svg",  
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json"
];

// Important routes to cache for offline access
const ROUTES_TO_CACHE = [
  "/",
  "/login",
  "/guru",
  "/profile",
  "/about"
];

// Files that should be cached when accessed - for future use
const _CACHE_ON_ACCESS = [
  // CSS and JS files will be cached when loaded
  // API responses will be cached selectively
];

// Install service worker
self.addEventListener("install", (event) => {
  console.log('Service Worker installing...');
  
  async function installCache() {
    const cache = await caches.open(CACHE_NAME);
    
    // Cache static assets first
    try {
      await cache.addAll(STATIC_ASSETS);
      console.log('Static assets cached successfully');
    } catch (error) {
      console.warn('Some static assets failed to cache:', error);
    }
    
    // Cache important routes
    for (const route of ROUTES_TO_CACHE) {
      try {
        const response = await fetch(route);
        if (response.ok) {
          await cache.put(route, response);
        }
      } catch (error) {
        console.warn(`Failed to cache route ${route}:`, error);
      }
    }
  }

  event.waitUntil(installCache());
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", (event) => {
  console.log('Service Worker activating...');
  
  async function cleanupAndActivate() {
    // Remove old caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );
    
    // Take control of all clients immediately
    await self.clients.claim();
    console.log('Service Worker activated and claimed clients');
  }

  event.waitUntil(cleanupAndActivate());
});

// Handle fetch events with offline-first strategy
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE_NAME);

  // Strategy 1: Cache First for static assets and important routes
  if (STATIC_ASSETS.includes(url.pathname) || ROUTES_TO_CACHE.includes(url.pathname)) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Strategy 2: Network First with Cache Fallback for dynamic content
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for future offline access
    if (networkResponse.ok) {
      // Clone the response before caching
      const responseToCache = networkResponse.clone();
      
      // Cache HTML pages, CSS, JS files
      if (
        request.destination === 'document' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.startsWith('/_app/')
      ) {
        await cache.put(request, responseToCache);
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed - try cache fallback
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If requesting a page and we have no cache, return offline page
    if (request.destination === 'document') {
      const offlineResponse = await cache.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // Return error for other requests
    throw error;
  }
}
