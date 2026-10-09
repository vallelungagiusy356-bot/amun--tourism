// Cambiando questo numero, i telefoni cancellano tutte le copie vecchie salvate
const CACHE_NAME = "amuni-cache-v4";
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

// Attivazione SW: cancella le copie delle versioni precedenti
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

// Salva una copia solo se la risposta è andata a buon fine (mai errori 404 o file parziali)
function salvaSeValida(request, response) {
  if (response && response.status === 200 && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Altri siti (il server della chat, i pagamenti, i font...): non li tocchiamo
  if (url.origin !== self.location.origin) return;

  // 2) Audio e video (voce della Castellana, musica): vanno diretti dalla rete,
  //    così telefoni e Safari possono leggerli a pezzi senza problemi
  if (
    request.destination === "audio" ||
    request.headers.has("range") ||
    url.pathname.indexOf("/voce-castellana/") !== -1 ||
    /\.(mp3|m4a|wav|ogg)$/i.test(url.pathname)
  ) {
    return;
  }

  // 3) Pagine e codice (html, js, css, json): prima la rete, così gli aggiornamenti
  //    si vedono subito; se non c'è connessione, si usa la copia salvata
  const eCodice =
    request.mode === "navigate" ||
    request.destination === "document" ||
    /\.(html|js|css|json)$/i.test(url.pathname);

  if (eCodice) {
    event.respondWith(
      fetch(request)
        .then(response => salvaSeValida(request, response))
        .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // 4) Immagini e il resto: copia salvata subito e aggiornamento in secondo piano
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => salvaSeValida(request, response))
        .catch(() => cached || caches.match(OFFLINE_URL));
      return cached || networkFetch;
    })
  );
});
