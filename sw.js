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

// Fetch: cache-ből szolgálja ki, vagy hálózatról
self.addEventListener('fetch', event => {
  // Csak GET kéréseket cache-elünk
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response =>
      response ||
      fetch(event.request).then(fetchRes => {
        // Dinamikus cache: csak az alap fájlokat cache-eljük
        return fetchRes;
      }).catch(() => {
        // Itt adhatsz vissza offline oldalt, ha szeretnél
        return caches.match('/index.html');
      })
    )
  );
});
