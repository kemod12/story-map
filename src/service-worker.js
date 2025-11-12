// Service Worker for Push Notifications and Caching

const CACHE_VERSION = 'v1';
const CACHE_NAME = `story-app-${CACHE_VERSION}`;

// Cache strategies
const CACHE_FIRST_ASSETS = [
  '/index.html',
  '/favicon.png',
];

const STALE_WHILE_REVALIDATE_URLS = [
  'https://story-api.dicoding.dev/v1/stories',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(CACHE_FIRST_ASSETS).catch((err) => {
        console.warn('[Service Worker] Error caching assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Stale-while-revalidate for API calls
  if (STALE_WHILE_REVALIDATE_URLS.some((apiUrl) => url.href.startsWith(apiUrl))) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      }).catch(() => fetch(request))
    );
    return;
  }

  // Cache-first for static assets
  if (CACHE_FIRST_ASSETS.some((asset) => url.href.includes(asset))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch(() => {
        // Return offline fallback
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Network first for other requests
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let notificationData = {
    title: 'Story Map',
    body: 'A new story has been shared!',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'story-notification',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'Story Map',
        body: data.body || 'A new story has been shared!',
        icon: data.icon || '/favicon.png',
        badge: data.badge || '/favicon.png',
        tag: data.tag || 'story-notification',
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
      };
    } catch (err) {
      console.log('[Service Worker] Push data is not JSON:', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  const data = event.notification.data;
  let urlToOpen = '/';

  // Handle action button clicks
  if (event.action) {
    console.log('[Service Worker] Action clicked:', event.action);
    if (event.action === 'view-story' && data.storyId) {
      urlToOpen = `/#/story/${data.storyId}`;
    } else if (event.action === 'view-all') {
      urlToOpen = '/#/';
    }
  } else if (data.storyId) {
    // Default notification click
    urlToOpen = `/#/story/${data.storyId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if any client is already open
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed');
});
