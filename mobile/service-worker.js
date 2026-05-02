const CACHE_NAME = "amuni-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/splash-1080x1920.png",
  "./img/castellana_alpha.webm",
  "./img/castello_clean.png"
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
