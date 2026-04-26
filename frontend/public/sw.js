const CACHE_NAME = 'seeblick-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// Installations-Event: Assets cachen
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installiert');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Assets werden gecacht');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('❌ Caching fehlgeschlagen:', err);
      })
  );
  
  self.skipWaiting();
});

// Aktivierungs-Event: Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker aktiviert');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('🗑️ Alter Cache gelöscht:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch-Event: Cache-First Strategie
self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen cachen
  if (event.request.method !== 'GET') {
    return;
  }
  
  // API-Anfragen nicht cachen
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // WebSocket-Anfragen nicht cachen
  if (event.request.url.includes('socket.io')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-Treffer: zurückgeben
        if (response) {
          console.log('📦 Aus Cache:', event.request.url);
          return response;
        }
        
        // Netzwerk-Anfrage
        return fetch(event.request)
          .then((networkResponse) => {
            // Gültige Antwort cachen
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('💾 In Cache:', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((err) => {
            console.error('❌ Netzwerk-Fehler:', err);
            // Offline-Fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            throw err;
          });
      })
  );
});

// Push-Notification-Event
self.addEventListener('push', (event) => {
  console.log('🔔 Push-Notification empfangen:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'seeblick-notification',
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification('Dä Seeblick', options)
  );
});

// Notification-Klick-Event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification geklickt:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
