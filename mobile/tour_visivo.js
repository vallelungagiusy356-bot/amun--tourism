/* ============================================================
   TOUR VISIVO — Amunì Tourism
   La Castellana racconta un'opera e il quadro si sposta e si
   ingrandisce da solo sul dettaglio di cui sta parlando.

   OPERE CON LO ZOOM GUIDATO: Sacra Famiglia e San Rocco (Cappuccini), Miracolo di Sant'Isidoro e Affreschi del Coro (Duomo), le 6 opere di Santa Maria degli Angeli, le 6 opere della Badia e le 5 opere dell'Annunziata.
   ALTRE OPERE E TAPPE DEL CASTELLO: il quadro si apre comunque in alto e si ingrandisce con le dita. Solo italiano.
   Non modifica la chat, il backend né la knowledge base: si "aggancia"
   alla voce già esistente e riconosce l'opera dalla prima frase.

   Per aggiungere un'altra opera: copia un blocco dentro TOURS.
   ============================================================ */
(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. I DATI — qui si cambia tutto quello che riguarda le opere
  //
  // Ogni "cue" dice: quando la Castellana pronuncia una frase che
  // contiene la parola/espressione "parola", il quadro va su quel punto.
  //   x, y  = centro del dettaglio (0 = bordo sinistro/alto,
  //           1 = bordo destro/basso, 0.5 = metà)
  //   larg  = quanta larghezza del quadro vuoi vedere
  //           (1 = tutto, 0.5 = metà quadro, 0.3 = zoom forte)
  //   tutto = true -> torna a vedere il quadro intero
  //
  // Numeri calcolati guardando la foto: si possono affinare con ?zoomdebug=1.
  // ------------------------------------------------------------
  const TOURS = [
    {
      nome: 'Sacra Famiglia',
      // frase che identifica l'opera (minuscolo)
      riconosci: 'pala della cappella laterale sinistra',
      immagine: '../gallery-chiese/sacra_famiglia_cappuccini.jpg',
      cue: [
        { parola: "pala della cappella", tutto: true },
        { parola: "azzurro del manto", x: 0.440, y: 0.620, larg: 0.40 },
        { parola: "mani di sant'anna", x: 0.590, y: 0.640, larg: 0.36 },
        { parola: "bastone fiorito", x: 0.360, y: 0.270, larg: 0.28 },
        { parola: "vecchio seduto", x: 0.240, y: 0.740, larg: 0.44 },
        { parola: "bambino riccioluto", x: 0.350, y: 0.685, larg: 0.30 },
        { parola: "guardate i volti", x: 0.580, y: 0.480, larg: 0.55 },
        { parola: "vi va di vedere", tutto: true }
      ]
    },
    {
      nome: 'San Rocco',
      riconosci: "scultura in legno dipinto, opera di un maestro siciliano",
      immagine: '../gallery-chiese/san_rocco_di_montpeiler_cappuccini.jpg',
      cue: [
        { parola: "san rocco si riconosce", x: 0.500, y: 0.450, larg: 0.75 },
        { parola: "bastone del pellegrino", x: 0.330, y: 0.300, larg: 0.40 },
        { parola: "la mantellina", x: 0.460, y: 0.340, larg: 0.30 },
        { parola: "la piaga della peste", x: 0.620, y: 0.460, larg: 0.30 },
        { parola: "cagnolino", x: 0.455, y: 0.760, larg: 0.30 },
        { parola: "tozzo di pane", x: 0.500, y: 0.720, larg: 0.20 },
        { parola: "il cane", x: 0.460, y: 0.750, larg: 0.35 }
      ]
    },
    {
      nome: "Il Miracolo di Sant'Isidoro (Stomer)",
      riconosci: 'contadino spagnolo',
      immagine: '../gallery-chiese/stomer_sangiorgio_zoom.jpg',
      immagineAlt: '../gallery-chiese/stomer_sangiorgio.jpg',   // se manca la foto _zoom, usa questa
      cue: [
        { parola: "miracolo di sant'isidoro", x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'delle tele più importanti', x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'contadino spagnolo',        x: 0.33, y: 0.60, larg: 0.55 },
        { parola: 'bastone',                   x: 0.27, y: 0.74, larg: 0.55 },
        { parola: "fonte d'acqua",            x: 0.24, y: 0.80, larg: 0.45 },
        { parola: 'compagni assetati',         x: 0.68, y: 0.58, larg: 0.60 },
        { parola: 'luce drammatica',           x: 0.50, y: 0.31, larg: 0.70 },
        { parola: 'mani callose',              x: 0.42, y: 0.49, larg: 0.40 },
        { parola: 'volti segnati',             x: 0.68, y: 0.49, larg: 0.50 },
        { parola: 'madonna col bambino',       x: 0.64, y: 0.22, larg: 0.50 },
        { parola: 'vi va di vedere',           x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Gli Affreschi del Coro',
      riconosci: 'nella volta del coro',
      immagine: '../gallery-chiese/affreschi_presbiterio_sangiorgio_zoom.jpg',
      immagineAlt: '../gallery-chiese/affreschi_presbiterio_sangiorgio.jpg',   // se manca la foto _zoom, usa questa
      cue: [
        { parola: 'nella volta del coro',      x: 0.50, y: 0.45, larg: 1.00 },
        { parola: 'immacolata',                x: 0.40, y: 0.40, larg: 0.50 },
        { parola: "sull'altra nuvola",         x: 0.77, y: 0.27, larg: 0.50 },
        { parola: 'luce intensa',               x: 0.52, y: 0.27, larg: 0.80 },
        { parola: 'veduta del castello',       x: 0.80, y: 0.50, larg: 0.38 },
        { parola: 'san giorgio',               x: 0.56, y: 0.58, larg: 0.35 },
        { parola: 'compatroni',                x: 0.52, y: 0.64, larg: 0.95 },
        { parola: 'beato giovanni liccio',     x: 0.71, y: 0.61, larg: 0.28 },
        { parola: 'santa rosalia',             x: 0.79, y: 0.63, larg: 0.28 },
        { parola: 'san teotista',              x: 0.86, y: 0.65, larg: 0.28 },
        { parola: 'san rocco',                 x: 0.41, y: 0.61, larg: 0.28 },
        { parola: 'suor febronia',             x: 0.30, y: 0.62, larg: 0.28 },
        { parola: 'san nicasio',               x: 0.19, y: 0.65, larg: 0.28 },
        { parola: 'questi affreschi',          x: 0.50, y: 0.45, larg: 1.00 },
        { parola: 'vi va di vedere',           x: 0.50, y: 0.45, larg: 1.00 }
      ]
    },
    {
      nome: 'La Cappella delle Reliquie',
      riconosci: 'ricco reliquiario ligneo dorato',
      immagine: '../gallery-chiese/cappelladellerelique_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Il Martirio di San Sebastiano',
      riconosci: 'giuseppe velasco',
      immagine: '../gallery-chiese/martirio_sansebastiano_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Il Beato Giovanni Liccio',
      riconosci: 'carlo ameglio',
      immagine: '../gallery-chiese/beato_giovanni_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'La Cupola',
      riconosci: 'giovanni battista cascione',
      immagine: '../gallery-chiese/cupola_sangiorgio.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'La Porziuncola',
      riconosci: "grande tela dell'altare maggiore",
      immagine: '../gallery-chiese/pala_altare_cappuccini.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: "L'Adorazione dei Pastori",
      riconosci: 'gesù appena nato',
      immagine: '../gallery-chiese/adorazione_animesante.jpg',
      cue: [
        { parola: 'al centro, maria',   x: 0.41, y: 0.65, larg: 0.47 },
        { parola: 'san giuseppe',       x: 0.32, y: 0.54, larg: 0.43 },
        { parola: 'agnello',            x: 0.23, y: 0.71, larg: 0.40 },
        { parola: 'turbante giallo',    x: 0.76, y: 0.65, larg: 0.43 },
        { parola: 'gallo',              x: 0.56, y: 0.80, larg: 0.33 },
        { parola: 'in volo',            x: 0.46, y: 0.31, larg: 0.52 },
        { parola: 'vi va di vedere',    x: 0.50, y: 0.50, larg: 0.95 }
      ]
    },
    {
      nome: 'La Messa di Suffragio',
      riconosci: 'forza della preghiera per i defunti',
      immagine: '../gallery-chiese/messa_di_suffraggio_animesante.jpg',
      cue: [
        { parola: 'forza della preghiera', x: 0.53, y: 0.51, larg: 0.89 },
        { parola: 'sacerdote',             x: 0.42, y: 0.53, larg: 0.40 },
        { parola: 'paramenti rosa',        x: 0.43, y: 0.62, larg: 0.37 },
        { parola: 'chierichetto',          x: 0.27, y: 0.75, larg: 0.36 },
        { parola: 'due chierici',          x: 0.59, y: 0.72, larg: 0.40 },
        { parola: 'madonna',               x: 0.28, y: 0.24, larg: 0.37 },
        { parola: 'cristo',                x: 0.34, y: 0.18, larg: 0.36 },
        { parola: 'dio padre',             x: 0.68, y: 0.17, larg: 0.36 },
        { parola: 'colomba',               x: 0.53, y: 0.18, larg: 0.34 },
        { parola: 'un angelo solleva',     x: 0.68, y: 0.51, larg: 0.37 },
        { parola: 'tra le fiamme',         x: 0.80, y: 0.73, larg: 0.36 },
        { parola: 'vi va di vedere',       x: 0.53, y: 0.51, larg: 0.89 }
      ]
    },
    {
      nome: "L'Adorazione dell'Ostensorio",
      riconosci: "adorazione dell'ostensorio",
      immagine: '../gallery-chiese/adorazione_eucaristica_animesante.jpg',
      cue: [
        { parola: "l'ostensorio con l'ostia", x: 0.50, y: 0.20, larg: 0.50 },
        { parola: "santo vescovo", x: 0.26, y: 0.62, larg: 0.48 },
        { parola: "san francesco d'assisi", x: 0.72, y: 0.60, larg: 0.48 },
        { parola: "due putti", x: 0.50, y: 0.80, larg: 0.40 },
        { parola: "teschio", x: 0.76, y: 0.86, larg: 0.35 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "San Filippo Neri",
      riconosci: "siete davanti a san filippo neri",
      immagine: '../gallery-chiese/sanfilippo_animesante.jpg',
      cue: [
        { parola: "madonna con il bambino", x: 0.24, y: 0.17, larg: 0.45 },
        { parola: "camera da letto", x: 0.25, y: 0.80, larg: 0.50 },
        { parola: "imbarcazione", x: 0.75, y: 0.80, larg: 0.50 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "San Giovanni e l'Immacolata",
      riconosci: "san giovanni evangelista con l'immacolata",
      immagine: '../gallery-chiese/vergine_imm_animesante.jpg',
      cue: [
        { parola: "il giovane giovanni", x: 0.62, y: 0.58, larg: 0.60 },
        { parola: "libro sacro", x: 0.80, y: 0.64, larg: 0.35 },
        { parola: "la vergine immacolata", x: 0.30, y: 0.20, larg: 0.55 },
        { parola: "falce di luna", x: 0.22, y: 0.44, larg: 0.30 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "La Madonna del Carmelo",
      riconosci: "siete davanti alla madonna del carmelo",
      immagine: '../gallery-chiese/madonna_del_carmelo_animesante.jpg',
      cue: [
        { parola: "incoronata", x: 0.60, y: 0.22, larg: 0.55 },
        { parola: "giovanni della croce", x: 0.24, y: 0.56, larg: 0.45 },
        { parola: "un putto", x: 0.46, y: 0.78, larg: 0.42 },
        { parola: "una grande croce", x: 0.78, y: 0.62, larg: 0.45 },
        { parola: "vi va di vedere", x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Santa Maria: la Madonna degli Angeli',
      riconosci: 'opera del maestro fiorentino gregorio di lorenzo',
      immagine: '../gallery-chiese/madonna_angeli_santamaria.jpg',
      cue: [
        { parola: 'altorilievo in marmo',   x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'regge il bambino',       x: 0.50, y: 0.28, larg: 0.60 },
        { parola: 'un uomo tra le onde',    x: 0.20, y: 0.82, larg: 0.45 },
        { parola: 'figura demoniaca',       x: 0.43, y: 0.82, larg: 0.45 },
        { parola: 'veduta di una città',    x: 0.77, y: 0.82, larg: 0.45 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Santa Maria: la Madonna col Bambino (Gagini)',
      riconosci: 'opera di antonello gagini',
      immagine: '../gallery-chiese/madonna_gagini_santamaria.jpg',
      cue: [
        { parola: 'cappella del rosario',   x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'un panneggio',           x: 0.52, y: 0.42, larg: 0.40 },
        { parola: 'il bambino colto',       x: 0.56, y: 0.31, larg: 0.30 },
        { parola: 'alla base della statua', x: 0.52, y: 0.56, larg: 0.45 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Santa Maria: la Madonna Visita Poveri',
      riconosci: 'tela a olio del pittore manierista',
      immagine: '../gallery-chiese/madonna_visita_poveri_santamaria.jpg',
      cue: [
        { parola: 'tela a olio',            x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'la vergine con il bambino', x: 0.33, y: 0.37, larg: 0.45 },
        { parola: 'in ginocchio',           x: 0.60, y: 0.58, larg: 0.45 },
        { parola: 'cornice figurata',       x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'tondi e riquadri',       x: 0.21, y: 0.45, larg: 0.30 },
        { parola: 'i miracoli',             x: 0.80, y: 0.35, larg: 0.30 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Santa Maria: la Levitazione di San Giuseppe da Copertino',
      riconosci: 'aloisio rizzo',
      immagine: '../gallery-chiese/levitazione_sangiuseppe_santamaria.jpg',
      cue: [
        { parola: 'cappella del ss. crocifisso', x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'raffigura',              x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'levitazione',            x: 0.43, y: 0.24, larg: 0.45 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Santa Maria: la SS. Trinità con San Michele',
      riconosci: 'antonino spatafora',
      immagine: '../gallery-chiese/sstrinita_santamaria.jpg',
      cue: [
        { parola: 'registro superiore',     x: 0.52, y: 0.38, larg: 0.75 },
        { parola: 'registro inferiore',     x: 0.50, y: 0.65, larg: 0.95 },
        { parola: 'san michele arcangelo',  x: 0.26, y: 0.68, larg: 0.45 },
        { parola: 'beato giovanni liccio',  x: 0.60, y: 0.68, larg: 0.45 },
        { parola: 'andrea',                 x: 0.82, y: 0.62, larg: 0.40 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "Santa Maria: l'Urna del Beato Giovanni Liccio",
      riconosci: 'consacrata nella conformazione attuale',
      immagine: '../gallery-chiese/urna_beato_santamaria.jpg',
      cue: [
        { parola: 'urna reliquiario',       x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'resti mortali',          x: 0.50, y: 0.66, larg: 0.28 },
        { parola: 'figura in cera',         x: 0.50, y: 0.52, larg: 0.35 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Badia: il Pavimento in Maiolica',
      riconosci: '5.555 mattonelle maiolicate',
      immagine: '../gallery-chiese/pavimento_badia.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Badia: il Sacrificio di Isacco',
      riconosci: "sull'abside del presbiterio",
      immagine: '../gallery-chiese/sacrificio_isacco_badia.jpg',
      cue: [
        { parola: "sull'abside",            x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'abramo',                 x: 0.58, y: 0.24, larg: 0.55 },
        { parola: 'figlio isacco',          x: 0.46, y: 0.31, larg: 0.40 },
        { parola: "dall'angelo",            x: 0.47, y: 0.15, larg: 0.40 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Badia: San Benedetto, Mauro e Placido',
      riconosci: 'affresco più elaborato di tutta la badia',
      immagine: '../gallery-chiese/navata_sanben_badia.jpg',
      cue: [
        { parola: 'affresco più elaborato', x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'accoglienza',            x: 0.50, y: 0.46, larg: 0.55 },
        { parola: 'cornice dipinta',        x: 0.50, y: 0.66, larg: 0.55 },
        { parola: 'un piede',               x: 0.52, y: 0.78, larg: 0.40 },
        { parola: 'lancia',                 x: 0.45, y: 0.70, larg: 0.50 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Badia: la Madonna della Neve',
      riconosci: "pala d'altare di antonino spadafora",
      immagine: '../gallery-chiese/madonna_neve_badia.jpg',
      cue: [
        { parola: "pala d'altare",          x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'nuvole dorate',          x: 0.55, y: 0.33, larg: 0.85 },
        { parola: 'cherubini',              x: 0.80, y: 0.32, larg: 0.40 },
        { parola: 'la vergine siede',       x: 0.48, y: 0.37, larg: 0.55 },
        { parola: 'paesaggio di campagna',  x: 0.50, y: 0.67, larg: 0.55 },
        { parola: 'san lorenzo',            x: 0.20, y: 0.60, larg: 0.45 },
        { parola: 'santo stefano',          x: 0.82, y: 0.52, larg: 0.40 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Badia: San Benedetto indica la Regola',
      riconosci: 'attribuita a mariano rossi',
      immagine: '../gallery-chiese/sanbenedetto_regole_badia.jpg',
      cue: [
        { parola: 'tela del settecento',    x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'san benedetto avvolto',  x: 0.36, y: 0.23, larg: 0.55 },
        { parola: 'libro della regola',     x: 0.70, y: 0.21, larg: 0.35 },
        { parola: 'sovrano',                x: 0.25, y: 0.52, larg: 0.50 },
        { parola: 'monache',                x: 0.72, y: 0.45, larg: 0.50 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: 'Badia: il Crocifisso',
      riconosci: 'francesco quaresima',
      immagine: '../gallery-chiese/crocifisso_badia.jpg',
      cue: [
        { parola: 'firmata e datata',       x: 0.50, y: 0.50, larg: 1.00 },
        { parola: 'cristo crocifisso',      x: 0.55, y: 0.30, larg: 0.60 },
        { parola: 'a sinistra san benedetto', x: 0.27, y: 0.44, larg: 0.45 },
        { parola: 'santa scolastica',       x: 0.78, y: 0.48, larg: 0.40 },
        { parola: 'vi va di vedere',        x: 0.50, y: 0.50, larg: 1.00 }
      ]
    },
    {
      nome: "Annunziata: il Crocifisso e l'Addolorata",
      riconosci: "tutto giocato sul bianco e sull'oro",
      immagine: "../gallery-chiese/crocifisso_annunziata.jpg",
      cue: [
        { parola: "grande insieme scultoreo", tutto: true },
        { parola: "il cristo crocifisso", x: 0.500, y: 0.470, larg: 0.55 },
        { parola: "la croce scura", x: 0.500, y: 0.410, larg: 0.45 },
        { parola: "due angioletti", x: 0.500, y: 0.500, larg: 0.75 },
        { parola: "madonna addolorata", x: 0.500, y: 0.665, larg: 0.45 },
        { parola: "mani giunte", x: 0.535, y: 0.650, larg: 0.22 },
        { parola: "spada dorata", x: 0.550, y: 0.620, larg: 0.22 },
        { parola: "piccolo angelo", x: 0.560, y: 0.700, larg: 0.22 },
        { parola: "a sinistra una figura", x: 0.150, y: 0.590, larg: 0.33 },
        { parola: "benda sugli occhi", x: 0.860, y: 0.590, larg: 0.33 },
        { parola: "due angeli seduti", x: 0.500, y: 0.200, larg: 0.70 },
        { parola: "uno con una croce", x: 0.270, y: 0.180, larg: 0.40 },
        { parola: "dei putti", x: 0.500, y: 0.290, larg: 1.00 }
      ]
    },
    {
      nome: "Annunziata: Santa Rosalia Pellegrina",
      riconosci: "decorata con motivi floreali",
      immagine: "../gallery-chiese/santa_rosalia_annunziata.jpg",
      cue: [
        { parola: "ricca cornice", x: 0.500, y: 0.560, larg: 1.00 },
        { parola: "una giovane donna", x: 0.500, y: 0.500, larg: 0.42 },
        { parola: "corona di fiori", x: 0.490, y: 0.425, larg: 0.22 },
        { parola: "braccia sono incrociate", x: 0.510, y: 0.505, larg: 0.24 },
        { parola: "il volto", x: 0.490, y: 0.445, larg: 0.20 },
        { parola: "manto verde oliva", x: 0.520, y: 0.580, larg: 0.34 },
        { parola: "sandali", x: 0.520, y: 0.715, larg: 0.25 },
        { parola: "due angeli", x: 0.500, y: 0.630, larg: 0.62 },
        { parola: "quello a sinistra", x: 0.335, y: 0.640, larg: 0.30 },
        { parola: "quello a destra", x: 0.670, y: 0.620, larg: 0.30 },
        { parola: "figura della vergine", x: 0.330, y: 0.430, larg: 0.26 },
        { parola: "sullo sfondo a destra", x: 0.680, y: 0.500, larg: 0.32 },
        { parola: "piccola costruzione", x: 0.680, y: 0.478, larg: 0.16 }
      ]
    },
    {
      nome: "Annunziata: l'Immacolata",
      riconosci: "statua policroma, custodita",
      immagine: "../gallery-chiese/immacolata_annunziata.jpg",
      cue: [
        { parola: "statua policroma", tutto: true },
        { parola: "velo bianco", x: 0.500, y: 0.290, larg: 0.45 },
        { parola: "volto sereno", x: 0.500, y: 0.300, larg: 0.28 },
        { parola: "mani sono giunte", x: 0.640, y: 0.385, larg: 0.35 },
        { parola: "raggiera dorata", x: 0.500, y: 0.280, larg: 0.50 },
        { parola: "veste dorata", x: 0.500, y: 0.440, larg: 0.50 },
        { parola: "manica argentata", x: 0.530, y: 0.430, larg: 0.30 },
        { parola: "cintura argento", x: 0.500, y: 0.457, larg: 0.35 },
        { parola: "ampio manto blu", x: 0.450, y: 0.560, larg: 0.80 },
        { parola: "stelle dorate", x: 0.400, y: 0.520, larg: 0.45 },
        { parola: "i piedi poggiano", x: 0.550, y: 0.780, larg: 0.40 },
        { parola: "quattro testine", x: 0.500, y: 0.800, larg: 0.70 }
      ]
    },
    {
      nome: "Annunziata: la Cupola e il Presbiterio",
      riconosci: "la luce dorata di questo presbiterio",
      immagine: "../gallery-chiese/cupola_volta_annunziata.jpg",
      cue: [
        { parola: "alzate lo sguardo", tutto: true },
        { parola: "nella cupola", x: 0.510, y: 0.290, larg: 0.85 },
        { parola: "nei pennacchi", x: 0.500, y: 0.400, larg: 1.00 },
        { parola: "secondo le fonti", x: 0.510, y: 0.310, larg: 0.90 },
        { parola: "lampadario di cristallo", x: 0.520, y: 0.460, larg: 0.85 },
        { parola: "drappi rossi", x: 0.500, y: 0.760, larg: 0.70 },
        { parola: "croce rossa", x: 0.510, y: 0.830, larg: 0.30 },
        { parola: "statua in piedi", x: 0.500, y: 0.875, larg: 0.28 },
        { parola: "raggiera d'oro", x: 0.510, y: 0.740, larg: 0.40 },
        { parola: "una vetrata", x: 0.500, y: 0.680, larg: 0.30 }
      ]
    },
    {
      nome: "Annunziata: l'Organo",
      riconosci: "trovate l'organo a canne",
      immagine: "../gallery-chiese/organo_annunziata.jpg",
      cue: [
        { parola: "l'organo a canne", tutto: true },
        { parola: "ditta schimicci", x: 0.500, y: 0.560, larg: 0.95 },
        { parola: "cassa antica", x: 0.500, y: 0.550, larg: 0.85 },
        { parola: "aperture a punta", x: 0.500, y: 0.500, larg: 0.42 },
        { parola: "canne alte e argentate", x: 0.500, y: 0.580, larg: 1.00 },
        { parola: "un drappo giallo e rosso", x: 0.500, y: 0.820, larg: 0.70 },
        { parola: "piccola vetrata", x: 0.560, y: 0.300, larg: 0.30 }
      ]
    },
    {
      nome: "Castello: l'ingresso",
      riconosci: "salite la rampa cordonata",
      immagine: '../gallery-chiese/cordata_princi_castello.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: "Castello: Ala Prades",
      riconosci: "siete nell'ala prades",
      immagine: '../gallery-chiese/ingresso_ala_prades.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    },
    {
      nome: 'Castello: Gran Corte',
      riconosci: 'siete nella gran corte',
      immagine: '../gallery-chiese/ingresso_grancorte_castello.jpg',
      cue: []
    },
    {
      nome: 'Castello: la Cappella',
      riconosci: 'siete nella cappella di corte',
      immagine: '../gallery-chiese/cappella_castello.jpg',
      cue: []
    },
    {
      nome: 'Castello: le Prigioni',
      riconosci: 'siete nelle prigioni del castello',
      immagine: '../gallery-chiese/entrata_prig_castello.jpg',
      cue: [
        { parola: 'catena', immagine: '../gallery-chiese/interno_prig_castello.jpg' }
      ]
    },
    {
      nome: "Castello: la Terrazza",
      riconosci: "siete sulla terrazza degli impiccati",
      immagine: '../gallery-chiese/panorama_terr_castello.jpg',
      cue: []   // nessun movimento automatico: si ingrandisce con le dita
    }
  ];

  const DEBUG = new URLSearchParams(location.search).has('zoomdebug');
  const OSD_URL = 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js';
  const MS_PER_CARATTERE = 70; // velocità media della voce, per i cue a metà frase

  // ------------------------------------------------------------
  // 2. STILE E CONTENITORE DEL QUADRO (creati da qui, niente da
  //    aggiungere alla pagina)
  // ------------------------------------------------------------
  const stile = document.createElement('style');
  stile.textContent = `
    #tour-viewer { display:none; position:fixed; top:0; left:0; right:0; height:58vh;
      background:#0f1922; z-index:999990; border-bottom:1px solid #B8873B; }
    body.tour-attivo #tour-viewer { display:block; }
    body.tour-attivo .chat-mobile { height:42vh !important; }
    #tour-viewer-img { width:100%; height:100%; }
    #tour-viewer-close { position:absolute; z-index:5; right:10px;
      top:calc(env(safe-area-inset-top, 0px) + 10px);
      width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
      background:rgba(15,25,34,0.75); color:#F3ECDC; font-size:1rem; }
    #tour-hint { position:absolute; z-index:5; left:50%; bottom:12px; transform:translateX(-50%);
      padding:6px 12px; border-radius:999px; background:rgba(15,25,34,0.75); color:#F3ECDC;
      font-size:0.8rem; opacity:0; pointer-events:none; transition:opacity .5s; }
    #tour-hint.visibile { opacity:1; }
    /* tablet: il quadro resta largo quanto la pagina e la chat (480 px), centrato */
    @media (min-width:560px) {
      #tour-viewer { left:50%; right:auto; width:480px; max-width:100%; transform:translateX(-50%); }
    }
    #tour-debug { position:absolute; z-index:5; left:8px; bottom:8px; padding:5px 9px;
      border-radius:6px; background:rgba(0,0,0,0.75); color:#D4AF6A;
      font:600 0.8rem monospace; display:none; }
  `;
  document.head.appendChild(stile);

  const box = document.createElement('div');
  box.id = 'tour-viewer';
  box.innerHTML =
    '<div id="tour-viewer-img"></div>' +
    '<button id="tour-viewer-close" aria-label="Chiudi il quadro">✕</button>' +
    '<div id="tour-hint">🔍 Pizzica per ingrandire</div>' +
    '<div id="tour-debug"></div>';
  document.body.appendChild(box);

  const boxImg = box.querySelector('#tour-viewer-img');
  const boxDebug = box.querySelector('#tour-debug');
  const boxHint = box.querySelector('#tour-hint');
  let timerHint = null;
  function mostraHint() {
    boxHint.classList.add('visibile');
    clearTimeout(timerHint);
    timerHint = setTimeout(function () { boxHint.classList.remove('visibile'); }, 4500);
  }
  if (DEBUG) boxDebug.style.display = 'block';

  // ------------------------------------------------------------
  // 3. CARICAMENTO DI OPENSEADRAGON (solo quando serve)
  // ------------------------------------------------------------
  let osdPromise = null;
  function caricaOSD() {
    if (window.OpenSeadragon) return Promise.resolve();
    if (!osdPromise) {
      osdPromise = new Promise(function (ok, ko) {
        const s = document.createElement('script');
        s.src = OSD_URL;
        s.onload = ok;
        s.onerror = function () { osdPromise = null; ko(new Error('OpenSeadragon non caricato')); };
        document.head.appendChild(s);
      });
    }
    return osdPromise;
  }

  // ------------------------------------------------------------
  // 4. APRIRE / CHIUDERE IL QUADRO E SPOSTARE L'INQUADRATURA
  // ------------------------------------------------------------
  let viewer = null;
  let tourAttivo = null;
  let cuePendente = null;
  let timers = [];

  // quanto resta inquadrato un dettaglio prima di tornare alla visione intera
  const HOLD_MS = 6500;
  let timerHold = null;

  function fermaTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(timerHold);
  }

  // torna alla visione intera del quadro
  function tornaPanoramica() {
    if (viewer && viewer.world.getItemCount()) viewer.viewport.goHome();
  }

  function chiudiTour() {
    fermaTimers();
    tourAttivo = null;
    boxHint.classList.remove('visibile');
    cuePendente = null;
    document.body.classList.remove('tour-attivo');
    if (viewer) { try { viewer.destroy(); } catch (e) {} viewer = null; }
  }

  function aspetto() {
    const s = viewer.world.getItemAt(0).getContentSize();
    return s.y / s.x;
  }

  function mostraDebug() {
    if (!DEBUG || !viewer || !viewer.world.getItemCount()) return;
    const c = viewer.viewport.getCenter(true);
    const txt = 'x: ' + c.x.toFixed(2) + ', y: ' + (c.y / aspetto()).toFixed(2) +
                ', larg: ' + (1 / viewer.viewport.getZoom(true)).toFixed(2);
    boxDebug.textContent = txt;
    console.log('[tour] ' + txt);
  }

  function applicaCue(c) {
    if (!viewer || !viewer.world.getItemCount()) { cuePendente = c; return; }
    if (c.immagine) {
      cuePendente = { tutto: true };
      viewer.open({ type: 'image', url: c.immagine });
      return;
    }
    const vp = viewer.viewport;
    clearTimeout(timerHold);
    if (c.tutto) { vp.goHome(); return; }
    vp.panTo(new OpenSeadragon.Point(c.x, c.y * aspetto()));
    vp.zoomTo(1 / c.larg);
    // dopo un po' si torna alla visione intera, se non arriva un altro dettaglio
    timerHold = setTimeout(tornaPanoramica, HOLD_MS);
  }

  async function apriTour(tour) {
    chiudiTour();
    tourAttivo = tour;
    document.body.classList.add('tour-attivo');
    try {
      await caricaOSD();
    } catch (e) {
      console.error(e);
      chiudiTour();
      return;
    }
    if (tourAttivo !== tour) return; // nel frattempo è stato chiuso

    viewer = OpenSeadragon({
      element: boxImg,
      prefixUrl: '',
      tileSources: { type: 'image', url: tour.immagine },
      showNavigationControl: false,
      animationTime: 1.6,
      minZoomImageRatio: 0.9,
      maxZoomPixelRatio: 3,
      visibilityRatio: 0.6,
      gestureSettingsTouch: { clickToZoom: false, flickEnabled: false },
      gestureSettingsMouse: { clickToZoom: false }
    });
    viewer.addHandler('open', function () {
      if (!tour.cue.length) mostraHint();
      if (cuePendente) { const c = cuePendente; cuePendente = null; applicaCue(c); }
      mostraDebug();
    });
    let provataAlt = false;
    viewer.addHandler('open-failed', function () {
      if (tour.immagineAlt && !provataAlt) {
        provataAlt = true;
        console.warn('Foto non trovata, provo quella di riserva:', tour.immagine);
        viewer.open({ type: 'image', url: tour.immagineAlt });
        return;
      }
      console.error('Immagine non trovata:', tour.immagine);
      chiudiTour();
    });
    viewer.addHandler('animation-finish', mostraDebug);
  }

  box.querySelector('#tour-viewer-close').addEventListener('click', chiudiTour);

  // ------------------------------------------------------------
  // 5. AGGANCIO ALLA VOCE: ogni volta che la Castellana inizia a
  //    leggere una frase, controlliamo se contiene un "cue".
  // ------------------------------------------------------------
  function trovaTour(testoMinuscolo) {
    return TOURS.find(function (t) { return testoMinuscolo.indexOf(t.riconosci) !== -1; }) || null;
  }

  function sulParlato(utt) {
    const testo = (utt.text || '').toLowerCase();
    fermaTimers();

    // se l'utente ha chiuso il quadro e riascolta, lo riapriamo alla prima frase
    const t = trovaTour(testo);
    if (t && tourAttivo !== t) apriTour(t);
    if (!tourAttivo) return;

    const rate = utt.rate || 1;
    let nellaFrase = false;
    tourAttivo.cue.forEach(function (c) {
      const i = testo.indexOf(c.parola);
      if (i === -1) return;
      nellaFrase = true;
      const ritardo = i < 8 ? 0 : Math.round(i * MS_PER_CARATTERE / rate);
      if (ritardo === 0) applicaCue(c);
      else timers.push(setTimeout(function () { applicaCue(c); }, ritardo));
    });
    // frase senza nessun dettaglio da mostrare: si torna alla visione intera
    if (!nellaFrase && tourAttivo.cue.length) timers.push(setTimeout(tornaPanoramica, 700));
  }

  if ('speechSynthesis' in window) {
    const speakOriginale = window.speechSynthesis.speak;
    window.speechSynthesis.speak = function (utt) {
      try { utt.addEventListener('start', function () { sulParlato(utt); }); } catch (e) {}
      // quando la Castellana smette di parlare (o la voce viene interrotta) il quadro torna intero
      const alFine = function () {
        if (tourAttivo && tourAttivo.cue.length) timers.push(setTimeout(tornaPanoramica, 1500));
      };
      try { utt.addEventListener('end', alFine); utt.addEventListener('error', alFine); } catch (e) {}
      return speakOriginale.call(window.speechSynthesis, utt);
    };
  }

  // ------------------------------------------------------------
  // 6. APRIRE IL QUADRO QUANDO ARRIVA LA RISPOSTA (anche a voce
  //    spenta) e chiuderlo quando si passa ad altro
  // ------------------------------------------------------------
  const messaggi = document.getElementById('chat-messages-mobile');
  if (messaggi) {
    new MutationObserver(function (mutazioni) {
      mutazioni.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (!n.classList || !n.classList.contains('message-mobile')) return;
          if (n.classList.contains('user-msg-mobile')) return;
          const t = trovaTour(n.textContent.toLowerCase());
          if (t) { if (tourAttivo !== t) apriTour(t); }
          else if (tourAttivo) chiudiTour();
        });
      });
    }).observe(messaggi, { childList: true });
  }

  const chiudiChat = document.getElementById('close-chat-mobile');
  if (chiudiChat) chiudiChat.addEventListener('click', chiudiTour);
})();
