// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

// Inizializzazione mappa
const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpdzd1e3000m01qp1zly9qx9',
    center: [13.666, 37.933],
    zoom: 14
});

// Geolocalizzazione
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}));

map.on('load', () => {

    // ⭐ NASCONDI IL LAYER POI DI MAPBOX STUDIO
    try {
        map.setLayoutProperty('poi', 'visibility', 'none');
    } catch (e) {
        console.warn("Layer 'poi' non trovato nello stile (ok così).");
    }

    // ⭐ DEBUG PANEL
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'absolute';
    debugPanel.style.top = '10px';
    debugPanel.style.left = '10px';
    debugPanel.style.background = 'rgba(0,0,0,0.75)';
    debugPanel.style.color = '#00ff00';
    debugPanel.style.padding = '10px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.maxWidth = '90%';
    debugPanel.style.borderRadius = '8px';
    debugPanel.innerHTML = 'DEBUG PANEL<br>Avvio...';
    document.body.appendChild(debugPanel);

    function debug(msg, color = '#00ff00') {
        debugPanel.innerHTML += `<br><span style="color:${color}">${msg}</span>`;
    }

    debug("🔍 Avvio verifica caricamento...");

    // ⭐ Sorgente GeoJSON
    map.addSource('puntiAmuni', {
        type: 'geojson',
        data: 'data.geojson'
    });

    // ⭐ Test GeoJSON
    fetch('data.geojson')
        .then(response => {
            if (!response.ok) throw new Error(`❌ File GeoJSON non trovato (${response.status})`);
            debug("✅ File GeoJSON trovato");
            return response.json();
        })
        .then(data => debug(`📦 Numero punti: ${data.features.length}`))
        .catch(error => debug(error.message, '#ff4444'));

    // ⭐ Lista icone
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
        'leone_pub_icona',
        'ludoteca'
    ];

    // ⭐ Test icone
    icone.forEach(nome => {
        const url = `img/${nome}.png`;
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`❌ Icona mancante: ${url}`);
                debug(`✅ Icona trovata: ${url}`);
            })
            .catch(error => debug(error.message, '#ff4444'));
    });

    // ⭐ Offset centrati per icone 512×512
    const offsetPersonalizzato = {
        'castello_icona': [0, -40],
        'duomo_icona': [0, -40],
        'badia_icona': [0, -40],
        'annunziata': [0, -40],
        'san_domenico': [0, -40],
        'cappuccini': [0, -40],
        'chiesa': [0, -40],
        'ristorante_icona': [0, -40],
        'bar': [0, -40],
        'leone_pub_icona': [0, -40],
        'ludoteca': [0, -40]
    };

    // ⭐ Dimensioni calibrate per icona (512px)
    const dimensioniIcone = {
        'castello_icona': 0.22,
        'duomo_icona': 0.19,
        'badia_icona': 0.17,
        'annunziata': 0.17,
        'san_domenico': 0.17,
        'cappuccini': 0.17,
        'chiesa': 0.15,
        'ristorante_icona': 0.13,
        'bar': 0.12,
        'leone_pub_icona': 0.12,
        'ludoteca': 0.14
    };

    // ⭐ Caricamento icone
    let iconeCaricate = 0;

    icone.forEach(nome => {
        map.loadImage(`img/${nome}.png`, (error, image) => {
            if (error) {
                debug(`❌ Errore caricamento immagine: img/${nome}.png`, '#ff4444');
                return;
            }

            map.addImage(nome, image);
            debug(`🖼️ Icona registrata: ${nome}`);

            iconeCaricate++;

            if (iconeCaricate === icone.length) {

                debug("🎯 Tutte le icone registrate, aggiungo il layer...");

                // ⭐ LAYER POI PERSONALIZZATO (RINOMINATO)
                map.addLayer({
                    id: 'poi-github',
                    type: 'symbol',
                    source: 'puntiAmuni',
                    layout: {
                        'icon-image': ['get', 'icona'],

                        // ⭐ Dimensioni dinamiche
                        'icon-size': [
                            'match',
                            ['get', 'icona'],
                            'castello_icona', 0.22,
                            'duomo_icona', 0.19,
                            'badia_icona', 0.17,
                            'annunziata', 0.17,
                            'san_domenico', 0.17,
                            'cappuccini', 0.17,
                            'chiesa', 0.15,
                            'ristorante_icona', 0.13,
                            'bar', 0.12,
                            'leone_pub_icona', 0.12,
                            'ludoteca', 0.14,
                            0.20
                        ],

                        'icon-anchor': 'center',

                        // ⭐ Offset dinamico
                        'icon-offset': [
                            'match',
                            ['get', 'icona'],
                            'castello_icona', [0, -40],
                            'duomo_icona', [0, -40],
                            'badia_icona', [0, -40],
                            'annunziata', [0, -40],
                            'san_domenico', [0, -40],
                            'cappuccini', [0, -40],
                            'chiesa', [0, -40],
                            'ristorante_icona', [0, -40],
                            'bar', [0, -40],
                            'leone_pub_icona', [0, -40],
                            'ludoteca', [0, -40],
                            [0, -40]
                        ],

                        // ⭐ Rotazione dinamica
                        'icon-rotate': [
                            'case',
                            ['has', 'rotation'],
                            ['get', 'rotation'],
                            0
                        ],

                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true
                    }
                });

                debug("✅ Layer 'poi-github' aggiunto");
            }
        });
    });

    // ⭐ Popup
    map.on('click', 'poi-github', (e) => {
        const nome = e.features[0].properties.name;
        const address = e.features[0].properties.address;

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h3>${nome}</h3><p>${address}</p>`)
            .addTo(map);
    });

    // ⭐ Cursore
    map.on('mouseenter', 'poi-github', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'poi-github', () => {
        map.getCanvas().style.cursor = '';
    });

});
