const SW_VERSION = 'amiverse-sw-v01';

console.log('[sw] loaded:', SW_VERSION);

importScripts('/push-sw.js');

self.addEventListener('install', (event) => {
  console.log('[sw] install:', SW_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[sw] activate:', SW_VERSION);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      const oldPwaCacheNames = cacheNames.filter((cacheName) => {
        return (
          cacheName.startsWith('workbox-') ||
          cacheName.includes('workbox') ||
          cacheName.includes('precache') ||
          cacheName.includes('next-pwa')
        );
      });

      await Promise.all(
        oldPwaCacheNames.map((cacheName) => {
          console.log('[sw] delete old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );

      await self.clients.claim();
    })()
  );
});

// ページ側から postMessage({ type: 'SKIP_WAITING' }) を送った時に即時切り替える。
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
