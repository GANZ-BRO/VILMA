// Service worker regisztrálása (OFFLINE módhoz)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker regisztrálva:', reg.scope))
      .catch(err => console.error('Service Worker hiba:', err));
  });
}
