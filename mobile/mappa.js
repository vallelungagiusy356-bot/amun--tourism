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

// Caricamento GeoJSON e icone
map.on('load', () => {

    // Sorgente GeoJSON
    map.addSource('puntiAmuni', {
        type: 'geojson',
        data: 'data.geojson'
    });

    // Lista delle icone da caricare
    const icone = [
        'castello_icona',
        'duomo_icona',
        'annunziata',
        'badia_icona',
        'cappuccini',
        'san_domenico',
        'chiesa',
        'bar',
        'ristorante_icona',
        'leone_pub_icona'
    ];

    // Caricamento automatico di tutte le icone
    icone.forEach(nome => {
        map.loadImage(`img/icons/${nome}.png`, (error, image) => {
            if (error) throw error;
            map.addImage(nome, image);
        });
    });

    // Layer con icone personalizzate
    map.addLayer({
        id: 'poi',
        type: 'symbol',
        source: 'puntiAmuni',
        layout: {
            'icon-image': ['get', 'icona'], // proprietà "icona" nel tuo GeoJSON
            'icon-size': 0.15,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true
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

    // Cambia il cursore quando si passa sopra un punto
    map.on('mouseenter', 'poi', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'poi', () => {
        map.getCanvas().style.cursor = '';
    });
});
