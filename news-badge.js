/* ==========================================================================
   AMUNÌ TOURISM — TOOLTIP "NEWS EVENTI"
   ==========================================================================
   Un unico file da includere in OGNI pagina (desktop e mobile) con:
       <script src="../news-badge.js"></script>
   (il percorso "../" presuppone che lo script stia nella cartella
   principale del sito, un livello sopra /desktop/ e /mobile/ — se la
   struttura fosse diversa, basta aggiustare il percorso).

   Legge ../news.json: se contiene almeno una voce in "items", mostra un
   piccolo tooltip fisso con un'animazione che pulsa dolcemente, per
   attirare l'attenzione senza essere invadente. Resta visibile finché
   non svuoti l'elenco in news.json — non sparisce da solo.

   Un solo aggiornamento -> il tooltip porta dritto al post Facebook.
   Più aggiornamenti insieme -> il tooltip apre un piccolo elenco, ogni
   voce porta al proprio post.

   Posizione: in alto a sinistra, sotto l'header. Essendo "position: fixed"
   resta ancorato a quel punto dello schermo e non scorre con la pagina;
   l'altezza dell'header cambia tra i formati (desktop/tablet/mobile), per
   questo il valore di "top" è regolato con le stesse soglie usate nel
   resto del sito, così il tooltip non finisce mai sotto l'header.
   ========================================================================== */

(function () {
    const NEWS_LABEL_BY_LANG = {
        it: "📰 News Eventi",
        en: "📰 Event News",
        fr: "📰 Actualités",
        es: "📰 Noticias",
        de: "📰 Neuigkeiten"
    };

    function currentLang() {
        return localStorage.getItem("lang") || "it";
    }

    function injectStyles() {
        if (document.getElementById("news-badge-styles")) return;
        const style = document.createElement("style");
        style.id = "news-badge-styles";
        style.textContent = `
            #news-badge-wrap {
                position: fixed;
                left: 1rem;
                top: 130px;
                z-index: 9998;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            @media (min-width: 601px) and (max-width: 899px) {
                #news-badge-wrap { top: 160px; }
            }
            @media (min-width: 900px) {
                #news-badge-wrap { top: 90px; }
            }
            #news-badge-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(15, 25, 34, 0.92);
                color: #F3ECDC;
                border: 1px solid #B8873B;
                border-radius: 999px;
                padding: 8px 16px;
                font-size: 0.82rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
                animation: newsBadgePulse 2.6s ease-in-out infinite;
            }
            @keyframes newsBadgePulse {
                0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(0,0,0,0.3); }
                50% { transform: scale(1.05); box-shadow: 0 4px 18px rgba(184,135,59,0.55); }
            }
            #news-badge-list {
                display: none;
                flex-direction: column;
                gap: 6px;
                margin-top: 8px;
                background: rgba(15, 25, 34, 0.96);
                border: 1px solid #B8873B;
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
        `;
        document.head.appendChild(style);
    }

    function renderBadge(items) {
        if (!items || items.length === 0) return;

        injectStyles();

        const wrap = document.createElement("div");
        wrap.id = "news-badge-wrap";

        const btn = document.createElement("button");
        btn.id = "news-badge-btn";
        btn.textContent = NEWS_LABEL_BY_LANG[currentLang()] || NEWS_LABEL_BY_LANG.it;
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
    }

    document.addEventListener("DOMContentLoaded", () => {
        fetch("../news.json")
            .then(res => res.json())
            .then(data => renderBadge(data.items))
            .catch(err => console.warn("News Eventi: impossibile caricare news.json", err));
    });
})();
