let currentLang = localStorage.getItem("lang") || "it";

function loadLanguage(lang) {
    // CORREZIONE PERCORSO: Risaliamo di un livello (../) per uscire da /mobile/ 
    // e raggiungere la cartella 'lang' posizionata nella root principale.
    fetch(`../lang/${lang}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`Impossibile trovare il file JSON in ../lang/ (Status: ${res.status})`);
            return res.json();
        })
        .then(data => {
            // 1. Traduzione di tutti gli elementi con attributo data-i18n
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                
                // Risolve le chiavi nidificate (es. monuments.badia.title)
                const text = key.split('.').reduce((o, i) => (o ? o[i] : null), data);
                
                if (text) {
                    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                        el.placeholder = text;
                    } else {
                        el.innerHTML = text; // Mantiene formattazioni ed emoji
                    }
                }
            });

            // 2. Aggiornamento dello stato visivo dei bottoni lingua (se presenti)
            document.querySelectorAll(".lang-switcher button").forEach(btn => {
                if (btn.dataset.lang === lang) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        })
        .catch(err => console.error("Errore durante il ciclo di traduzione di Amunì:", err));
    
    localStorage.setItem("lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
    // Aggancio sicuro dei listener sui bottoni cambio lingua
    const langButtons = document.querySelectorAll(".lang-switcher button");
    if (langButtons.length > 0) {
        langButtons.forEach(btn => {
            btn.addEventListener("click", () => loadLanguage(btn.dataset.lang));
        });
    }
    
    // Inizializza la lingua corretta al caricamento della pagina
    loadLanguage(currentLang);
});
