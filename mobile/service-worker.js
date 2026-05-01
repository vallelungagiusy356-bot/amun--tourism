const CACHE_NAME = "amuni-cache-v1";
const urlsToCache = [
  "/amun--tourism/mobile/",
  "/amun--tourism/mobile/index.html",
  "/amun--tourism/mobile/style.css",
  "/amun--tourism/mobile/img/castello.jpg"
];

// Installazione SW
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Attivazione SW
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
