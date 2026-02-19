// Service Worker - Self-unregistering to fix caching issues
// This will unregister itself and delete all caches

self.addEventListener('install', (event) => {
  // Skip waiting so this SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Delete ALL caches including old jsblind-v1
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Unregister this service worker
      return self.registration.unregister();
    }).then(() => {
      // Force all clients to reload with fresh content
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});

// Pass all fetch requests directly to network (no caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
