/* Amunì Tourism · passaggio automatico alla guida offline
 *
 * Si carica SOLO nelle pagine dove vuoi questo comportamento (per ora la chiesa
 * delle Anime Sante), una riga dopo tour_visivo.js:
 *     <script src="fallback_offline.js"></script>
 *
 * Cosa fa:
 *  1. Quando il turista è online, in silenzio salva sul suo dispositivo la guida
 *     offline (tour_offline.html + foto), così è già pronta se il campo sparisce.
 *  2. Se la chat non riesce a raggiungere il server (campo assente, rete lenta),
 *     compare un avviso con il pulsante "Apri la guida offline".
 *  Non cambia niente nel resto della pagina.
 */
(function () {
  'use strict';

  const PAGINA_OFFLINE = 'tour_offline.html';
  const SW = 'sw_tour_offline.js';
  const ATTESA_MS = 15000; // oltre questo tempo senza risposta la chat si considera irraggiungibile

  const TESTI = {
    it: { msg: 'Connessione assente o troppo debole.', btn: 'Apri la guida offline', no: 'Chiudi' },
    en: { msg: 'No connection or too weak.', btn: 'Open the offline guide', no: 'Close' },
    fr: { msg: 'Pas de connexion ou trop faible.', btn: 'Ouvrir la visite hors ligne', no: 'Fermer' },
    de: { msg: 'Keine oder zu schwache Verbindung.', btn: 'Offline-Führung öffnen', no: 'Schließen' },
    es: { msg: 'Sin conexión o demasiado débil.', btn: 'Abrir la guía sin conexión', no: 'Cerrar' }
  };

  function lingua() {
    try {
      const a = document.querySelector('[data-lang].active, [data-lang].attivo, [data-lang].selected');
      if (a && TESTI[a.dataset.lang]) return a.dataset.lang;
    } catch (e) {}
    const h = (document.documentElement.lang || 'it').slice(0, 2).toLowerCase();
    return TESTI[h] ? h : 'it';
  }

  // ---- 1. preparazione silenziosa della guida offline ----
  function prepara() {
    if (!('serviceWorker' in navigator) || navigator.onLine === false) return;
    navigator.serviceWorker.register(SW).catch(function () {});
  }
  if (document.readyState === 'complete') setTimeout(prepara, 3000);
  else window.addEventListener('load', function () { setTimeout(prepara, 3000); });

  // ---- 2. avviso quando il server non risponde ----
  let mostrato = false;
  let chiuso = false;

  function avviso() {
    if (mostrato || chiuso) return;
    mostrato = true;
    const l = lingua();
    const t = TESTI[l];
    const box = document.createElement('div');
    box.setAttribute('role', 'alert');
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:1000000;' +
      'background:#0f1922;color:#F3ECDC;border:1px solid #B8873B;border-radius:12px;' +
      'padding:12px 14px;font:15px/1.4 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45);' +
      'max-width:520px;margin:0 auto;';
    const p = document.createElement('div');
    p.textContent = t.msg;
    p.style.marginBottom = '10px';
    const a = document.createElement('a');
    a.href = PAGINA_OFFLINE + '?lang=' + l;
    // ricorda da dove si arriva, per poter tornare online quando il segnale ritorna
    a.addEventListener('click', function () {
      try { localStorage.setItem('amuni_ritorno', location.href); } catch (e) {}
    });
    a.textContent = t.btn;
    a.style.cssText = 'display:inline-block;padding:10px 16px;border-radius:999px;background:#B8873B;' +
      'color:#1a1208;font-weight:700;text-decoration:none;margin-right:10px;';
    const x = document.createElement('button');
    x.type = 'button';
    x.textContent = t.no;
    x.style.cssText = 'padding:10px 14px;border-radius:999px;border:1px solid #B8873B;background:transparent;color:#F3ECDC;font-size:15px;';
    x.onclick = function () { chiuso = true; mostrato = false; box.remove(); };
    box.appendChild(p); box.appendChild(a); box.appendChild(x);
    document.body.appendChild(box);
  }

  window.addEventListener('offline', avviso);
  window.addEventListener('online', function () {
    document.querySelectorAll('[role="alert"]').forEach(function (e) {
      if (e.textContent.indexOf('offline') !== -1 || e.textContent.indexOf('hors ligne') !== -1) { /* resta finché l'utente la chiude */ }
    });
  });

  // controlla le richieste della chat al server (senza cambiarle)
  if (typeof window.fetch === 'function') {
    const originale = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : ((input && input.url) || '');
      const isChat = url.indexOf('/chat') !== -1 && init && typeof init.body === 'string';
      const promessa = originale.apply(this, arguments);
      if (!isChat) return promessa;
      const timer = setTimeout(avviso, ATTESA_MS);
      promessa.then(function () { clearTimeout(timer); }, function () { clearTimeout(timer); avviso(); });
      return promessa;
    };
  }
})();
