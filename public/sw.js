const CACHE_NAME = 'sci-checklist-v2';
const RUNTIME_CACHE = 'sci-runtime-v2';

const STATIC_ASSETS = [
  '/checklist-mobile/login',
  '/checklist-mobile',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

const API_CACHE_ROUTES = [
  '/rest/v1/checklist_templates',
  '/rest/v1/viaturas',
  '/rest/v1/bombeiros'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Network first with timeout for API calls
async function networkFirstWithTimeout(request, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Cache first for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline - recurso não disponível', { status: 503 });
  }
}

// Fetch event - routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API routes - Network First with timeout
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
    event.respondWith(networkFirstWithTimeout(request));
    return;
  }

  // Static assets and pages - Cache First
  if (
    url.pathname.startsWith('/checklist-mobile') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.png') ||
    url.pathname.includes('.svg') ||
    url.pathname.includes('.woff')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstWithTimeout(request));
});

// Background sync for offline checklists
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checklists') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_CHECKLISTS',
            message: 'Sincronizando checklists pendentes...'
          });
        });
      })
    );
  }
});

// Message handler for manual sync trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
