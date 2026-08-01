/* ==========================================================================
   AMUNÌ TOURISM — BADGE "PREZZO DI LANCIO"
   ==========================================================================
   Un unico file da includere in ogni pagina con il box Premium
   (.castellana-premium-cta), con:
       <script src="../premium-launch-price.js"></script>

   Cerca da solo ogni box ".castellana-premium-cta" presente nella pagina
   e ci inserisce sopra al bottone "Acquista l'accesso" una riga che
   avvisa che il prezzo attuale è un prezzo di lancio, con scadenza.

   TESTO E TRADUZIONI — non sono scritte qui dentro: il badge viene creato
   con l'attributo data-i18n="premium.launch_badge", lo stesso sistema che
   la pagina usa già per tradurre tutto il resto. Il testo vero, in tutte
   le lingue, sta nella chiave "premium.launch_badge" dei file
   lang/it.json, lang/en.json, lang/fr.json, lang/es.json, lang/de.json.

   PER CAMBIARE PREZZO O DATA IN FUTURO: modifica quella chiave nei 5 file
   lingua — non serve toccare questo file né alcuna pagina HTML.

   NOTA: la home page desktop (desktop_index.html) NON usa questo file,
   perché lì il box Premium ha una struttura diversa (.premium-section) e
   la riga "prezzo di lancio" è già scritta direttamente nell'HTML, con lo
   stesso attributo data-i18n="premium.launch_badge".
   ========================================================================== */

(function () {
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
