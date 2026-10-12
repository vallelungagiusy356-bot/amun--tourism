// Amunì Tourism · service worker del tour offline
// Salva sul dispositivo la pagina, le foto dei quadri e il visore, così il tour
// funziona anche senza rete. Per aggiornare i file basta cambiare VERSIONE.
const VERSIONE = 'v1';
const CACHE = 'amuni-tour-offline-' + VERSIONE;
const FILE = [
  "tour_offline.html",
  "img/sanfilippo_animesante.jpg",
  "img/thumbs/sanfilippo_animesante.jpg",
  "../gallery-chiese/sanfilippo_animesante.jpg",
  "../gallery-chiese/thumbs/sanfilippo_animesante.jpg",
  "/gallery-chiese/sanfilippo_animesante.jpg",
  "/gallery-chiese/thumbs/sanfilippo_animesante.jpg",
  "/mobile/img/sanfilippo_animesante.jpg",
  "/mobile/img/thumbs/sanfilippo_animesante.jpg",
  "gallery-chiese/sanfilippo_animesante.jpg",
  "gallery-chiese/thumbs/sanfilippo_animesante.jpg",
  "../img/sanfilippo_animesante.jpg",
  "../img/thumbs/sanfilippo_animesante.jpg",
  "../../gallery-chiese/sanfilippo_animesante.jpg",
  "../../gallery-chiese/thumbs/sanfilippo_animesante.jpg",
  "img/vergine_imm_animesante.jpg",
  "img/thumbs/vergine_imm_animesante.jpg",
  "../gallery-chiese/vergine_imm_animesante.jpg",
  "../gallery-chiese/thumbs/vergine_imm_animesante.jpg",
  "/gallery-chiese/vergine_imm_animesante.jpg",
  "/gallery-chiese/thumbs/vergine_imm_animesante.jpg",
  "/mobile/img/vergine_imm_animesante.jpg",
  "/mobile/img/thumbs/vergine_imm_animesante.jpg",
  "gallery-chiese/vergine_imm_animesante.jpg",
  "gallery-chiese/thumbs/vergine_imm_animesante.jpg",
  "../img/vergine_imm_animesante.jpg",
  "../img/thumbs/vergine_imm_animesante.jpg",
  "../../gallery-chiese/vergine_imm_animesante.jpg",
  "../../gallery-chiese/thumbs/vergine_imm_animesante.jpg",
  "img/adorazione_animesante.jpg",
  "img/thumbs/adorazione_animesante.jpg",
  "../gallery-chiese/adorazione_animesante.jpg",
  "../gallery-chiese/thumbs/adorazione_animesante.jpg",
  "/gallery-chiese/adorazione_animesante.jpg",
  "/gallery-chiese/thumbs/adorazione_animesante.jpg",
  "/mobile/img/adorazione_animesante.jpg",
  "/mobile/img/thumbs/adorazione_animesante.jpg",
  "gallery-chiese/adorazione_animesante.jpg",
  "gallery-chiese/thumbs/adorazione_animesante.jpg",
  "../img/adorazione_animesante.jpg",
  "../img/thumbs/adorazione_animesante.jpg",
  "../../gallery-chiese/adorazione_animesante.jpg",
  "../../gallery-chiese/thumbs/adorazione_animesante.jpg",
  "img/messa_di_suffraggio_animesante.jpg",
  "img/thumbs/messa_di_suffraggio_animesante.jpg",
  "../gallery-chiese/messa_di_suffraggio_animesante.jpg",
  "../gallery-chiese/thumbs/messa_di_suffraggio_animesante.jpg",
  "/gallery-chiese/messa_di_suffraggio_animesante.jpg",
  "/gallery-chiese/thumbs/messa_di_suffraggio_animesante.jpg",
  "/mobile/img/messa_di_suffraggio_animesante.jpg",
  "/mobile/img/thumbs/messa_di_suffraggio_animesante.jpg",
  "gallery-chiese/messa_di_suffraggio_animesante.jpg",
  "gallery-chiese/thumbs/messa_di_suffraggio_animesante.jpg",
  "../img/messa_di_suffraggio_animesante.jpg",
  "../img/thumbs/messa_di_suffraggio_animesante.jpg",
  "../../gallery-chiese/messa_di_suffraggio_animesante.jpg",
  "../../gallery-chiese/thumbs/messa_di_suffraggio_animesante.jpg",
  "img/madonna_del_carmelo_animesante.jpg",
  "img/thumbs/madonna_del_carmelo_animesante.jpg",
  "../gallery-chiese/madonna_del_carmelo_animesante.jpg",
  "../gallery-chiese/thumbs/madonna_del_carmelo_animesante.jpg",
  "/gallery-chiese/madonna_del_carmelo_animesante.jpg",
  "/gallery-chiese/thumbs/madonna_del_carmelo_animesante.jpg",
  "/mobile/img/madonna_del_carmelo_animesante.jpg",
  "/mobile/img/thumbs/madonna_del_carmelo_animesante.jpg",
  "gallery-chiese/madonna_del_carmelo_animesante.jpg",
  "gallery-chiese/thumbs/madonna_del_carmelo_animesante.jpg",
  "../img/madonna_del_carmelo_animesante.jpg",
  "../img/thumbs/madonna_del_carmelo_animesante.jpg",
  "../../gallery-chiese/madonna_del_carmelo_animesante.jpg",
  "../../gallery-chiese/thumbs/madonna_del_carmelo_animesante.jpg",
  "img/adorazione_eucaristica_animesante.jpg",
  "img/thumbs/adorazione_eucaristica_animesante.jpg",
  "../gallery-chiese/adorazione_eucaristica_animesante.jpg",
  "../gallery-chiese/thumbs/adorazione_eucaristica_animesante.jpg",
  "/gallery-chiese/adorazione_eucaristica_animesante.jpg",
  "/gallery-chiese/thumbs/adorazione_eucaristica_animesante.jpg",
  "/mobile/img/adorazione_eucaristica_animesante.jpg",
  "/mobile/img/thumbs/adorazione_eucaristica_animesante.jpg",
  "gallery-chiese/adorazione_eucaristica_animesante.jpg",
  "gallery-chiese/thumbs/adorazione_eucaristica_animesante.jpg",
  "../img/adorazione_eucaristica_animesante.jpg",
  "../img/thumbs/adorazione_eucaristica_animesante.jpg",
  "../../gallery-chiese/adorazione_eucaristica_animesante.jpg",
  "../../gallery-chiese/thumbs/adorazione_eucaristica_animesante.jpg",
  "openseadragon.min.js"
];
const CDN = "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js";

self.addEventListener('install', function (e) {
  e.waitUntil((async function () {
    const c = await caches.open(CACHE);
    // un file mancante (per esempio una miniatura) non blocca l'installazione
    await Promise.all(FILE.map(async function (u) {
      try { const r = await fetch(u, { cache: 'reload' }); if (r && r.ok) await c.put(u, r); } catch (_) {}
    }));
    try { const r = await fetch(CDN, { mode: 'no-cors' }); await c.put(CDN, r); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const nomi = await caches.keys();
    await Promise.all(nomi.filter(function (n) { return n.indexOf('amuni-tour-offline-') === 0 && n !== CACHE; })
      .map(function (n) { return caches.delete(n); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isPagina = req.mode === 'navigate' && url.pathname.endsWith('/tour_offline.html');

  if (isPagina) {
    // pagina: prima la rete (per ricevere gli aggiornamenti), se non c'è campo quella salvata
    e.respondWith((async function () {
      const c = await caches.open(CACHE);
      try {
        const r = await Promise.race([
          fetch(req),
          new Promise(function (_, no) { setTimeout(function () { no(new Error('lenta')); }, 2500); })
        ]);
        if (r && r.ok) { c.put('tour_offline.html', r.clone()); return r; }
      } catch (_) {}
      return (await c.match('tour_offline.html', { ignoreSearch: true })) || fetch(req);
    })());
    return;
  }

  // foto, visore: prima quelli salvati, poi la rete
  e.respondWith((async function () {
    const hit = await caches.match(req, { ignoreSearch: true });
    return hit || fetch(req);
  })());
});
