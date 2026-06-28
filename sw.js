// Service Worker for LiveReaction PWA
const CACHE_NAME = 'livereaction-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/submit.html',
  '/style.css',
  '/index.js',
  '/manifest.json',
  '/sw.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE).catch((err) => {
          console.warn('[ServiceWorker] Some assets could not be cached:', err);
          // Don't fail the install if some assets fail
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external API requests (let them fail naturally for better UX feedback)
  if (request.url.includes('docs.google.com') || request.url.includes('img.youtube.com')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Offline fallback for HTML pages
            if (request.headers.get('accept')?.includes('text/html')) {
              return new Response(
                '<html><body style="font-family: sans-serif; padding: 20px; text-align: center;">' +
                '<h1>Offline</h1>' +
                '<p>You are currently offline. Please check your connection.</p>' +
                '</body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            }

            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
