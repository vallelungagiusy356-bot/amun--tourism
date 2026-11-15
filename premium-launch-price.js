/* ==========================================================================
   AMUNÌ TOURISM — BADGE "PREZZO DI LANCIO"
   ==========================================================================
   STATO ATTUALE: SPENTO (dal 15 novembre 2026).

   Il prezzo di lancio è finito il 1° novembre 2026 e il prezzo normale è
   5,00€, quindi la riga "Prezzo di lancio, valido fino al 1° novembre 2026"
   non va più mostrata. Per questo qui sotto MOSTRA_BADGE è false: lo script
   viene caricato dalle pagine ma non scrive niente.

   PER RIATTIVARLO IN FUTURO (per esempio per una nuova promozione):
     1) cambia MOSTRA_BADGE da false a true;
     2) aggiorna il testo nella chiave "premium.launch_badge" dei 5 file
        lingua (lang/it.json, en.json, fr.json, es.json, de.json).

   Il file va incluso in ogni pagina con il box Premium
   (.castellana-premium-cta) con:
       <script src="../premium-launch-price.js"></script>

   Quando è acceso, cerca da solo ogni box ".castellana-premium-cta" e ci
   inserisce sopra al bottone "Acquista l'accesso" una riga con
   data-i18n="premium.launch_badge": il testo vero, in tutte le lingue, sta
   nei file lingua, non qui dentro.

   NOTA: la home page desktop (desktop_index.html) NON usa questo file,
   perché lì il box Premium ha una struttura diversa (.premium-section).
   ========================================================================== */

(function () {
    // true = mostra la riga "prezzo di lancio" | false = non mostrarla
    const MOSTRA_BADGE = false;

    if (!MOSTRA_BADGE) return;

    // Testo mostrato solo per una frazione di secondo, prima che il
    // sistema di traduzione della pagina lo sostituisca con quello giusto
    // nella lingua corrente (letto da lang/*.json).
    const TESTO_DI_RISERVA =
        "🎉 Prezzo di lancio, valido fino al 1° novembre 2026 — poi 5,00€";

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
            badge.setAttribute("data-i18n", "premium.launch_badge");
            badge.style.cssText =
                "margin: 0 0 12px; font-size: 0.8rem; font-weight: 700; " +
                "letter-spacing: 0.3px; color: #B8873B; font-family: inherit;";
            badge.textContent = TESTO_DI_RISERVA;

            const bottoneAcquista = box.querySelector("#btn-buy-premium, .premium-btn-gold");
            if (bottoneAcquista) {
                box.insertBefore(badge, bottoneAcquista);
            } else {
                box.appendChild(badge);
            }
        });
    });
})();
