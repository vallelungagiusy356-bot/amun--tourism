/* ==========================================================================
   AMUNÌ TOURISM — WIDGET POSITION FIX
   ==========================================================================
   Un unico file da includere in OGNI pagina desktop con:
       <script src="../widget-position-fix.js"></script>
   (dopo aver caricato .chat-desktop, .castellana-widget-area e — se presente
   — #news-badge-wrap nel DOM; va bene metterlo poco prima di </body>).

   Risolve DUE problemi di sovrapposizione distinti:

   1) WIDGET vs FOOTER — quando l'utente arriva in fondo alla pagina, il
      tondo della Castellana e il badge news "salgono" per restare sempre
      GAP px sopra al footer, invece di schiacciarcisi sopra.

   2) TONDO CASTELLANA / BADGE NEWS vs FINESTRA CHAT APERTA — quando la
      chat si apre (classe "active" su .chat-desktop), il tondo e il badge
      news si nascondono, perché altrimenti la finestra della chat ci
      finisce sopra (specialmente su schermi stretti, dove la chat diventa
      a piena larghezza). Tornano visibili alla chiusura della chat.

   Non serve toccare nulla di specifico per ogni pagina: il file cerca da
   solo gli elementi tramite le classi standard usate in tutto il sito.
   ========================================================================== */

(function () {
    function ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        const footer = document.querySelector(".footer-copyright");
        const castellana =
            document.querySelector(".castellana-widget-area") ||
            document.querySelector(".castellana-video-wrapper");
        const chatBox = document.querySelector(".chat-desktop");

        const GAP = 20; // spazio tra i widget e il footer, in pixel

        /* ---------------------------------------------------------------
           1) Aggancio sopra al footer (Castellana + badge news)
           --------------------------------------------------------------- */
        function aggiornaPosizione(widget, valoreBottomNormale) {
            if (!widget || !footer) return;
            const footerRect = footer.getBoundingClientRect();
            const alturaSchermo = window.innerHeight;

            if (footerRect.top < alturaSchermo) {
                const sovrapposizione = alturaSchermo - footerRect.top;
                widget.style.bottom = sovrapposizione + GAP + "px";
            } else {
                widget.style.bottom = valoreBottomNormale;
            }
        }

        function aggiornaTutto() {
            aggiornaPosizione(castellana, "");
            aggiornaPosizione(document.getElementById("news-badge-wrap"), "90px");
        }

        if (footer) {
            window.addEventListener("scroll", aggiornaTutto, { passive: true });
            window.addEventListener("resize", aggiornaTutto);

            // Il badge news arriva con un piccolo ritardo (deve prima
            // scaricare news.json), quindi lo controlliamo finché non appare
            const attendiBadge = setInterval(() => {
                if (document.getElementById("news-badge-wrap")) {
                    aggiornaTutto();
                    clearInterval(attendiBadge);
                }
            }, 300);

            aggiornaTutto();
        }

        /* ---------------------------------------------------------------
           2) Nascondi tondo Castellana + badge news quando la chat è aperta
           --------------------------------------------------------------- */
        function nascondiWidgetSottoChat(nascondi) {
            [castellana, document.getElementById("news-badge-wrap")].forEach((el) => {
                if (!el) return;
                el.style.opacity = nascondi ? "0" : "";
                el.style.visibility = nascondi ? "hidden" : "";
                el.style.pointerEvents = nascondi ? "none" : "";
            });
        }

        if (chatBox) {
            const osservaChat = new MutationObserver(() => {
                nascondiWidgetSottoChat(chatBox.classList.contains("active"));
            });
            osservaChat.observe(chatBox, { attributes: true, attributeFilter: ["class"] });

            // Stato iniziale, nel caso la chat sia già aperta al caricamento
            nascondiWidgetSottoChat(chatBox.classList.contains("active"));
        }
    });
})();
