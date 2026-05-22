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

map.on('load', () => {

    // Sorgente GeoJSON (corretto)
    map.addSource('puntiAmuni', {
        type: 'geojson',
        data: 'data.geojson'
    });

    console.log("🔍 Avvio verifica caricamento...");

// Test 1: verifica file GeoJSON
fetch('data.geojson')
  .then(response => {
    if (!response.ok) throw new Error(`❌ File GeoJSON non trovato (${response.status})`);
    console.log("✅ File GeoJSON trovato e accessibile");
    return response.json();
  })
  .then(data => {
    console.log(`📦 Numero di punti caricati: ${data.features.length}`);
  })
  .catch(error => console.error(error));

// Test 2: verifica icone
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

icone.forEach(nome => {
  const url = `img/${nome}.png`;
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`❌ Icona mancante: ${url}`);
      console.log(`✅ Icona caricata: ${url}`);
    })
    .catch(error => console.error(error));
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

    let iconeCaricate = 0;

    // Caricamento automatico di tutte le icone
    icone.forEach(nome => {
        map.loadImage(`img/${nome}.png`, (error, image) => {
            if (error) throw error;
            map.addImage(nome, image);

            iconeCaricate++;

            // Quando tutte le icone sono caricate → aggiungi il layer
            if (iconeCaricate === icone.length) {

                map.addLayer({
                    id: 'poi',
                    type: 'symbol',
                    source: 'puntiAmuni',
                    layout: {
                        'icon-image': ['get', 'icona'],
                        'icon-size': 0.15,
                        'icon-anchor': 'bottom',
                        'icon-allow-overlap': true
                    }
                });

                // Popup al click
                map.on('click', 'poi', (e) => {
                    const nome = e.features[0].properties.name;
                    const address = e.features[0].properties.address;

                    new mapboxgl.Popup()
                        .setLngLat(e.lngLat)
                        .setHTML(`<h3>${nome}</h3><p>${address}</p>`)
                        .addTo(map);
                });

                // Cursore interattivo
                map.on('mouseenter', 'poi', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'poi', () => {
                    map.getCanvas().style.cursor = '';
                });
            }
        });
    });
});
