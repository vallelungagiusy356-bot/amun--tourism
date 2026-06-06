let currentLang = localStorage.getItem("lang") || "it";

function loadLanguage(lang) {
    // 1. CORREZIONE: Rimosso "../" se i file HTML e la cartella lang sono allo stesso livello
    fetch(`lang/${lang}.json`)
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                const text = key.split('.').reduce((o,i) => o ? o[i] : null, data);
                
                if (text) {
                    // 2. CORREZIONE: Gestione dei placeholder per input/textarea
                    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                        el.placeholder = text;
                    } else {
                        el.innerHTML = text;
                    }
                }
            });
            document.querySelectorAll(".lang-switcher button").forEach(btn => {
                if (btn.dataset.lang === lang) btn.classList.add("active");
                else btn.classList.remove("active");
            });
        })
        .catch(err => console.error("Errore traduzione mobile:", err));
    localStorage.setItem("lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lang-switcher button").forEach(btn => {
        btn.addEventListener("click", () => loadLanguage(btn.dataset.lang));
    });
    loadLanguage(currentLang);
});
