/* ============================================================
   TOUR VISIVO — Amunì Tourism
   La Castellana racconta un'opera e il quadro si sposta e si
   ingrandisce da solo sul dettaglio di cui sta parlando.

   OPERE CON LO ZOOM GUIDATO: Sacra Famiglia (Cappuccini), Miracolo di Sant'Isidoro e Affreschi del Coro (Duomo).
   ALTRE OPERE E TAPPE DEL CASTELLO: il quadro si apre comunque in alto e si ingrandisce con le dita. Solo italiano.
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
    },
    {
      nome: "Il Miracolo di Sant'Isidoro (Stomer)",
      riconosci: 'contadino spagnolo',
      immagine: '../gallery-chiese/stomer_sangiorgio_zoom.jpg',
      immagineAlt: '../gallery-chiese/stomer_sangiorgio.jpg',   // se manca la foto _zoom, usa questa
      cue: [
        { parola: "miracolo di sant'isidoro", x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'delle tele più importanti', x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'contadino spagnolo',        x: 0.33, y: 0.60, larg: 0.55 },
        { parola: 'bastone',                   x: 0.27, y: 0.74, larg: 0.55 },
        { parola: "fonte d'acqua",            x: 0.24, y: 0.80, larg: 0.45 },
        { parola: 'compagni assetati',         x: 0.68, y: 0.58, larg: 0.60 },
        { parola: 'luce drammatica',           x: 0.50, y: 0.31, larg: 0.70 },
        { parola: 'mani callose',              x: 0.42, y: 0.49, larg: 0.40 },
        { parola: 'volti segnati',             x: 0.68, y: 0.49, larg: 0.50 },
        { parola: 'madonna col bambino',       x: 0.64, y: 0.22, larg: 0.50 },
        { parola: 'vi va di vedere',           x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Gli Affreschi del Coro',
      riconosci: 'nella volta del coro',
      immagine: '../gallery-chiese/affreschi_presbiterio_sangiorgio_zoom.jpg',
      immagineAlt: '../gallery-chiese/affreschi_presbiterio_sangiorgio.jpg',   // se manca la foto _zoom, usa questa
      cue: [
        { parola: 'nella volta del coro',      x: 0.50, y: 0.45, larg: 1.00 },
        { parola: 'immacolata',                x: 0.40, y: 0.40, larg: 0.50 },
        { parola: "sull'altra nuvola",         x: 0.77, y: 0.27, larg: 0.50 },
        { parola: 'luce intensa',               x: 0.52, y: 0.27, larg: 0.80 },
        { parola: 'veduta del castello',       x: 0.80, y: 0.50, larg: 0.38 },
        { parola: 'san giorgio',               x: 0.56, y: 0.58, larg: 0.35 },
        { parola: 'compatroni',                x: 0.52, y: 0.64, larg: 0.95 },
        { parola: 'beato giovanni liccio',     x: 0.71, y: 0.61, larg: 0.28 },
        { parola: 'santa rosalia',             x: 0.79, y: 0.63, larg: 0.28 },
        { parola: 'san teotista',              x: 0.86, y: 0.65, larg: 0.28 },
        { parola: 'san rocco',                 x: 0.41, y: 0.61, larg: 0.28 },
        { parola: 'suor febronia',             x: 0.30, y: 0.62, larg: 0.28 },
        { parola: 'san nicasio',               x: 0.19, y: 0.65, larg: 0.28 },
        { parola: 'questi affreschi',          x: 0.50, y: 0.45, larg: 1.00 },
        { parola: 'vi va di vedere',           x: 0.50, y: 0.45, larg: 1.00 }
      ]
    },
    {
      nome: 'La Cappella delle Reliquie',
      riconosci: 'ricco reliquiario ligneo dorato',
      immagine: '../gallery-chiese/cappelladellerelique_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Il Martirio di San Sebastiano',
      riconosci: 'giuseppe velasco',
      immagine: '../gallery-chiese/martirio_sansebastiano_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Il Beato Giovanni Liccio',
      riconosci: 'carlo ameglio',
      immagine: '../gallery-chiese/beato_giovanni_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'La Cupola',
      riconosci: 'giovanni battista cascione',
      immagine: '../gallery-chiese/cupola_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'La Porziuncola',
      riconosci: "grande tela dell'altare maggiore",
      immagine: '../gallery-chiese/pala_altare_cappuccini.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'San Rocco',
      riconosci: 'assai cara alla nostra comunità',
      immagine: '../gallery-chiese/san_rocco_di_montpeiler_cappuccini.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: "L'Adorazione dei Pastori",
      riconosci: 'gesù appena nato',
      immagine: '../gallery-chiese/adorazione_animesante.jpg',
      cue: [
        { parola: 'al centro, maria',   x: 0.41, y: 0.65, larg: 0.47 },
        { parola: 'san giuseppe',       x: 0.32, y: 0.54, larg: 0.43 },
        { parola: 'agnello',            x: 0.23, y: 0.71, larg: 0.40 },
        { parola: 'turbante giallo',    x: 0.76, y: 0.65, larg: 0.43 },
        { parola: 'gallo',              x: 0.56, y: 0.80, larg: 0.33 },
        { parola: 'in volo',            x: 0.46, y: 0.31, larg: 0.52 },
        { parola: 'vi va di vedere',    x: 0.50, y: 0.50, larg: 0.95 }
      ]
    },
    {
      nome: 'La Messa di Suffragio',
      riconosci: 'forza della preghiera per i defunti',
      immagine: '../gallery-chiese/messa_di_suffraggio_animesante.jpg',
      cue: [
        { parola: 'forza della preghiera', x: 0.53, y: 0.51, larg: 0.89 },
        { parola: 'sacerdote',             x: 0.42, y: 0.53, larg: 0.40 },
        { parola: 'paramenti rosa',        x: 0.43, y: 0.62, larg: 0.37 },
        { parola: 'chierichetto',          x: 0.27, y: 0.75, larg: 0.36 },
        { parola: 'due chierici',          x: 0.59, y: 0.72, larg: 0.40 },
        { parola: 'madonna',               x: 0.28, y: 0.24, larg: 0.37 },
        { parola: 'cristo',                x: 0.34, y: 0.18, larg: 0.36 },
        { parola: 'dio padre',             x: 0.68, y: 0.17, larg: 0.36 },
        { parola: 'colomba',               x: 0.53, y: 0.18, larg: 0.34 },
        { parola: 'un angelo solleva',     x: 0.68, y: 0.51, larg: 0.37 },
        { parola: 'tra le fiamme',         x: 0.80, y: 0.73, larg: 0.36 },
        { parola: 'vi va di vedere',       x: 0.53, y: 0.51, larg: 0.89 }
      ]
    },
    {
      nome: "L'Adorazione dell'Ostensorio",
      riconosci: "adorazione dell'ostensorio",
      immagine: '../gallery-chiese/adorazione_eucaristica_animesante.jpg',
      cue: [
        { parola: "l'ostensorio con l'ostia", x: 0.50, y: 0.20, larg: 0.50 },
        { parola: "santo vescovo", x: 0.26, y: 0.62, larg: 0.48 },
        { parola: "san francesco d'assisi", x: 0.72, y: 0.60, larg: 0.48 },
        { parola: "due putti", x: 0.50, y: 0.80, larg: 0.40 },
        { parola: "teschio", x: 0.76, y: 0.86, larg: 0.35 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "San Filippo Neri",
      riconosci: "siete davanti a san filippo neri",
      immagine: '../gallery-chiese/sanfilippo_animesante.jpg',
      cue: [
        { parola: "madonna con il bambino", x: 0.24, y: 0.17, larg: 0.45 },
        { parola: "camera da letto", x: 0.25, y: 0.80, larg: 0.50 },
        { parola: "imbarcazione", x: 0.75, y: 0.80, larg: 0.50 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "San Giovanni e l'Immacolata",
      riconosci: "san giovanni evangelista con l'immacolata",
      immagine: '../gallery-chiese/vergine_imm_animesante.jpg',
      cue: [
        { parola: "il giovane giovanni", x: 0.62, y: 0.58, larg: 0.60 },
        { parola: "libro sacro", x: 0.80, y: 0.64, larg: 0.35 },
        { parola: "la vergine immacolata", x: 0.30, y: 0.20, larg: 0.55 },
        { parola: "falce di luna", x: 0.22, y: 0.44, larg: 0.30 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "La Madonna del Carmelo",
      riconosci: "siete davanti alla madonna del carmelo",
      immagine: '../gallery-chiese/madonna_del_carmelo_animesante.jpg',
      cue: [
        { parola: "incoronata", x: 0.60, y: 0.22, larg: 0.55 },
        { parola: "giovanni della croce", x: 0.24, y: 0.56, larg: 0.45 },
        { parola: "un putto", x: 0.46, y: 0.78, larg: 0.42 },
        { parola: "una grande croce", x: 0.78, y: 0.62, larg: 0.45 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "Castello: l'ingresso",
      riconosci: "salite la rampa cordonata",
      immagine: '../gallery-chiese/cordata_princi_castello.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: "Castello: Ala Prades",
      riconosci: "siete nell'ala prades",
      immagine: '../gallery-chiese/ingresso_ala_prades.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Castello: Gran Corte',
      riconosci: 'siete nella gran corte',
      immagine: '../gallery-chiese/ingresso_grancorte_castello.jpg',
      cue: []
    },
    {
      nome: 'Castello: la Cappella',
      riconosci: 'siete nella cappella di corte',
      immagine: '../gallery-chiese/cappella_castello.jpg',
      cue: []
    },
    {
      nome: 'Castello: le Prigioni',
      riconosci: 'siete nelle prigioni del castello',
      immagine: '../gallery-chiese/entrata_prig_castello.jpg',
      cue: [
        { parola: 'catena', immagine: '../gallery-chiese/interno_prig_castello.jpg' }
      ]
    },
    {
      nome: "Castello: la Terrazza",
      riconosci: "siete sulla terrazza degli impiccati",
      immagine: '../gallery-chiese/panorama_terr_castello.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
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
    #tour-hint { position:absolute; z-index:5; left:50%; bottom:12px; transform:translateX(-50%);
      padding:6px 12px; border-radius:999px; background:rgba(15,25,34,0.75); color:#F3ECDC;
      font-size:0.8rem; opacity:0; pointer-events:none; transition:opacity .5s; }
    #tour-hint.visibile { opacity:1; }
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
    '<div id="tour-hint">🔍 Pizzica per ingrandire</div>' +
    '<div id="tour-debug"></div>';
  document.body.appendChild(box);

  const boxImg = box.querySelector('#tour-viewer-img');
  const boxDebug = box.querySelector('#tour-debug');
  const boxHint = box.querySelector('#tour-hint');
  let timerHint = null;
  function mostraHint() {
    boxHint.classList.add('visibile');
    clearTimeout(timerHint);
    timerHint = setTimeout(function () { boxHint.classList.remove('visibile'); }, 4500);
  }
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

  // quanto resta inquadrato un dettaglio prima di tornare alla visione intera
  const HOLD_MS = 6500;
  let timerHold = null;

  function fermaTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(timerHold);
  }

  // torna alla visione intera del quadro
  function tornaPanoramica() {
    if (viewer && viewer.world.getItemCount()) viewer.viewport.goHome();
  }

  function chiudiTour() {
    fermaTimers();
    tourAttivo = null;
    boxHint.classList.remove('visibile');
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
    if (c.immagine) {
      cuePendente = { tutto: true };
      viewer.open({ type: 'image', url: c.immagine });
      return;
    }
    const vp = viewer.viewport;
    clearTimeout(timerHold);
    if (c.tutto) { vp.goHome(); return; }
    vp.panTo(new OpenSeadragon.Point(c.x, c.y * aspetto()));
    vp.zoomTo(1 / c.larg);
    // dopo un po' si torna alla visione intera, se non arriva un altro dettaglio
    timerHold = setTimeout(tornaPanoramica, HOLD_MS);
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
      if (!tour.cue.length) mostraHint();
      if (cuePendente) { const c = cuePendente; cuePendente = null; applicaCue(c); }
      mostraDebug();
    });
    let provataAlt = false;
    viewer.addHandler('open-failed', function () {
      if (tour.immagineAlt && !provataAlt) {
        provataAlt = true;
        console.warn('Foto non trovata, provo quella di riserva:', tour.immagine);
        viewer.open({ type: 'image', url: tour.immagineAlt });
        return;
      }
      console.error('Immagine non trovata:', tour.immagine);
      chiudiTour();
    });
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
    let nellaFrase = false;
    tourAttivo.cue.forEach(function (c) {
      const i = testo.indexOf(c.parola);
      if (i === -1) return;
      nellaFrase = true;
      const ritardo = i < 8 ? 0 : Math.round(i * MS_PER_CARATTERE / rate);
      if (ritardo === 0) applicaCue(c);
      else timers.push(setTimeout(function () { applicaCue(c); }, ritardo));
    });
    // frase senza nessun dettaglio da mostrare: si torna alla visione intera
    if (!nellaFrase && tourAttivo.cue.length) timers.push(setTimeout(tornaPanoramica, 700));
  }

  if ('speechSynthesis' in window) {
    const speakOriginale = window.speechSynthesis.speak;
    window.speechSynthesis.speak = function (utt) {
      try { utt.addEventListener('start', function () { sulParlato(utt); }); } catch (e) {}
      // quando la Castellana smette di parlare (o la voce viene interrotta) il quadro torna intero
      const alFine = function () {
        if (tourAttivo && tourAttivo.cue.length) timers.push(setTimeout(tornaPanoramica, 1500));
      };
      try { utt.addEventListener('end', alFine); utt.addEventListener('error', alFine); } catch (e) {}
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
