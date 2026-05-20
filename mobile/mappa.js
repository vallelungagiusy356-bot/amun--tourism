// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

// Inizializzazione mappa
const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpdzd1e3000m01qp1zly9qx9',
    center: [13.666, 37.933], // Caccamo
    zoom: 14
});

// Geolocalizzazione "Tu sei qui"
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}));

// Caricamento GeoJSON
map.on('load', () => {

    // Sorgente GeoJSON
    map.addSource('puntiAmuni', {
        type: 'geojson',
        data: 'data/punti.json' // <-- il tuo file GeoJSON
    });

    // Layer dei punti (temporaneo, poi lo sostituiremo con icone)
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
