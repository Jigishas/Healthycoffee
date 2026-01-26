// Custom Service Worker for Healthy Coffee PWA
// Simplified version without external dependencies for compatibility

// Cache names
const STATIC_CACHE = 'static-assets-cache-v1';
const IMAGES_CACHE = 'images-cache-v1';
const PAGES_CACHE = 'pages-cache-v1';
const API_CACHE = 'api-cache-v1';

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
  console.log('Service Worker installing.');

  event.waitUntil(
    Promise.all([
      // Cache essential images
      caches.open('images-cache-v1').then((cache) => {
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
      caches.open('pages-cache').then((cache) => {
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

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!['images-cache-v1', 'pages-cache', 'static-assets-cache', 'images-cache', 'api-cache'].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - provide offline functionality
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
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
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_IMAGE') {
    // Cache a specific image
    event.waitUntil(
      caches.open('images-cache').then((cache) => {
        return cache.add(event.data.url);
      })
    );
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
