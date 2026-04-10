const CACHE_NAME = 'mg-clean-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/mg-style.css',
  '/main.js',
  '/config.js',
  '/assets/app-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
