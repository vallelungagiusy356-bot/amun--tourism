let currentLang = localStorage.getItem("lang") || "it";

function loadLanguage(lang) {
    fetch(`../lang/${lang}.json`)
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                const text = key.split('.').reduce((o,i) => o ? o[i] : null, data);
                if (text) el.innerHTML = text;
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
