// Inserisci qui il tuo token Mapbox
mapboxgl.accessToken = 'INSERISCI_IL_TUO_TOKEN_MAPBOX';

// Inizializzazione mappa
const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/tuo-username/tuo-style-id', 
    center: [13.666, 37.933], // Caccamo
    zoom: 14
});

// Caricamento GeoJSON
map.on('load', () => {
    map.addSource('puntiAmuni', {
        type: 'geojson',
        data: 'data/punti.json' // <-- il tuo file GeoJSON
    });

    // Layer dei punti
    map.addLayer({
        id: 'poi',
        type: 'circle',
        source: 'puntiAmuni',
        paint: {
            'circle-radius': 8,
            'circle-color': '#d4a056',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#5a3e1b'
        }
    });

    // Popup al click
    map.on('click', 'poi', (e) => {
        const nome = e.features[0].properties.nome;
        const descrizione = e.features[0].properties.descrizione;

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${nome}</h3><p>${descrizione}</p>`)
            .addTo(map);
    });
});
