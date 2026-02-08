// Custom Service Worker for Healthy Coffee PWA
// Simplified version without external dependencies for compatibility

/* global clients */

// Inject manifest placeholder for Workbox
self.__WB_MANIFEST

// Version for cache invalidation - increment this on each deployment
const CACHE_VERSION = 'v2';
const BUILD_TIMESTAMP = new Date().toISOString();

// Cache names with version for automatic invalidation
const STATIC_CACHE = `static-assets-cache-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-cache-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;

console.log(`[SW] Service Worker starting - Version: ${CACHE_VERSION}, Build: ${BUILD_TIMESTAMP}`);


// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Essential images to cache
const ESSENTIAL_IMAGES = [
  '/src/assets/logo-black.png',
  '/src/assets/logo-white.png',
  '/src/assets/logo1.jpg',
  '/src/assets/coffee.webp',
  '/src/assets/healthy.png'
];

// Install event - cache essential resources for offline functionality
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing - Version: ${CACHE_VERSION}`);
  
  // Skip waiting to activate immediately
  self.skipWaiting();

  event.waitUntil(
    Promise.all([
      // Cache essential images
      caches.open(IMAGES_CACHE).then((cache) => {

        const imageUrls = [
          '/src/assets/author.jpg',
          '/src/assets/coffee.webp',
          '/src/assets/day.png',
          '/src/assets/healthy.png',
          '/src/assets/image1.jpg',
          '/src/assets/image2.jpg',
          '/src/assets/image3.jpg',
          '/src/assets/image4.jpg',
          '/src/assets/image5.jpg',
          '/src/assets/image6.jpg',
          '/src/assets/image7.jpg',
          '/src/assets/image8.jpg',
          '/src/assets/logo-black.png',
          '/src/assets/logo-white.png',
          '/src/assets/logo1.jpg',
          '/src/assets/night.png',
          '/src/assets/search-b.png',
          '/src/assets/search-w.png',
          // Add any additional images from the assets folder
          '/src/assets/IMG-20250825-WA0181.jpg',
          '/src/assets/IMG-20250825-WA0183.jpg',
          '/src/assets/IMG-20250825-WA0185.jpg',
          '/src/assets/IMG-20250825-WA0186.jpg',
          '/src/assets/IMG-20250825-WA0190.jpg',
          '/src/assets/IMG-20250825-WA0191.jpg',
          '/src/assets/IMG-20250825-WA0195.jpg'
        ];

        console.log('Caching essential images...');
        return cache.addAll(imageUrls).catch((error) => {
          console.warn('Some images failed to cache during install:', error);
          // Continue even if some images fail to cache
          return Promise.resolve();
        });
      }),

      // Cache the main HTML page and essential static assets
      caches.open(PAGES_CACHE).then((cache) => {

        const essentialUrls = [
          '/',
          '/index.html',
          '/manifest.json',
          '/pwa-192x192.png',
          '/pwa-512x512.png'
        ];

        console.log('Caching essential pages and assets...');
        return cache.addAll(essentialUrls).catch((error) => {
          console.warn('Some essential resources failed to cache during install:', error);
          // Continue even if some resources fail to cache
          return Promise.resolve();
        });
      })
    ])
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating - Version: ${CACHE_VERSION}`);

  event.waitUntil(
    Promise.all([
      // Clean up ALL old caches that don't match current version
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that doesn't include current version
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately without waiting
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete - controlling all clients');
      // Notify all clients that update is complete
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UPDATE_COMPLETE',
            version: CACHE_VERSION,
            timestamp: BUILD_TIMESTAMP
          });
        });
      });
    })
  );
});


// Fetch event - provide offline functionality
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests to backend
  if (event.request.url.includes('healthycoffee.onrender.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses for offline use
          if (response.ok && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache for GET requests
          if (event.request.method === 'GET') {
            return caches.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              } else {
                // Return offline response for health endpoint
                if (event.request.url.includes('/health')) {
                  return new Response(JSON.stringify({
                    status: 'offline',
                    message: 'Backend is currently offline. Please check your connection.',
                    cached: true,
                    timestamp: Date.now()
                  }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
                // For other API requests, return offline error
                return new Response(JSON.stringify({
                  error: 'Service temporarily unavailable. Please try again when online.',
                  offline: true
                }), {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            });
          }
          // For non-GET requests when offline, return error
          return new Response(JSON.stringify({
            error: 'Cannot perform this action while offline.',
            offline: true
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match('/').then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy for static assets
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
    return;
  }

  // Default: try network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Message event - handle custom messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested by client');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_IMAGE') {
    // Cache a specific image
    event.waitUntil(
      caches.open(IMAGES_CACHE).then((cache) => {
        return cache.add(event.data.url);
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    // Respond with current version info
    event.source.postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION,
      timestamp: BUILD_TIMESTAMP
    });
  }
});


// Background sync for offline functionality (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic if needed
  console.log('Background sync triggered');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
