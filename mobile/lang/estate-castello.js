// Carica e mostra la lista completa degli eventi "Estate sotto il Castello"
// Basta modificare eventi_estate.json ogni anno: questo script non va toccato.

document.addEventListener("DOMContentLoaded", function () {
  const bottone = document.getElementById("programma-toggle-btn");
  const contenitore = document.getElementById("programma-lista");

  if (!bottone || !contenitore) return; // se la pagina non ha la card, non fa nulla

  let caricato = false;

  bottone.addEventListener("click", function () {
    const aperto = contenitore.classList.toggle("aperto");

    if (aperto) {
      bottone.textContent = "📋 Nascondi il programma";
    } else {
      bottone.textContent = "📋 Vedi il programma completo";
    }

    // Carica i dati dal JSON solo la prima volta che si apre
    if (aperto && !caricato) {
      fetch("lang/eventi_estate.json")
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
          console.error("Errore caricamento eventi_estate.json:", errore);
        });
    }
  });
});
