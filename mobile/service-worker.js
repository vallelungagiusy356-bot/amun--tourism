const CACHE_NAME = "amuni-cache-v3";
const OFFLINE_URL = "./index.html";

// File da pre‑cache
const PRECACHE = [
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
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Attivazione SW
self.addEventListener("activate", event => {
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

// Strategia: stale‑while‑revalidate + fallback offline
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          // Cache dinamica
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached || caches.match(OFFLINE_URL));

      return cached || networkFetch;
    })
  );
});
