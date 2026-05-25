// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

// Inizializzazione mappa con NUOVO STILE A CONTRASTO
const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpl4lr6n003401r63fof43dl', // AGGIORNATO CON SUCCESSO
    center: [13.666, 37.933], // Coordinate di Caccamo
    zoom: 14,
    pitch: 45, // Inclinazione della visuale per godere dell'effetto dei futuri monumenti 3D
    bearing: 0
});

// Geolocalizzazione
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}));

// ==========================================
// CONFIGURAZIONE SEGNAPOSTO MONUMENTI 3D REALI
// ==========================================
const monumenti3DConfig = [
    { id: 'castello', name: 'Castello di Caccamo', coords: [13.6648, 37.9317], model: 'models/castello.glb', scale: 1.0 },
    { id: 'duomo', name: 'Duomo di San Giorgio', coords: [13.6657, 37.9311], model: 'models/duomo.glb', scale: 1.0 },
    { id: 'annunziata', name: 'Chiesa dell\'Annunziata', coords: [13.6641, 37.9331], model: 'models/annunziata.glb', scale: 1.0 },
    { id: 'badia', name: 'Chiesa delle Anime Sante (Badia)', coords: [13.6663, 37.9305], model: 'models/badia.glb', scale: 1.0 },
    { id: 'cappuccini', name: 'Convento dei Cappuccini', coords: [13.6691, 37.9288], model: 'models/cappuccini.glb', scale: 1.0 },
    { id: 'san_domenico', name: 'Chiesa di San Domenico', coords: [13.6675, 37.9322], model: 'models/san_domenico.glb', scale: 1.0 }
];

map.on('load', () => {

    // Nascondi i layer POI standard per evitare sovrapposizioni
    try {
        map.setLayoutProperty('poi', 'visibility', 'none');
    } catch (e) {
        console.warn("Layer 'poi' non trovato nello stile (ok così).");
    }

    // ⭐ PANEL DEBUG RIGENERATO
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'absolute';
    debugPanel.style.top = '10px';
    debugPanel.style.left = '10px';
    debugPanel.style.background = 'rgba(26, 21, 16, 0.9)'; // Coordinato con lo stile seppia
    debugPanel.style.color = '#CDA843'; // Testo oro antico
    debugPanel.style.padding = '10px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.maxWidth = '90%';
    debugPanel.style.borderRadius = '8px';
    debugPanel.style.border = '1px solid #B48A1D';
    debugPanel.innerHTML = 'AMUNÌ TOURISM DEBUG PANEL<br>Inizializzazione logica...';
    document.body.appendChild(debugPanel);

    function debug(msg, color = '#CDA843') {
        debugPanel.innerHTML += `<br><span style="color:${color}">${msg}</span>`;
    }

    debug("🔍 Avvio verifica sorgenti dati...");

    // Sorgente GeoJSON per punti d'interesse minori, bar, fermate bus
    map.addSource('puntiAmuni', {
        type: 'geojson',
        data: 'data.geojson'
    });

    // SISTEMATO ERRORE DI SINTASSI QUI (Aggiunta parentesi graffa di chiusura)
    fetch('data.geojson')
        .then(response => {
            if (!response.ok) throw new Error(`❌ File GeoJSON non trovato (${response.status})`);
            debug("✅ File GeoJSON trovato con successo.");
            return response.json();
        })
        .then(data => debug(`📦 Punti interattivi caricati: ${data.features.length}`))
        .catch(error => debug(error.message, '#ff4444'));

    // Lista icone bidimensionali per la mappa
    const icone = [
        'castello_icona', 'duomo_icona', 'annunziata', 'badia_icona',
        'cappuccini', 'san_domenico', 'chiesa', 'bar',
        'ristorante_icona', 'leone_pub_icona', 'ludoteca'
    ];

    let iconeCaricate = 0;

    icone.forEach(nome => {
        map.loadImage(`img/${nome}.png`, (error, image) => {
            if (error) {
                debug(`❌ Impossibile trovare l'icona: img/${nome}.png`, '#ff4444');
                return;
            }

            map.addImage(nome, image);
            iconeCaricate++;

            if (iconeCaricate === icone.length) {
                debug("🎯 Tutte le icone 2D registrate. Genero i layer grafici...");

                map.addLayer({
                    id: 'poi-github',
                    type: 'symbol',
                    source: 'puntiAmuni',
                    layout: {
                        'icon-image': ['get', 'icona'],
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
                        'icon-rotate': ['case', ['has', 'rotation'], ['get', 'rotation'], 0],
                        'icon-rotation-alignment': 'map',
                        'icon-allow-overlap': true
                    }
                });

                debug("✅ Layer 'poi-github' agganciato ed attivo.");
            }
        });
    });

    // ===================================================
    // INIEZIONE DEI MODELLI 3D REALI (Custom Layer Three.js)
    // ===================================================
    debug("🏗️ Configurazione layer 3D per monumenti reali in corso...");
    
    monumenti3DConfig.forEach(monumento => {
        const modelOrigin = monumento.coords;
        const modelAltitude = 0;
        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: Math.PI / 2,
            rotateY: 0,
            rotateZ: 0,
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * monumento.scale
        };

        const THREE = window.THREE;

        if (THREE) {
            const customLayer = {
                id: `3d-model-${monumento.id}`,
                type: 'custom',
                renderingMode: '3d',
                onAdd: function (map, gl) {
                    this.camera = new THREE.Camera();
                    this.scene = new THREE.Scene();

                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                    directionalLight.position.set(0, -70, 100).normalize();
                    this.scene.add(directionalLight);

                    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
                    this.scene.add(ambientLight);

                    const loader = new THREE.GLTFLoader();
                    loader.load(monumento.model, (gltf) => {
                        const model = gltf.scene;
                        
                        model.traverse((node) => {
                            if (node.isMesh) {
                                node.material = new THREE.MeshStandardMaterial({
                                    color: 0xD4AF37, 
                                    metalness: 0.9,
                                    roughness: 0.1
                                });
                            }
                        });
                        
                        this.scene.add(model);
                        debug(`[3D] Caricato modello reale per: ${monumento.name}`);
                    }, undefined, (error) => {
                        console.log(`Segnaposto 3D pronto per: ${monumento.id} (In attesa del file .glb)`);
                    });

                    this.map = map;
                    this.renderer = new THREE.WebGLRenderer({
                        canvas: map.getCanvas(),
                        context: gl,
                        antialiasing: true
                    });
                    this.renderer.autoClear = false;
                },
                render: function (gl, matrix) {
                    const rotationX = new THREE.Matrix4().makeRotationX(modelTransform.rotateX);
                    const rotationY = new THREE.Matrix4().makeRotationY(modelTransform.rotateY);
                    const rotationZ = new THREE.Matrix4().makeRotationZ(modelTransform.rotateZ);

                    const m = new THREE.Matrix4().fromArray(matrix);
                    const l = new THREE.Matrix4()
                        .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                        .scale(new THREE.Vector3(modelTransform.scale, modelTransform.scale, modelTransform.scale))
                        .multiply(rotationX)
                        .multiply(rotationY)
                        .multiply(rotationZ);

                    this.camera.projectionMatrix = m.multiply(l);
                    this.renderer.resetState();
                    this.renderer.render(this.scene, this.camera);
                    this.map.triggerRepaint();
                }
            };
            map.addLayer(customLayer);
        } else {
            console.warn("Three.js non rilevato nella pagina. Spazio geometrico pronto per i monumenti 3D.");
        }
    });

    // ==========================================
    // INTERATTIVITÀ POPUP CON FUNZIONE "PORTAMI QUI"
    // ==========================================
    map.on('click', 'poi-github', (e) => {
        const properties = e.features[0].properties;
        const nome = properties.name || "Punto di Interesse";
        const address = properties.address || "Centro Storico, Caccamo";
        
        const coordinatePunto = e.features[0].geometry.coordinates;
        const lng = coordinatePunto[0];
        const lat = coordinatePunto[1];

        const urlNavigatore = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

        new mapboxgl.Popup({ offset: [0, -30], className: 'popup-medievale' })
            .setLngLat(coordinatePunto)
            .setHTML(`
                <div style="font-family: 'Cormorant Garamond', serif; padding: 5px;">
                    <h3 style="margin: 0 0 5px 0; color: #1A1510; font-size: 16px; font-weight: bold;">${nome}</h3>
                    <p style="margin: 0 0 10px 0; color: #5C4A33; font-size: 13px; font-style: italic;">${address}</p>
                    <a href="${urlNavigatore}" target="_blank" rel="noopener noreferrer" 
                       style="display: block; text-align: center; background: #1A1510; color: #D4AF37; 
                              padding: 8px 12px; border: 1px solid #B48A1D; border-radius: 4px; 
                              text-decoration: none; font-weight: bold; font-size: 12px; 
                              transition: background 0.3s;">
                       🚶 PORTAMI QUI
                    </a>
                </div>
            `)
            .addTo(map);
    });

    map.on('mouseenter', 'poi-github', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'poi-github', () => { map.getCanvas().style.cursor = ''; });
});
