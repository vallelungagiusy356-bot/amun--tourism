/* ============================================================
   TOUR VISIVO — Amunì Tourism
   La Castellana racconta un'opera e il quadro si sposta e si
   ingrandisce da solo sul dettaglio di cui sta parlando.

   PROVA: solo la Sacra Famiglia (Convento dei Cappuccini), solo italiano.
   Non modifica la chat, il backend né la knowledge base: si "aggancia"
   alla voce già esistente e riconosce l'opera dalla prima frase.

   Per aggiungere un'altra opera: copia un blocco dentro TOURS.
   ============================================================ */
(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. I DATI — qui si cambia tutto quello che riguarda le opere
  //
  // Ogni "cue" dice: quando la Castellana pronuncia una frase che
  // contiene la parola/espressione "parola", il quadro va su quel punto.
  //   x, y  = centro del dettaglio (0 = bordo sinistro/alto,
  //           1 = bordo destro/basso, 0.5 = metà)
  //   larg  = quanta larghezza del quadro vuoi vedere
  //           (1 = tutto, 0.5 = metà quadro, 0.3 = zoom forte)
  //   tutto = true -> torna a vedere il quadro intero
  //
  // Numeri calcolati guardando la foto: si possono affinare con ?zoomdebug=1.
  // ------------------------------------------------------------
  const TOURS = [
    {
      nome: 'Sacra Famiglia',
      // frase che identifica l'opera (minuscolo)
      riconosci: 'pala della cappella laterale sinistra',
      immagine: '../gallery-chiese/sacra_famiglia_cappuccini.jpg',
      cue: [
        { parola: 'pala della cappella',   x: 0.52, y: 0.47, larg: 0.90 },
        { parola: 'azzurro del manto',      x: 0.45, y: 0.60, larg: 0.45 },
        { parola: "mani di sant'anna",      x: 0.62, y: 0.65, larg: 0.40 },
        { parola: 'bastone fiorito',        x: 0.24, y: 0.32, larg: 0.35 },
        { parola: 'vecchio seduto',         x: 0.20, y: 0.64, larg: 0.38 },
        { parola: 'bambino riccioluto',     x: 0.33, y: 0.64, larg: 0.36 },
        { parola: 'guardate i volti',       x: 0.52, y: 0.47, larg: 0.50 },
        { parola: 'giuseppe testa',         x: 0.52, y: 0.47, larg: 0.90 },
        { parola: 'vi va di vedere',        x: 0.52, y: 0.47, larg: 0.90 }
      ]
    }
  ];

  const DEBUG = new URLSearchParams(location.search).has('zoomdebug');
  const OSD_URL = 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js';
  const MS_PER_CARATTERE = 70; // velocità media della voce, per i cue a metà frase

  // ------------------------------------------------------------
  // 2. STILE E CONTENITORE DEL QUADRO (creati da qui, niente da
  //    aggiungere alla pagina)
  // ------------------------------------------------------------
  const stile = document.createElement('style');
  stile.textContent = `
    #tour-viewer { display:none; position:fixed; top:0; left:0; right:0; height:58vh;
      background:#0f1922; z-index:999990; border-bottom:1px solid #B8873B; }
    body.tour-attivo #tour-viewer { display:block; }
    body.tour-attivo .chat-mobile { height:42vh !important; }
    #tour-viewer-img { width:100%; height:100%; }
    #tour-viewer-close { position:absolute; z-index:5; right:10px;
      top:calc(env(safe-area-inset-top, 0px) + 10px);
      width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
      background:rgba(15,25,34,0.75); color:#F3ECDC; font-size:1rem; }
    #tour-debug { position:absolute; z-index:5; left:8px; bottom:8px; padding:5px 9px;
      border-radius:6px; background:rgba(0,0,0,0.75); color:#D4AF6A;
      font:600 0.8rem monospace; display:none; }
  `;
  document.head.appendChild(stile);

  const box = document.createElement('div');
  box.id = 'tour-viewer';
  box.innerHTML =
    '<div id="tour-viewer-img"></div>' +
    '<button id="tour-viewer-close" aria-label="Chiudi il quadro">✕</button>' +
    '<div id="tour-debug"></div>';
  document.body.appendChild(box);

  const boxImg = box.querySelector('#tour-viewer-img');
  const boxDebug = box.querySelector('#tour-debug');
  if (DEBUG) boxDebug.style.display = 'block';

  // ------------------------------------------------------------
  // 3. CARICAMENTO DI OPENSEADRAGON (solo quando serve)
  // ------------------------------------------------------------
  let osdPromise = null;
  function caricaOSD() {
    if (window.OpenSeadragon) return Promise.resolve();
    if (!osdPromise) {
      osdPromise = new Promise(function (ok, ko) {
        const s = document.createElement('script');
        s.src = OSD_URL;
        s.onload = ok;
        s.onerror = function () { osdPromise = null; ko(new Error('OpenSeadragon non caricato')); };
        document.head.appendChild(s);
      });
    }
    return osdPromise;
  }

  // ------------------------------------------------------------
  // 4. APRIRE / CHIUDERE IL QUADRO E SPOSTARE L'INQUADRATURA
  // ------------------------------------------------------------
  let viewer = null;
  let tourAttivo = null;
  let cuePendente = null;
  let timers = [];

  function fermaTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function chiudiTour() {
    fermaTimers();
    tourAttivo = null;
    cuePendente = null;
    document.body.classList.remove('tour-attivo');
    if (viewer) { try { viewer.destroy(); } catch (e) {} viewer = null; }
  }

  function aspetto() {
    const s = viewer.world.getItemAt(0).getContentSize();
    return s.y / s.x;
  }

  function mostraDebug() {
    if (!DEBUG || !viewer || !viewer.world.getItemCount()) return;
    const c = viewer.viewport.getCenter(true);
    const txt = 'x: ' + c.x.toFixed(2) + ', y: ' + (c.y / aspetto()).toFixed(2) +
                ', larg: ' + (1 / viewer.viewport.getZoom(true)).toFixed(2);
    boxDebug.textContent = txt;
    console.log('[tour] ' + txt);
  }

  function applicaCue(c) {
    if (!viewer || !viewer.world.getItemCount()) { cuePendente = c; return; }
    const vp = viewer.viewport;
    if (c.tutto) { vp.goHome(); return; }
    vp.panTo(new OpenSeadragon.Point(c.x, c.y * aspetto()));
    vp.zoomTo(1 / c.larg);
  }

  async function apriTour(tour) {
    chiudiTour();
    tourAttivo = tour;
    document.body.classList.add('tour-attivo');
    try {
      await caricaOSD();
    } catch (e) {
      console.error(e);
      chiudiTour();
      return;
    }
    if (tourAttivo !== tour) return; // nel frattempo è stato chiuso

    viewer = OpenSeadragon({
      element: boxImg,
      prefixUrl: '',
      tileSources: { type: 'image', url: tour.immagine },
      showNavigationControl: false,
      animationTime: 1.6,
      minZoomImageRatio: 0.9,
      maxZoomPixelRatio: 3,
      visibilityRatio: 0.6,
      gestureSettingsTouch: { clickToZoom: false, flickEnabled: false },
      gestureSettingsMouse: { clickToZoom: false }
    });
    viewer.addHandler('open', function () {
      if (cuePendente) { const c = cuePendente; cuePendente = null; applicaCue(c); }
      mostraDebug();
    });
    viewer.addHandler('open-failed', function () { console.error('Immagine non trovata:', tour.immagine); chiudiTour(); });
    viewer.addHandler('animation-finish', mostraDebug);
  }

  box.querySelector('#tour-viewer-close').addEventListener('click', chiudiTour);

  // ------------------------------------------------------------
  // 5. AGGANCIO ALLA VOCE: ogni volta che la Castellana inizia a
  //    leggere una frase, controlliamo se contiene un "cue".
  // ------------------------------------------------------------
  function trovaTour(testoMinuscolo) {
    return TOURS.find(function (t) { return testoMinuscolo.indexOf(t.riconosci) !== -1; }) || null;
  }

  function sulParlato(utt) {
    const testo = (utt.text || '').toLowerCase();
    fermaTimers();

    // se l'utente ha chiuso il quadro e riascolta, lo riapriamo alla prima frase
    const t = trovaTour(testo);
    if (t && tourAttivo !== t) apriTour(t);
    if (!tourAttivo) return;

    const rate = utt.rate || 1;
    tourAttivo.cue.forEach(function (c) {
      const i = testo.indexOf(c.parola);
      if (i === -1) return;
      const ritardo = i < 8 ? 0 : Math.round(i * MS_PER_CARATTERE / rate);
      if (ritardo === 0) applicaCue(c);
      else timers.push(setTimeout(function () { applicaCue(c); }, ritardo));
    });
  }

  if ('speechSynthesis' in window) {
    const speakOriginale = window.speechSynthesis.speak;
    window.speechSynthesis.speak = function (utt) {
      try { utt.addEventListener('start', function () { sulParlato(utt); }); } catch (e) {}
      return speakOriginale.call(window.speechSynthesis, utt);
    };
  }

  // ------------------------------------------------------------
  // 6. APRIRE IL QUADRO QUANDO ARRIVA LA RISPOSTA (anche a voce
  //    spenta) e chiuderlo quando si passa ad altro
  // ------------------------------------------------------------
  const messaggi = document.getElementById('chat-messages-mobile');
  if (messaggi) {
    new MutationObserver(function (mutazioni) {
      mutazioni.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (!n.classList || !n.classList.contains('message-mobile')) return;
          if (n.classList.contains('user-msg-mobile')) return;
          const t = trovaTour(n.textContent.toLowerCase());
          if (t) { if (tourAttivo !== t) apriTour(t); }
          else if (tourAttivo) chiudiTour();
        });
      });
    }).observe(messaggi, { childList: true });
  }

  const chiudiChat = document.getElementById('close-chat-mobile');
  if (chiudiChat) chiudiChat.addEventListener('click', chiudiTour);
})();
