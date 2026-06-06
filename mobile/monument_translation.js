let currentLang = localStorage.getItem("lang") || "it";

function loadLanguage(lang) {
    // ESCE DA /mobile/ CON "../" E ACCEDE ALLA CARTELLA LANG NELLA ROOT PRINCIPALE
    fetch(`../lang/${lang}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`File JSON non trovato in ../lang/ (Status: ${res.status})`);
            return res.json();
        })
        .then(data => {
            // 1. Traduzione dinamica delle teche e dei testi
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                
                // Naviga le chiavi annidate del JSON (es. monuments.badia.title)
                const text = key.split('.').reduce((o, i) => (o ? o[i] : null), data);
                
                if (text) {
                    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                        el.placeholder = text;
                    } else {
                        el.innerHTML = text; // Mantiene emoji e formattazioni
                    }
                }
            });

            // 2. Gestione visiva dello switcher di lingua (se presente nella pagina)
            document.querySelectorAll(".lang-switcher button").forEach(btn => {
                if (btn.dataset.lang === lang) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        })
        .catch(err => console.error("Errore nel caricamento delle lingue di Amunì:", err));
    
    localStorage.setItem("lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
    // Aggancio sicuro dei listener senza blocchi se la dashboard varia tra le pagine
    const langButtons = document.querySelectorAll(".lang-switcher button");
    if (langButtons.length > 0) {
        langButtons.forEach(btn => {
            btn.addEventListener("click", () => loadLanguage(btn.dataset.lang));
        });
    }
    
    // Avvia la traduzione della pagina corrente
    loadLanguage(currentLang);
});
