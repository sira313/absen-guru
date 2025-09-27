// SvelteKit Service Worker with comprehensive offline support
import { build, files, version } from '$service-worker';

// Create unique cache names for this deployment
const CACHE = `cache-${version}`;
const PAGES_CACHE = `pages-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
];

// Critical pages to cache for offline access
const CRITICAL_PAGES = [
  '/',
  '/login',
  '/guru',
  '/admin',
  '/profile',
  '/about'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  // Create caches and add files
  async function addFilesToCache() {
    // Cache static assets
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    console.log('Static assets cached successfully');
    
    // Cache critical pages
    const pagesCache = await caches.open(PAGES_CACHE);
    for (const page of CRITICAL_PAGES) {
      try {
        const response = await fetch(page);
        if (response.ok) {
          await pagesCache.put(page, response);
          console.log(`Cached page: ${page}`);
        }
      } catch (error) {
        console.warn(`Failed to cache page ${page}:`, error);
      }
    }
  }

  event.waitUntil(addFilesToCache());
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE && key !== PAGES_CACHE) {
        console.log('Deleting old cache:', key);
        await caches.delete(key);
      }
    }
    // Take control of all clients immediately
    await self.clients.claim();
    console.log('Service Worker activated and claimed clients');
  }

  event.waitUntil(deleteOldCaches());
});

// Handle fetch events with comprehensive offline strategy
self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);
    const pagesCache = await caches.open(PAGES_CACHE);

    // Strategy 1: Cache First for static assets
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response) {
        return response;
      }
    }

    // Strategy 2: Network First with comprehensive cache fallback
    try {
      const response = await fetch(event.request);

      // if we're offline, fetch can return a value that is not a Response
      if (!(response instanceof Response)) {
        throw new Error('invalid response from fetch');
      }

      // Cache successful responses
      if (response.status === 200) {
        const responseClone = response.clone();
        
        // Cache pages in pages cache
        if (event.request.destination === 'document') {
          pagesCache.put(event.request, responseClone.clone());
        }
        // Cache other resources in main cache
        else {
          cache.put(event.request, responseClone);
        }
      }

      return response;
    } catch (err) {
      console.log('Network failed, trying cache for:', url.pathname);
      
      // Try pages cache first for documents
      if (event.request.destination === 'document') {
        const cachedPage = await pagesCache.match(event.request);
        if (cachedPage) {
          console.log('Serving cached page:', url.pathname);
          return cachedPage;
        }
        
        // Fallback to root page if specific page not cached
        const rootPage = await pagesCache.match('/');
        if (rootPage) {
          console.log('Serving root page as fallback');
          return rootPage;
        }
      }
      
      // Try main cache for other resources
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        console.log('Serving cached resource:', url.pathname);
        return cachedResponse;
      }

      // Create offline response for uncached pages
      if (event.request.destination === 'document') {
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Offline - Absen Guru</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .offline-content { max-width: 400px; margin: 0 auto; }
                .icon { font-size: 64px; margin-bottom: 20px; }
                h1 { color: #333; margin-bottom: 10px; }
                p { color: #666; margin-bottom: 20px; }
                button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
                button:hover { background: #0056b3; }
              </style>
            </head>
            <body>
              <div class="offline-content">
                <div class="icon">📱</div>
                <h1>Anda Sedang Offline</h1>
                <p>Silakan periksa koneksi internet Anda dan coba lagi.</p>
                <button onclick="location.reload()">Coba Lagi</button>
              </div>
            </body>
          </html>
        `, {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      }

      // For other resources, just throw the error
      throw err;
    }
  }

  event.respondWith(respond());
});
