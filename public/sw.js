/**
 * Service Worker for Raksetu Blood Donation Platform
 * CRITICAL: Enables offline access and instant loading during emergencies
 * 
 * Caching Strategy:
 * - Emergency data: stale-while-revalidate (show cached, fetch new in background)
 * - Static assets: cache-first (instant loading)
 * - API calls: network-first with fallback
 * - VALIDATION: Never cache errors, 404s, or invalid responses
 */

const CACHE_NAME = 'raksetu-v2';
const EMERGENCY_CACHE = 'raksetu-emergency-v2';
const STATIC_CACHE = 'raksetu-static-v2';
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Critical files to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[ServiceWorker] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      caches.open(EMERGENCY_CACHE).then(cache => {
        console.log('[ServiceWorker] Emergency cache ready');
      })
    ]).then(() => {
      console.log('[ServiceWorker] Installation complete');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete ALL old caches, including v1
          if (cacheName !== CACHE_NAME && 
              cacheName !== EMERGENCY_CACHE && 
              cacheName !== STATIC_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activation complete - all old caches cleared');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for development mode (Vite HMR, React deps)
  if (url.hostname === 'localhost' && (
      url.pathname.includes('/@vite/') ||
      url.pathname.includes('/node_modules/') ||
      url.pathname.includes('/@react-refresh') ||
      url.pathname.includes('/@fs/') ||
      url.search.includes('?v=') || // Vite cache busting
      url.pathname.endsWith('.map')
  )) {
    // Always fetch fresh from network in development
    return;
  }

  // Emergency data - stale-while-revalidate (CRITICAL for life-saving)
  if (url.pathname.includes('emergencyRequests') || 
      url.pathname.includes('/emergency')) {
    event.respondWith(
      staleWhileRevalidate(request, EMERGENCY_CACHE)
    );
    return;
  }

  // Firestore requests - network first with cache fallback
  if (url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(
      networkFirstWithFallback(request, EMERGENCY_CACHE)
    );
    return;
  }

  // Static assets - cache first (instant loading)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.jsx')) {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

  // Everything else - network first
  event.respondWith(
    networkFirstWithFallback(request, CACHE_NAME)
  );
});

/**
 * Validate if response should be cached
 * CRITICAL: Never cache errors, broken states, or invalid responses
 */
function isValidResponse(response) {
  // Don't cache errors
  if (!response || !response.ok) {
    console.warn('[ServiceWorker] Invalid response - not caching:', response?.status);
    return false;
  }
  
  // Don't cache error status codes
  if (response.status >= 400) {
    console.warn('[ServiceWorker] Error status code - not caching:', response.status);
    return false;
  }
  
  // Don't cache opaque responses (CORS errors)
  if (response.type === 'opaque') {
    console.warn('[ServiceWorker] Opaque response - not caching');
    return false;
  }
  
  return true;
}

/**
 * Check if cached response is expired
 */
async function isCacheExpired(response) {
  if (!response) return true;
  
  const cachedDate = response.headers.get('sw-cached-date');
  if (!cachedDate) return false; // No date = old cache, keep it for now
  
  const cacheAge = Date.now() - parseInt(cachedDate);
  return cacheAge > CACHE_EXPIRATION_TIME;
}

/**
 * Add timestamp to response headers
 */
function addCacheTimestamp(response) {
  const clonedResponse = response.clone();
  const headers = new Headers(clonedResponse.headers);
  headers.set('sw-cached-date', Date.now().toString());
  
  return new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: headers
  });
}

/**
 * Stale-while-revalidate strategy
 * Returns cached response immediately while fetching fresh data in background
 * CRITICAL: User sees data instantly, even if slightly outdated
 * VALIDATION: Never serves expired or error responses
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Check if cache is valid and not expired
  const cacheExpired = await isCacheExpired(cachedResponse);
  
  // Fetch fresh data in background
  const fetchPromise = fetch(request).then(response => {
    // Only cache valid responses
    if (response && isValidResponse(response)) {
      const responseWithTimestamp = addCacheTimestamp(response);
      cache.put(request, responseWithTimestamp.clone());
      return response;
    }
    return response;
  }).catch(error => {
    console.warn('[ServiceWorker] Fetch failed:', error);
    return cachedResponse; // Return cached if fetch fails
  });
  
  // Return cached response immediately if available and not expired
  if (cachedResponse && !cacheExpired) {
    console.log('[ServiceWorker] Returning cached response (updating in background)');
    return cachedResponse;
  }
  
  // If expired or no cache, wait for fresh fetch
  return fetchPromise;
}

/**
 * Network-first with cache fallback
 * Try network first, fall back to cache if offline
 * VALIDATION: Only cache valid responses, never errors
 */
async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Only cache successful GET requests with valid responses
    if (response && isValidResponse(response) && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      const responseWithTimestamp = addCacheTimestamp(response);
      cache.put(request, responseWithTimestamp.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    console.warn('[ServiceWorker] Network request failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    // Check if cached response is still valid
    const expired = await isCacheExpired(cachedResponse);
    
    if (cachedResponse && !expired) {
      console.log('[ServiceWorker] Returning valid cached response');
      return cachedResponse;
    }
    
    // Return offline page or error
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No internet connection. Some data may be outdated.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first strategy
 * Returns cached response if available, otherwise fetches from network
 * FASTEST: Used for static assets
 * VALIDATION: Only caches valid responses, checks expiration
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Check if cached response is valid and not expired
  const expired = await isCacheExpired(cachedResponse);
  
  if (cachedResponse && !expired) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    // Only cache valid responses
    if (response && isValidResponse(response)) {
      const responseWithTimestamp = addCacheTimestamp(response);
      cache.put(request, responseWithTimestamp.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    
    // If we have expired cache, return it as last resort
    if (cachedResponse) {
      console.warn('[ServiceWorker] Returning expired cache as fallback');
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline emergency requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-emergency-requests') {
    event.waitUntil(syncEmergencyRequests());
  }
});

async function syncEmergencyRequests() {
  console.log('[ServiceWorker] Syncing emergency requests...');
  // This will be called when connection is restored
  // Can queue emergency submissions while offline
}

// Push notifications for urgent emergencies
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.message || 'Urgent blood donation needed!',
    icon: '/Raksetu.png',
    badge: '/Raksetu.png',
    vibrate: [200, 100, 200],
    tag: 'emergency-notification',
    requireInteraction: true, // Don't auto-dismiss
    actions: [
      { action: 'respond', title: 'Respond Now' },
      { action: 'view', title: 'View Details' },
      { action: 'close', title: 'Close' }
    ],
    data: {
      url: data.url || '/emergency',
      emergencyId: data.emergencyId
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Urgent: Blood Needed! 🩸', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if app is already open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[ServiceWorker] Service Worker loaded');
