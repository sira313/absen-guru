// Aggressive PWA Service Worker - Cache Everything for Full Offline
import { build, files, version } from '$service-worker';

// Create unique cache names for this deployment
const CACHE = `cache-${version}`;
const PAGES_CACHE = `pages-${version}`;
const RUNTIME_CACHE = `runtime-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
];

// ALL possible pages to cache aggressively
const ALL_PAGES = [
  '/',
  '/login',
  '/logout',
  '/guru',
  '/guru/riwayat',
  '/admin',
  '/admin/users',
  '/admin/laporan', 
  '/admin/pengaturan',
  '/profile',
  '/about'
];

// API endpoints to cache for offline data
const API_ENDPOINTS = [
  '/api/attendance',
  '/api/users'
];

// Install service worker with aggressive caching
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with aggressive caching...');
  
  // Cache EVERYTHING aggressively
  async function cacheEverything() {
    // Cache static assets
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    console.log('✅ Static assets cached successfully');
    
    // Cache ALL pages aggressively
    const pagesCache = await caches.open(PAGES_CACHE);
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    
    console.log('🔄 Starting aggressive page caching...');
    
    for (const page of ALL_PAGES) {
      try {
        const response = await fetch(page, { 
          credentials: 'include',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });
        
        if (response.ok) {
          await pagesCache.put(page, response.clone());
          console.log(`✅ Cached page: ${page}`);
          
          // Also cache any additional resources this page might reference
          const responseText = await response.text();
          
          // Extract and cache CSS/JS references
          const cssMatches = responseText.match(/href="([^"]*\.css[^"]*)"/g) || [];
          const jsMatches = responseText.match(/src="([^"]*\.js[^"]*)"/g) || [];
          
          for (const match of [...cssMatches, ...jsMatches]) {
            const url = match.match(/"([^"]*)"/)[1];
            if (url.startsWith('/') || url.startsWith('.')) {
              try {
                const resourceResponse = await fetch(url);
                if (resourceResponse.ok) {
                  await runtimeCache.put(url, resourceResponse);
                  console.log(`✅ Cached resource: ${url}`);
                }
              } catch (err) {
                console.warn(`⚠️ Failed to cache resource ${url}:`, err);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to cache page ${page}:`, error);
      }
    }
    
    // Cache API endpoints with sample data
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          await runtimeCache.put(endpoint, response);
          console.log(`✅ Cached API: ${endpoint}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to cache API ${endpoint}:`, error);
      }
    }
    
    console.log('🎉 Aggressive caching completed!');
  }

  event.waitUntil(cacheEverything());
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE && key !== PAGES_CACHE && key !== RUNTIME_CACHE) {
        console.log('🗑️ Deleting old cache:', key);
        await caches.delete(key);
      }
    }
    // Take control of all clients immediately
    await self.clients.claim();
    console.log('✅ Service Worker activated and claimed clients');
  }

  event.waitUntil(deleteOldCaches());
});

// Handle fetch events with CACHE-FIRST strategy for everything
self.addEventListener('fetch', (event) => {
  // Handle all requests (GET, POST, etc.) for comprehensive offline support
  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);
    const pagesCache = await caches.open(PAGES_CACHE);
    const runtimeCache = await caches.open(RUNTIME_CACHE);

    // Strategy: CACHE FIRST for everything!
    console.log(`🔍 Handling request: ${event.request.method} ${url.pathname}`);

    // 1. Try static assets cache first
    if (ASSETS.includes(url.pathname)) {
      const cachedAsset = await cache.match(event.request);
      if (cachedAsset) {
        console.log(`✅ Serving cached asset: ${url.pathname}`);
        return cachedAsset;
      }
    }

    // 2. Try pages cache for documents
    if (event.request.destination === 'document' || event.request.headers.get('accept')?.includes('text/html')) {
      const cachedPage = await pagesCache.match(event.request);
      if (cachedPage) {
        console.log(`✅ Serving cached page: ${url.pathname}`);
        return cachedPage;
      }
    }

    // 3. Try runtime cache for any other resources
    const cachedRuntime = await runtimeCache.match(event.request);
    if (cachedRuntime) {
      console.log(`✅ Serving cached runtime: ${url.pathname}`);
      return cachedRuntime;
    }

    // 4. Try main cache as fallback
    const cachedMain = await cache.match(event.request);
    if (cachedMain) {
      console.log(`✅ Serving cached main: ${url.pathname}`);
      return cachedMain;
    }

    // 5. If nothing in cache, try network and cache the response (auto-cache dynamic pages)
    if (event.request.method === 'GET') {
      try {
        console.log(`🌐 Fetching from network: ${url.pathname}`);
        const networkResponse = await fetch(event.request);

        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          // Auto-cache all HTML/documents (dynamic or static)
          if (
            event.request.destination === 'document' ||
            event.request.headers.get('accept')?.includes('text/html')
          ) {
            // Jangan double-cache halaman yang sudah ada di ALL_PAGES
            const isStaticPage = ALL_PAGES.includes(url.pathname);
            if (!isStaticPage) {
              await pagesCache.put(event.request, responseClone.clone());
              console.log(`💾 Auto-cached dynamic page: ${url.pathname}`);
            } else {
              // Tetap update cache untuk static page
              await pagesCache.put(event.request, responseClone.clone());
              console.log(`💾 Updated cached static page: ${url.pathname}`);
            }
          } else {
            await runtimeCache.put(event.request, responseClone);
            console.log(`💾 Cached new resource: ${url.pathname}`);
          }
          return networkResponse;
        }
      } catch (error) {
        console.log(`❌ Network failed for: ${url.pathname}`, error);
      }
    }

    // 6. Ultimate fallbacks for offline
    if (event.request.destination === 'document' || event.request.headers.get('accept')?.includes('text/html')) {
      // Try to serve the root page as fallback
      const rootFallback = await pagesCache.match('/');
      if (rootFallback) {
        console.log(`📄 Serving root page as fallback for: ${url.pathname}`);
        return rootFallback;
      }

      // Create a comprehensive offline page
      console.log(`📱 Creating offline page for: ${url.pathname}`);
      return new Response(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Offline - Absen Guru</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; display: flex; align-items: center; justify-content: center;
                color: white; text-align: center; padding: 20px;
              }
              .container { max-width: 400px; }
              .icon { font-size: 80px; margin-bottom: 20px; animation: bounce 2s infinite; }
              h1 { font-size: 2rem; margin-bottom: 16px; font-weight: 600; }
              p { font-size: 1.1rem; margin-bottom: 32px; opacity: 0.9; line-height: 1.5; }
              .actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
              button { 
                background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3);
                padding: 12px 24px; border-radius: 30px; cursor: pointer; font-size: 1rem;
                transition: all 0.3s ease; backdrop-filter: blur(10px);
              }
              button:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
              .status { margin-top: 24px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; }
              .cached-info { margin-top: 16px; font-size: 0.9rem; opacity: 0.8; }
              @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">📱</div>
              <h1>Mode Offline</h1>
              <p>Aplikasi sedang berjalan dalam mode offline. Beberapa fitur mungkin terbatas.</p>
              
              <div class="actions">
                <button onclick="location.reload()">� Coba Lagi</button>
                <button onclick="history.back()">← Kembali</button>
                <button onclick="location.href='/'">🏠 Beranda</button>
              </div>
              
              <div class="status">
                <div><strong>Status:</strong> Offline</div>
                <div><strong>Halaman:</strong> ${url.pathname}</div>
                <div class="cached-info">
                  💾 Data tersimpan dalam cache browser<br>
                  📶 Hubungkan ke internet untuk sinkronisasi
                </div>
              </div>
            </div>
            
            <script>
              // Auto-retry when online
              window.addEventListener('online', () => {
                setTimeout(() => location.reload(), 1000);
              });
              
              // Update online status
              function updateStatus() {
                const status = navigator.onLine ? 'Online' : 'Offline';
                document.querySelector('.status div').innerHTML = '<strong>Status:</strong> ' + status;
              }
              
              window.addEventListener('online', updateStatus);
              window.addEventListener('offline', updateStatus);
            </script>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // For non-HTML requests, return a network error
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }

  event.respondWith(respond());
});
