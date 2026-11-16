/* ==========================================================================
   AMUNÌ TOURISM — TRADUZIONE DEL BANNER COOKIE (IT / EN / FR / ES / DE)
   ==========================================================================
   Il banner cookie è fatto da Silktide, che nelle pagine viene configurato
   con testi in italiano. Questo file li traduce, senza toccare il resto
   della configurazione (script di Google Analytics, eventi, ecc.).

   COME SI USA: va incluso in ogni pagina con il banner, SUBITO DOPO la riga
   che carica silktide-consent-manager.js e PRIMA del blocco
   "window.silktideConsentManager.init({ ... })":

       <script src="../cookie-i18n.js"></script>      (pagine nella cartella desktop)
       <script src="cookie-i18n.js"></script>         (pagine nella cartella principale)

   Se questo file non si carica, il banner resta in italiano come prima.

   QUALE LINGUA USA:
     1) la lingua scelta dal visitatore sul sito (memoria del browser, chiave "lang");
     2) se non ne ha ancora scelta una, la lingua del suo browser (se è una
        delle 5 del sito) — così un turista inglese vede subito il banner in inglese;
     3) altrimenti l'italiano.
   Se il visitatore cambia lingua mentre il banner è aperto, il testo del banner
   si aggiorna da solo.

   PER NON USARE LA LINGUA DEL BROWSER: metti USA_LINGUA_DEL_BROWSER = false.

   PER CAMBIARE UN TESTO: modificalo qui sotto, nella lingua che ti serve.
   ========================================================================== */

(function () {
    // true = senza lingua scelta, usa quella del browser | false = parte sempre dall'italiano
    var USA_LINGUA_DEL_BROWSER = true;

    var LINGUE = ["it", "en", "fr", "es", "de"];

    // ----------------------------------------------------------------------
    // TESTI. Per ogni lingua: le due categorie di cookie e i testi del banner.
    // ----------------------------------------------------------------------
    var TESTI = {
        it: {
            essenziali: {
                label: "Essenziali",
                description: "<p>Cookie tecnici necessari al funzionamento del sito, come la memoria della lingua scelta e del codice Premium attivato. Non possono essere disattivati.</p>"
            },
            statistiche: {
                label: "Statistiche",
                description: "Questi cookie ci aiutano a capire come i visitatori usano il sito, in forma aggregata e anonima, per migliorare i contenuti di Amunì Tourism."
            },
            banner: {
                description: "<p>Amunì Tourism utilizza i cookie per offrirti la migliore esperienza di navigazione e per analizzare il traffico del sito in forma anonima. Puoi scegliere quali accettare.</p>",
                acceptAllButtonText: "Accetta tutti",
                acceptAllButtonAccessibleLabel: "Accetta tutti i cookie",
                rejectNonEssentialButtonText: "Rifiuta i non essenziali",
                rejectNonEssentialButtonAccessibleLabel: "Rifiuta tutti i cookie non essenziali",
                preferencesButtonText: "Preferenze",
                preferencesButtonAccessibleLabel: "Apri le preferenze cookie"
            },
            preferences: {
                title: "Personalizza le tue preferenze cookie",
                description: "<p>Rispettiamo il tuo diritto alla privacy. Puoi scegliere di non consentire alcuni tipi di cookie. Le tue preferenze verranno applicate a tutto il sito.</p>",
                saveButtonText: "Salva e chiudi",
                saveButtonAccessibleLabel: "Salva le tue preferenze cookie",
                creditLinkText: "Ottieni questo banner gratis",
                creditLinkAccessibleLabel: "Ottieni questo banner gratis"
            }
        },

        en: {
            essenziali: {
                label: "Essential",
                description: "<p>Technical cookies needed for the site to work, such as remembering the chosen language and the activated Premium code. They cannot be switched off.</p>"
            },
            statistiche: {
                label: "Statistics",
                description: "These cookies help us understand how visitors use the site, in aggregate and anonymous form, to improve the content of Amunì Tourism."
            },
            banner: {
                description: "<p>Amunì Tourism uses cookies to offer you the best browsing experience and to analyse site traffic anonymously. You can choose which ones to accept.</p>",
                acceptAllButtonText: "Accept all",
                acceptAllButtonAccessibleLabel: "Accept all cookies",
                rejectNonEssentialButtonText: "Reject non-essential",
                rejectNonEssentialButtonAccessibleLabel: "Reject all non-essential cookies",
                preferencesButtonText: "Preferences",
                preferencesButtonAccessibleLabel: "Open cookie preferences"
            },
            preferences: {
                title: "Customise your cookie preferences",
                description: "<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your preferences will apply to the whole site.</p>",
                saveButtonText: "Save and close",
                saveButtonAccessibleLabel: "Save your cookie preferences",
                creditLinkText: "Get this banner for free",
                creditLinkAccessibleLabel: "Get this banner for free"
            }
        },

        fr: {
            essenziali: {
                label: "Essentiels",
                description: "<p>Cookies techniques nécessaires au fonctionnement du site, comme la mémorisation de la langue choisie et du code Premium activé. Ils ne peuvent pas être désactivés.</p>"
            },
            statistiche: {
                label: "Statistiques",
                description: "Ces cookies nous aident à comprendre comment les visiteurs utilisent le site, de manière agrégée et anonyme, afin d'améliorer les contenus d'Amunì Tourism."
            },
            banner: {
                description: "<p>Amunì Tourism utilise des cookies pour vous offrir la meilleure expérience de navigation et analyser le trafic du site de manière anonyme. Vous pouvez choisir lesquels accepter.</p>",
                acceptAllButtonText: "Tout accepter",
                acceptAllButtonAccessibleLabel: "Accepter tous les cookies",
                rejectNonEssentialButtonText: "Refuser les non essentiels",
                rejectNonEssentialButtonAccessibleLabel: "Refuser tous les cookies non essentiels",
                preferencesButtonText: "Préférences",
                preferencesButtonAccessibleLabel: "Ouvrir les préférences des cookies"
            },
            preferences: {
                title: "Personnalisez vos préférences en matière de cookies",
                description: "<p>Nous respectons votre droit à la vie privée. Vous pouvez choisir de ne pas autoriser certains types de cookies. Vos préférences s'appliqueront à l'ensemble du site.</p>",
                saveButtonText: "Enregistrer et fermer",
                saveButtonAccessibleLabel: "Enregistrer vos préférences en matière de cookies",
                creditLinkText: "Obtenez cette bannière gratuitement",
                creditLinkAccessibleLabel: "Obtenez cette bannière gratuitement"
            }
        },

        es: {
            essenziali: {
                label: "Esenciales",
                description: "<p>Cookies técnicas necesarias para el funcionamiento del sitio, como la memoria del idioma elegido y del código Premium activado. No se pueden desactivar.</p>"
            },
            statistiche: {
                label: "Estadísticas",
                description: "Estas cookies nos ayudan a entender cómo usan el sitio los visitantes, de forma agregada y anónima, para mejorar los contenidos de Amunì Tourism."
            },
            banner: {
                description: "<p>Amunì Tourism utiliza cookies para ofrecerte la mejor experiencia de navegación y analizar el tráfico del sitio de forma anónima. Puedes elegir cuáles aceptar.</p>",
                acceptAllButtonText: "Aceptar todas",
                acceptAllButtonAccessibleLabel: "Aceptar todas las cookies",
                rejectNonEssentialButtonText: "Rechazar las no esenciales",
                rejectNonEssentialButtonAccessibleLabel: "Rechazar todas las cookies no esenciales",
                preferencesButtonText: "Preferencias",
                preferencesButtonAccessibleLabel: "Abrir las preferencias de cookies"
            },
            preferences: {
                title: "Personaliza tus preferencias de cookies",
                description: "<p>Respetamos tu derecho a la privacidad. Puedes elegir no permitir algunos tipos de cookies. Tus preferencias se aplicarán a todo el sitio.</p>",
                saveButtonText: "Guardar y cerrar",
                saveButtonAccessibleLabel: "Guardar tus preferencias de cookies",
                creditLinkText: "Consigue este banner gratis",
                creditLinkAccessibleLabel: "Consigue este banner gratis"
            }
        },

        de: {
            essenziali: {
                label: "Notwendig",
                description: "<p>Technisch notwendige Cookies für den Betrieb der Website, etwa zum Speichern der gewählten Sprache und des aktivierten Premium-Codes. Sie können nicht deaktiviert werden.</p>"
            },
            statistiche: {
                label: "Statistik",
                description: "Diese Cookies helfen uns zu verstehen, wie Besucher die Website nutzen – in aggregierter und anonymer Form –, um die Inhalte von Amunì Tourism zu verbessern."
            },
            banner: {
                description: "<p>Amunì Tourism verwendet Cookies, um Ihnen das beste Surferlebnis zu bieten und den Website-Verkehr anonym zu analysieren. Sie können wählen, welche Sie akzeptieren.</p>",
                acceptAllButtonText: "Alle akzeptieren",
                acceptAllButtonAccessibleLabel: "Alle Cookies akzeptieren",
                rejectNonEssentialButtonText: "Nicht notwendige ablehnen",
                rejectNonEssentialButtonAccessibleLabel: "Alle nicht notwendigen Cookies ablehnen",
                preferencesButtonText: "Einstellungen",
                preferencesButtonAccessibleLabel: "Cookie-Einstellungen öffnen"
            },
            preferences: {
                title: "Cookie-Einstellungen anpassen",
                description: "<p>Wir respektieren Ihr Recht auf Privatsphäre. Sie können wählen, einige Arten von Cookies nicht zuzulassen. Ihre Einstellungen gelten für die gesamte Website.</p>",
                saveButtonText: "Speichern und schließen",
                saveButtonAccessibleLabel: "Cookie-Einstellungen speichern",
                creditLinkText: "Dieses Banner kostenlos erhalten",
                creditLinkAccessibleLabel: "Dieses Banner kostenlos erhalten"
            }
        }
    };

    // ----------------------------------------------------------------------
    // Quale lingua usare
    // ----------------------------------------------------------------------
    function linguaSalvata() {
        try {
            var s = localStorage.getItem("lang");
            if (LINGUE.indexOf(s) !== -1) return s;
        } catch (e) { /* memoria del browser non disponibile */ }
        return null;
    }

    function linguaDelBrowser() {
        var elenco = (navigator.languages && navigator.languages.length)
            ? navigator.languages : [navigator.language || ""];
        for (var i = 0; i < elenco.length; i++) {
            var codice = String(elenco[i]).toLowerCase().slice(0, 2);
            if (LINGUE.indexOf(codice) !== -1) return codice;
        }
        return null;
    }

    function sceltaLingua() {
        return linguaSalvata() || (USA_LINGUA_DEL_BROWSER ? linguaDelBrowser() : null) || "it";
    }

    var linguaCorrente = sceltaLingua();

    // ----------------------------------------------------------------------
    // Sostituisce i testi dentro la configurazione di Silktide (solo i testi:
    // script, eventi e funzioni onAccept restano esattamente come sono)
    // ----------------------------------------------------------------------
    function testiBanner(lingua) {
        var t = TESTI[lingua];
        return { banner: t.banner, prompt: t.banner, preferences: t.preferences };
    }

    function traduciConfigurazione(cfg, lingua) {
        var t = TESTI[lingua];
        if (!cfg || !t) return;

        (cfg.consentTypes || []).forEach(function (tipo) {
            var nuovo = (tipo.id === "essential") ? t.essenziali
                      : (tipo.id === "analytics") ? t.statistiche : null;
            if (nuovo) {
                tipo.label = nuovo.label;
                tipo.description = nuovo.description;
            }
        });

        cfg.text = cfg.text || {};
        var gruppi = testiBanner(lingua);
        ["banner", "prompt", "preferences"].forEach(function (g) {
            var base = cfg.text[g] || {};
            var sostituti = gruppi[g];
            for (var k in sostituti) base[k] = sostituti[k];
            cfg.text[g] = base;
        });
    }

    // ----------------------------------------------------------------------
    // Aggancio a Silktide: traduce la configurazione appena prima di avviarlo
    // ----------------------------------------------------------------------
    var gestore = window.silktideConsentManager;
    if (!gestore || typeof gestore.init !== "function") return; // nulla da fare: resta l'italiano

    var initOriginale = gestore.init;
    gestore.init = function (cfg) {
        try {
            if (linguaCorrente !== "it") traduciConfigurazione(cfg, linguaCorrente);
        } catch (e) { /* se qualcosa va storto resta l'italiano */ }
        var risultato = initOriginale.apply(this, arguments);
        osservaCambioLingua();
        return risultato;
    };

    // ----------------------------------------------------------------------
    // Se il visitatore cambia lingua mentre il banner è aperto, aggiorna i testi
    // ----------------------------------------------------------------------
    function aggiornaTesti(nuovaLingua) {
        if (nuovaLingua === linguaCorrente || !TESTI[nuovaLingua]) return;
        linguaCorrente = nuovaLingua;
        try {
            if (typeof gestore.update === "function") {
                gestore.update({ text: testiBanner(nuovaLingua) });
            }
        } catch (e) { /* al prossimo caricamento della pagina sarà comunque giusto */ }
    }

    var inOsservazione = false;
    function osservaCambioLingua() {
        if (inOsservazione) return;
        inOsservazione = true;
        function controlla() {
            var salvata = linguaSalvata();
            if (salvata) aggiornaTesti(salvata);
        }
        document.addEventListener("languageChanged", controlla);
        setInterval(controlla, 700);
    }
})();
