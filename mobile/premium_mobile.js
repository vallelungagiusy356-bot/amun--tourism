/* ============================================================
   PULSANTE "SBLOCCA IL PREMIUM" — pagine mobile di Amunì Tourism
   Compare nella chat, sotto la barra "Versione gratuita", solo a chi
   non ha già il Premium. Porta alla pagina di pagamento Stripe e poi
   riporta alla stessa pagina mobile.

   ⚠ INTERRUTTORE: finché ACQUISTI_ATTIVI è false il pulsante NON si vede.
   Per provarlo senza attivarlo per tutti, aggiungi all'indirizzo
   ?provapagamento=1  (es. cappuccini_prova.html?provapagamento=1).
   ============================================================ */
(function () {
  'use strict';

  var ACQUISTI_ATTIVI = false;   // <-- metti true solo quando sei pronta a vendere
  var PROVA = new URLSearchParams(location.search).has('provapagamento');
  if (!ACQUISTI_ATTIVI && !PROVA) return;

  var API = 'https://castellana.pythonanywhere.com';
  var barra = document.getElementById('premium-status-bar-mobile');
  if (!barra) return;

  var stile = document.createElement('style');
  stile.textContent =
    '#premium-acquisto{display:none;flex-direction:column;gap:6px;margin:0 0 10px;text-align:center}' +
    '#premium-buy-btn{background:#C1622D;color:#fff;border:none;border-radius:8px;padding:11px 14px;' +
    'font-size:0.92rem;font-weight:600;cursor:pointer}' +
    '#premium-buy-btn:disabled{opacity:.6}' +
    '#premium-acquisto p{margin:0;font-size:0.72rem;line-height:1.35;color:#F3ECDC;opacity:.85}' +
    '#premium-acquisto a{color:#D4AF6A}';
  document.head.appendChild(stile);

  var TESTO_BTN = '👑 Sblocca il Premium · 3,90 €';
  var box = document.createElement('div');
  box.id = 'premium-acquisto';
  box.innerHTML =
    '<button id="premium-buy-btn" type="button">' + TESTO_BTN + '</button>' +
    '<p>Pagamento unico, 4 giorni di accesso, nessun rinnovo. ' +
    '<a href="condizioni_premium.html">Condizioni</a> · <a href="privacy.html">Privacy</a></p>';
  barra.insertAdjacentElement('afterend', box);

  function aggiorna() {
    var vuota = !barra.textContent.trim();
    var premiumAttivo = barra.classList.contains('premium-active');
    box.style.display = (vuota || premiumAttivo) ? 'none' : 'flex';
  }
  new MutationObserver(aggiorna).observe(barra, {
    attributes: true, attributeFilter: ['class'], childList: true, characterData: true, subtree: true
  });
  aggiorna();

  var btn = document.getElementById('premium-buy-btn');
  btn.addEventListener('click', async function () {
    btn.disabled = true;
    btn.textContent = '…';
    try {
      var pagina = location.pathname.split('/').pop() || 'mobile_index.html';
      var r = await fetch(API + '/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_page: pagina, platform: 'mobile' })
      });
      var d = await r.json();
      if (d && d.url) { location.href = d.url; return; }
      throw new Error('nessun indirizzo di pagamento');
    } catch (e) {
      console.error(e);
      btn.disabled = false;
      btn.textContent = TESTO_BTN;
      alert('Al momento non riesco ad avviare il pagamento. Riprova tra poco.');
    }
  });
})();
