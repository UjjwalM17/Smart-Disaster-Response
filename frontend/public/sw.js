/**
 * ResQ Service Worker — Offline-First PWA Shell & Tile Cache
 */

const CACHE_NAME = 'resq-shell-v1';
const MAP_CACHE_NAME = 'resq-map-tiles-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/images/disasters/flood.jpg',
  '/images/disasters/fire.jpg',
  '/images/disasters/collapse.jpg',
  '/images/disasters/landslide.jpg',
  '/images/disasters/emergency.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ResQ SW] Pre-caching offline application shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== MAP_CACHE_NAME) {
            console.log('[ResQ SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (POST, PUT, PATCH, DELETE are handled by IndexedDB sync queue)
  if (event.request.method !== 'GET') {
    return;
  }

  // 1. Map Tiles (OpenStreetMap / Carto / Tile providers)
  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.includes('/tiles/')) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // If offline and tile not cached, return transparent or fallback SVG tile
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#1e293b"/><path d="M0 0l256 256M256 0L0 256" stroke="#334155" stroke-width="1"/><text x="128" y="130" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="middle">Offline (Uncached Region)</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  // 2. Local API requests (/api/**)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Return offline JSON message indicating network unavailability
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Device is offline. Local IndexedDB storage is active.',
              timestamp: new Date().toISOString(),
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          );
        })
    );
    return;
  }

  // 3. Application Shell & Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
