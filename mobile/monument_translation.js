let currentLang = localStorage.getItem("lang") || "it";

function loadLanguage(lang) {
    fetch(`lang/${lang}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`File JSON non trovato in ../lang/ (Status: ${res.status})`);
            return res.json();
        })
        .then(data => {
            // Aggiorna la lingua della pagina per la sintesi vocale
            const speechLangMap = { it: "it-IT", en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" };
            document.documentElement.lang = speechLangMap[lang] || "it-IT";

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

// ============================================================
// AUDIOGUIDA — sintesi vocale condivisa da tutte le pagine
// dei monumenti. Due cose risolte qui:
//
// 1. VOCE SEMPRE FEMMINILE: prima veniva usata la voce di
//    sistema predefinita per la lingua, che su molti telefoni
//    è maschile. Ora si cerca esplicitamente una voce femminile
//    nota, con un ripiego intelligente se non la si trova.
//
// 2. RITARDO ALL'AVVIO: il browser carica l'elenco delle voci
//    in modo "asincrono" — se non sono ancora pronte quando si
//    preme play la prima volta, si sente un ritardo. Qui le
//    "svegliamo" subito al caricamento della pagina, così sono
//    già pronte quando l'utente tocca il pulsante.
// ============================================================
let vociDisponibili = [];

function aggiornaVociDisponibili() {
    vociDisponibili = window.speechSynthesis.getVoices();
}

if ('speechSynthesis' in window) {
    aggiornaVociDisponibili();
    window.speechSynthesis.onvoiceschanged = aggiornaVociDisponibili;
}

// Nomi di voci femminili note, per lingua (in ordine di preferenza).
// Cambiano da dispositivo a dispositivo, quindi ne teniamo più di una.
const NOMI_VOCE_FEMMINILE = {
    "it-IT": ["Google italiano", "Elsa", "Alice", "Federica", "Silvia"],
    "en-US": ["Google US English", "Samantha", "Zira", "Aria", "Jenny"],
    "fr-FR": ["Google français", "Amelie", "Julie", "Denise", "Hortense"],
    "de-DE": ["Google Deutsch", "Anna", "Katja", "Petra", "Helena"],
    "es-ES": ["Google español", "Monica", "Helena", "Elvira", "Paloma"]
};

// Parole tipiche di voci maschili, usate solo come ultima spiaggia
// per scartare una voce quando nessun nome noto corrisponde.
const INDIZI_VOCE_MASCHILE = /male|david|mark|daniel|thomas|diego|paolo|hans|marco|luca|carlos|antonio/i;

function trovaVoceFemminile(langCode) {
    if (!vociDisponibili.length) {
        vociDisponibili = window.speechSynthesis.getVoices();
    }

    const nomiPreferiti = NOMI_VOCE_FEMMINILE[langCode] || [];
    for (const nome of nomiPreferiti) {
        const voce = vociDisponibili.find(v => v.name.includes(nome));
        if (voce) return voce;
    }

    // Nessun nome noto trovato: proviamo tra le voci della stessa
    // lingua, scartando quelle che sembrano chiaramente maschili.
    const linguaBase = langCode.split('-')[0];
    const stessaLingua = vociDisponibili.filter(v =>
        v.lang === langCode || v.lang.startsWith(linguaBase)
    );
    const nonMaschile = stessaLingua.find(v => !INDIZI_VOCE_MASCHILE.test(v.name));

    return nonMaschile || stessaLingua[0] || vociDisponibili[0] || null;
}

function toggleReadAloud(btnEl, textId) {
    if (!('speechSynthesis' in window)) {
        alert("La sintesi vocale non è supportata su questo browser.");
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        btnEl.classList.remove('playing');
        btnEl.querySelector('span').textContent = 'Ascolta la descrizione';
        return;
    }

    const langCode = document.documentElement.lang || 'it-IT';
    const text = document.getElementById(textId).innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.voice = trovaVoceFemminile(langCode);

    utterance.onend = () => {
        btnEl.classList.remove('playing');
        btnEl.querySelector('span').textContent = 'Ascolta la descrizione';
    };

    window.speechSynthesis.speak(utterance);
    btnEl.classList.add('playing');
    btnEl.querySelector('span').textContent = "Ferma l'ascolto";
}
