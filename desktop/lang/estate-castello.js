// Carica e mostra la lista completa degli eventi "Estate sotto il Castello"
// Basta modificare i file eventi_estate*.json ogni anno: questo script non va toccato.
//
// Sceglie automaticamente il file giusto in base alla lingua selezionata
// dall'utente (variabile "currentLang", già definita nella pagina):
// - italiano -> eventi_estate.json
// - altre lingue -> eventi_estate_en.json / eventi_estate_fr.json / ecc.

document.addEventListener("DOMContentLoaded", function () {
  const bottone = document.getElementById("programma-toggle-btn");
  const contenitore = document.getElementById("programma-lista");

  if (!bottone || !contenitore) return; // se la pagina non ha la card, non fa nulla

  let caricato = false;

  function nomeFileEventi() {
    const lingua = (typeof currentLang !== "undefined" && currentLang) ? currentLang : "it";
    return lingua === "it" ? "eventi_estate.json" : `eventi_estate_${lingua}.json`;
  }

  function caricaEventi() {
    fetch(`lang/${nomeFileEventi()}`)
      .then((risposta) => risposta.json())
      .then((eventi) => {
        contenitore.innerHTML = eventi
          .map((ev) => {
            const ora = ev.ora ? " · " + ev.ora : "";
            return `
              <div class="evento-riga">
                <div class="evento-data">${ev.data}${ora}</div>
                <div class="evento-dettagli">
                  <div>${ev.titolo}</div>
                  <span class="evento-luogo">${ev.luogo}</span>
                </div>
              </div>`;
          })
          .join("");
        caricato = true;
      })
      .catch((errore) => {
        contenitore.innerHTML = "<p>Programma non disponibile al momento.</p>";
        console.error("Errore caricamento eventi estate:", errore);
      });
  }

  bottone.addEventListener("click", function () {
    const aperto = contenitore.classList.toggle("aperto");

    if (aperto) {
      bottone.textContent = "📋 Nascondi il programma";
    } else {
      bottone.textContent = "📋 Vedi il programma completo";
    }

    // Carica i dati dal JSON solo la prima volta che si apre
    if (aperto && !caricato) {
      caricaEventi();
    }
  });

  // Se l'utente cambia lingua mentre il programma è già stato caricato,
  // lo ricarica nella lingua nuova (altrimenti resterebbe quello vecchio).
  document.querySelectorAll(".lang-switcher button").forEach(function (langBtn) {
    langBtn.addEventListener("click", function () {
      if (caricato) {
        caricato = false;
        if (contenitore.classList.contains("aperto")) {
          caricaEventi();
        }
      }
    });
  });
});
