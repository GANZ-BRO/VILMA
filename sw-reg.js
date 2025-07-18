// Service worker regisztrálása (OFFLINE módhoz)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker regisztrálva:', reg.scope);
        // Ellenőrzés az ikonok betöltéséhez
        fetch('/icon-192.png').catch(err => console.warn('Ikon betöltési hiba:', err));
        fetch('/icon-512.png').catch(err => console.warn('Ikon betöltési hiba:', err));
      })
      .catch(err => console.error('Service Worker hiba:', err));
  });
}