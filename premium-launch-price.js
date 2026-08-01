/* ==========================================================================
   AMUNÌ TOURISM — BADGE "PREZZO DI LANCIO"
   ==========================================================================
   Un unico file da includere in ogni pagina con il box Premium
   (.castellana-premium-cta), con:
       <script src="../premium-launch-price.js"></script>

   Cerca da solo ogni box ".castellana-premium-cta" presente nella pagina
   e ci inserisce sopra al bottone "Acquista l'accesso" una riga che
   avvisa che il prezzo attuale è un prezzo di lancio, con scadenza.

   PER CAMBIARE PREZZO O DATA IN FUTURO: basta modificare le due costanti
   qui sotto (SCADENZA e PREZZO_DOPO) — si aggiorna automaticamente su
   tutte le pagine che includono questo file, senza toccare nient'altro.

   NOTA: la home page desktop (desktop_index.html) NON usa questo file,
   perché lì il box Premium ha una struttura diversa (.premium-section) e
   la riga "prezzo di lancio" è già scritta direttamente nell'HTML.
   ========================================================================== */

(function () {
    // ---- Modifica solo qui quando cambi il prezzo ----
    const SCADENZA = "1° novembre 2026";
    const PREZZO_DOPO = "5,00€";
    // ---------------------------------------------------

    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        document.querySelectorAll(".castellana-premium-cta").forEach(function (box) {
            // Evita di aggiungerlo due volte se lo script gira più di una volta
            if (box.querySelector(".premium-launch-badge")) return;

            const badge = document.createElement("p");
            badge.className = "premium-launch-badge";
            badge.style.cssText =
                "margin: 0 0 12px; font-size: 0.8rem; font-weight: 700; " +
                "letter-spacing: 0.3px; color: #B8873B; font-family: inherit;";
            badge.textContent =
                "🎉 Prezzo di lancio, valido fino al " + SCADENZA + " — poi " + PREZZO_DOPO;

            const bottoneAcquista = box.querySelector("#btn-buy-premium, .premium-btn-gold");
            if (bottoneAcquista) {
                box.insertBefore(badge, bottoneAcquista);
            } else {
                box.appendChild(badge);
            }
        });
    });
})();
