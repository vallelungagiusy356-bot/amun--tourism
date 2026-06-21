let currentLang = localStorage.getItem("lang") || "it";

function loadLanguage(lang) {
    fetch(`lang/${lang}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`File JSON non trovato in ../lang/ (Status: ${res.status})`);
            return res.json();
        })
        .then(data => {
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                
                // SISTEMAZIONE BLINDATA: Se una chiave fallisce, non crasha più la pagina
                try {
                    const text = key.split('.').reduce((o, i) => (o ? o[i] : null), data);
                    
                    if (text) {
                        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                            el.placeholder = text;
                        } else {
                            el.innerHTML = text;
                        }
                    } else {
                        console.warn(`Chiave mancante nel JSON: ${key}`);
                    }
                } catch (e) {
                    console.error(`Errore nel reduce per la chiave: ${key}`, e);
                }
            });

            // Gestione visiva dei bottoni lingua
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
    const langButtons = document.querySelectorAll(".lang-switcher button");
    if (langButtons.length > 0) {
        langButtons.forEach(btn => {
            btn.addEventListener("click", () => loadLanguage(btn.dataset.lang));
        });
    }
    loadLanguage(currentLang);
});
