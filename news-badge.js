/* ==========================================================================
   AMUNÌ TOURISM — TOOLTIP "NEWS EVENTI"
   ==========================================================================
   Un unico file da includere in OGNI pagina (desktop e mobile) con:
       <script src="../news-badge.js"></script>
   (il percorso "../" presuppone che lo script stia nella cartella
   principale del sito, un livello sopra /desktop/ e /mobile/ — se la
   struttura fosse diversa, basta aggiustare il percorso).

   Legge ../news.json: se contiene almeno una voce in "items", mostra un
   piccolo pulsante fisso. Resta visibile finché non svuoti l'elenco in
   news.json — non sparisce da solo.

   Un solo aggiornamento -> il tooltip porta dritto al post Facebook.
   Più aggiornamenti insieme -> il tooltip apre un piccolo elenco, ogni
   voce porta al proprio post.

   POSIZIONE — in basso a sinistra (l'angolo opposto alla Castellana,
   che sta in basso a destra). Prima stava vicino all'header con un
   "top" fisso: siccome l'header ha un'altezza diversa da pagina a
   pagina, capitava che il tooltip finisse sopra al titolo o al
   sottotitolo del contenuto. In basso a sinistra questo problema non
   si presenta più, perché lì non scorre mai testo di pagina.

   ASPETTO — di base è una piccola icona rotonda color oro (poco
   invasiva). Ogni tot secondi si "apre" mostrando l'etichetta per
   qualche istante, poi si richiude: intermittente invece che sempre
   spalancata, per non risultare invadente.

   VARIABILI — colori, bordo e dimensione sono variabili CSS
   (--news-badge-*) dentro #news-badge-wrap: bastano quelle per
   cambiare la palette senza toccare il resto del file.
   ========================================================================== */

(function () {
    const NEWS_ICON = "📰";
    const NEWS_LABEL_BY_LANG = {
        it: "News Eventi",
        en: "Event News",
        fr: "Actualités",
        es: "Noticias",
        de: "Neuigkeiten"
    };

    // Ogni quanto si "apre" mostrando l'etichetta, e per quanto tempo resta aperto
    const PULSE_INTERVAL_MS = 14000;
    const PULSE_SHOW_MS = 4000;
    const FIRST_PULSE_DELAY_MS = 1200;

    function currentLang() {
        return localStorage.getItem("lang") || "it";
    }

    function injectStyles() {
        if (document.getElementById("news-badge-styles")) return;
        const style = document.createElement("style");
        style.id = "news-badge-styles";
        style.textContent = `
            #news-badge-wrap {
                /* ===== Variabili — modifica solo qui per cambiare aspetto ===== */
                --news-badge-bg: linear-gradient(135deg, #D4AF6A, #B8873B);
                --news-badge-text: #3a2a10;
                --news-badge-border: #8C6529;
                --news-badge-glow: rgba(184, 135, 59, 0.55);
                --news-badge-size: 46px;

                position: fixed;
                left: 1rem;
                bottom: 90px;
                z-index: 9998;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            #news-badge-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                height: var(--news-badge-size);
                width: var(--news-badge-size);
                padding: 0;
                justify-content: center;
                white-space: nowrap;
                overflow: hidden;
                background: var(--news-badge-bg);
                color: var(--news-badge-text);
                border: 1px solid var(--news-badge-border);
                border-radius: 999px;
                font-weight: 700;
                font-size: 1.05rem;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
                transition: width 0.35s ease, padding 0.35s ease, box-shadow 0.3s ease;
            }
            /* Stato "aperto": si allarga per mostrare il testo e pulsa dolcemente */
            #news-badge-wrap.expanded #news-badge-btn {
                width: auto;
                padding: 0 18px 0 14px;
                font-size: 0.82rem;
                box-shadow: 0 4px 18px var(--news-badge-glow);
                animation: newsBadgeGlow 1.6s ease-in-out infinite;
            }
            @keyframes newsBadgeGlow {
                0%, 100% { box-shadow: 0 4px 14px var(--news-badge-glow); }
                50% { box-shadow: 0 4px 22px var(--news-badge-glow); }
            }
            .news-badge-label {
                display: none;
            }
            #news-badge-wrap.expanded .news-badge-label {
                display: inline;
            }
            #news-badge-list {
                display: none;
                flex-direction: column;
                gap: 6px;
                position: absolute;
                bottom: 100%;
                left: 0;
                margin-bottom: 8px;
                background: rgba(15, 25, 34, 0.96);
                border: 1px solid var(--news-badge-border);
                border-radius: 8px;
                padding: 10px;
                max-width: 260px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
            }
            #news-badge-list.active { display: flex; }
            #news-badge-list a {
                color: #D4AF6A;
                font-size: 0.8rem;
                text-decoration: none;
                border-bottom: 1px dashed rgba(212, 175, 106, 0.4);
                padding-bottom: 5px;
            }
            #news-badge-list a:last-child { border-bottom: none; padding-bottom: 0; }
            #news-badge-list a:hover { color: #fff; }

            /* Stato "agganciato": quando il footer si avvicina, il tooltip
               smette di seguire lo scroll con position:fixed e si blocca
               appena sopra al footer, così non ci finisce mai sopra. */
            #news-badge-wrap.footer-docked {
                position: absolute;
                bottom: auto;
            }
        `;
        document.head.appendChild(style);
    }

    // Distanza dal fondo pagina a cui il tooltip resta ancorato normalmente
    // (deve combaciare con il "bottom" impostato nel CSS di #news-badge-wrap)
    const FIXED_BOTTOM_OFFSET = 90;
    // Spazio extra tra il tooltip agganciato e il bordo superiore del footer
    const FOOTER_MARGIN = 20;

    function initFooterDock(wrap) {
        const footer = document.querySelector("footer.footer-copyright") || document.querySelector("footer");
        if (!footer) return; // nessun footer trovato: il tooltip resta fixed come prima

        let ticking = false;

        function updatePosition() {
            ticking = false;
            const footerRect = footer.getBoundingClientRect();
            const badgeHeight = wrap.offsetHeight;

            // Il tooltip (fixed) occuperebbe lo spazio tra
            // (viewport bottom - FIXED_BOTTOM_OFFSET - badgeHeight) e (viewport bottom - FIXED_BOTTOM_OFFSET).
            // Se il bordo superiore del footer entra in quello spazio, agganciamo il tooltip.
            const wouldOverlap = footerRect.top < (window.innerHeight - FIXED_BOTTOM_OFFSET);

            if (wouldOverlap) {
                const footerTopInDocument = footerRect.top + window.scrollY;
                wrap.style.top = (footerTopInDocument - badgeHeight - FOOTER_MARGIN) + "px";
                wrap.classList.add("footer-docked");
            } else {
                wrap.classList.remove("footer-docked");
                wrap.style.top = "";
            }
        }

        function onScrollOrResize() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updatePosition);
            }
        }

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        updatePosition();
    }

    function startPulseCycle(wrap) {
        function pulseOnce() {
            wrap.classList.add("expanded");
            setTimeout(() => wrap.classList.remove("expanded"), PULSE_SHOW_MS);
        }
        setTimeout(pulseOnce, FIRST_PULSE_DELAY_MS);
        setInterval(pulseOnce, PULSE_INTERVAL_MS);
    }

    function renderBadge(items) {
        if (!items || items.length === 0) return;

        injectStyles();

        const wrap = document.createElement("div");
        wrap.id = "news-badge-wrap";

        const btn = document.createElement("button");
        btn.id = "news-badge-btn";
        const label = NEWS_LABEL_BY_LANG[currentLang()] || NEWS_LABEL_BY_LANG.it;
        btn.innerHTML = `<span>${NEWS_ICON}</span><span class="news-badge-label">${label}</span>`;
        wrap.appendChild(btn);

        if (items.length === 1) {
            // Una sola novità: il tooltip porta dritto al post.
            btn.addEventListener("click", () => {
                window.open(items[0].link, "_blank", "noopener");
            });
        } else {
            // Più novità insieme: il tooltip apre un piccolo elenco.
            const list = document.createElement("div");
            list.id = "news-badge-list";
            items.forEach(item => {
                const a = document.createElement("a");
                a.href = item.link;
                a.target = "_blank";
                a.rel = "noopener";
                a.textContent = item.title;
                list.appendChild(a);
            });
            wrap.appendChild(list);

            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                list.classList.toggle("active");
            });
            document.addEventListener("click", (e) => {
                if (!wrap.contains(e.target)) list.classList.remove("active");
            });
        }

        document.body.appendChild(wrap);
        initFooterDock(wrap);
        startPulseCycle(wrap);
    }

    document.addEventListener("DOMContentLoaded", () => {
        fetch("../news.json")
            .then(res => res.json())
            .then(data => renderBadge(data.items))
            .catch(err => console.warn("News Eventi: impossibile caricare news.json", err));
    });
})();
