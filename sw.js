const CACHE_NAME = 'vilma-gyakorlas';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

// Service Worker telepítése
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Azonnal aktiválja az új Service Worker-t
  );
});

// Cache tisztítása aktiváláskor
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // Azonnal átveszi az oldal vezérlését
  );
});

// Network First stratégia
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Ha a hálózati kérés sikeres, mentsd a cache-be
        if (networkResponse) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
      })
      .catch(() => {
        // Ha a hálózati kérés sikertelen, használd a cache-t
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Ha nincs cache-elt tartalom, adj vissza egy hibaüzenetet
          return new Response('Offline tartalom nem elérhető.', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
