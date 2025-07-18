const CACHE_NAME = 'vill-math-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/sw-reg.js',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Telepítés: cache-eli az alap fájlokat
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Aktiválás: törli a régi cache-t, ha van
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-ből szolgálja ki, vagy hálózatról, dinamikus cache ikonokhoz
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        // Dinamikus cache ikonokhoz és más erőforrásokhoz
        if (event.request.url.includes('/icon-') || FILES_TO_CACHE.includes(event.request.url)) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback: index.html vagy alap ikon
        if (event.request.url.includes('/icon-')) {
          return caches.match('/icon-192.png'); // Alapértelmezett ikon offline-ban
        }
        return caches.match('/index.html');
      });
    })
  );
});