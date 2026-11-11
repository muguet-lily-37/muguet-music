const CACHE_NAME = 'muguet-music-shell-v64';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./muguet-icon-original.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('muguet-music-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Cache only the app shell. Audio and YouTube are intentionally not cached.
  if (request.mode === 'navigate' || APP_SHELL.some(path => new URL(path, self.registration.scope).href === request.url)) {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) { const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)); }
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html'))));
  }
});
