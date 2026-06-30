// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

// --- DEBUG GLOBALE ---
const debugPanel = document.createElement('div');
debugPanel.style.cssText = 'position:absolute; top:10px; left:10px; background:rgba(26,21,16,0.9); color:#CDA843; padding:10px; font-family:monospace; z-index:9999; border-radius:8px; border:1px solid #B48A1D; max-height: 80vh; overflow-y: auto;';
debugPanel.innerHTML = 'AMUNÌ TOURISM: System Ready';
document.body.appendChild(debugPanel);

function debug(msg) { 
    console.log(msg); 
    debugPanel.innerHTML += `<br>${msg}`; 
}

// Inizializzazione mappa
const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpl4lr6n003401r63fof43dl',
    center: [13.666, 37.933],
    zoom: 14,
    pitch: 45,
    bearing: 0
});

// Geolocalizzazione
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}));

// Funzione Motore per i Modelli 3D (CORRETTA)
function create3DLayer(id, modelUrl, coords, offset = {x: 0, y: 0}) {
    return {
        id: id,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
    
    // 1. AMBIENTALE FORTE: Schiarisce tutto uniformemente
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
    this.scene.add(ambientLight);
    
    // 2. LUCE PRINCIPALE (più morbida)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(100, 100, 100);
    this.scene.add(dirLight);

    // 3. FILL LIGHT (Illumina il lato buio con più forza)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-100, 50, -100);
    this.scene.add(fillLight);

    // 4. TOP LIGHT (Nuova! Colpisce i tetti dall'alto per evitare zone nere)
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 100, 0);
    this.scene.add(topLight);

    new THREE.GLTFLoader().load(modelUrl, (gltf) => {
        const model = gltf.scene;
        model.traverse((node) => {
            if (node.isMesh) {
                // MATERIALE SATINATO (meno specchio, più oro)
                node.material = new THREE.MeshStandardMaterial({
                    color: 0xFFD700,
                    metalness: 0.8,    // Leggermente ridotto per uniformare
                    roughness: 0.25,   // Aumentato per diffondere meglio la luce
                    emissive: 0x443300,// Bagliore più tenue
                    side: THREE.DoubleSide
                });
            }
        });
        this.scene.add(model);
    });

    this.map = map;
    this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(), context: gl, antialias: true
    });
    this.renderer.autoClear = false;
},

        render: function (gl, matrix) {
            const scaleFactor = 50; 
            const m = new THREE.Matrix4().fromArray(matrix);
            
            // Calcoliamo le coordinate con l'offset
            const merc = mapboxgl.MercatorCoordinate.fromLngLat(coords, 0);
            
            const l = new THREE.Matrix4()
                .makeTranslation(merc.x + offset.x, merc.y + offset.y, 0)
                .scale(new THREE.Vector3(
                    merc.meterInMercatorCoordinateUnits() * scaleFactor, 
                    -merc.meterInMercatorCoordinateUnits() * scaleFactor, 
                    merc.meterInMercatorCoordinateUnits() * scaleFactor
                ))
                .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2));
            
            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
}



// UNICO BLOCCO DI CARICAMENTO
map.on('load', () => {
    try { map.setLayoutProperty('poi', 'visibility', 'none'); } catch (e) {}
    // Aggiungi la sorgente e il layer per la linea del percorso
    map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
    });

    map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': '#CDA843', // Oro coerente col tema
            'line-width': 6,
            'line-opacity': 0.8
        }
    });

    fetch('data.geojson')
        .then(res => res.json())
        .then(data => {
            debug("✅ GeoJSON caricato.");
            
            // 1. Carica Modelli 3D
            data.features.forEach((feature, index) => {
                if (feature.properties.model) {
                    // Se nel GeoJSON esiste un offset, usalo, altrimenti usa {x:0, y:0}
                    const offset = feature.properties.offset || {x: 0, y: 0};
                    
                    map.addLayer(create3DLayer(
                        '3d-model-' + index, 
                        feature.properties.model, 
                        feature.geometry.coordinates,
                        offset
                    ));
                    debug(`🏗️ Caricato 3D: ${feature.properties.name}`);
                }
            });

            // 2. Carica Icone
            const icone = ['castello_icona', 'duomo_icona', 'annunziata', 'badia_icona', 'cappuccini', 'san_domenico', 'chiesa', 'bar', 'ristorante_icona', 'leone_pub_icona', 'ludoteca'];
            const promises = icone.map(nome => new Promise(resolve => {
                map.loadImage(`img/${nome}.png`, (err, img) => {
                    if (!err) map.addImage(nome, img);
                    resolve();
                });
            }));

            Promise.all(promises).then(() => {
                map.addLayer({
                    id: 'poi-github', type: 'symbol', source: { type: 'geojson', data: data },
                    layout: {
                        'icon-image': ['get', 'icona'],
                        'icon-size': 0.15,
                        'icon-allow-overlap': true
                    }
                });
                debug("🎯 Layer POI attivo.");
            });
        })
        .catch(err => debug(`❌ Errore: ${err.message}`));

    // Popup interattivi
    map.on('click', 'poi-github', (e) => {
        const p = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        new mapboxgl.Popup().setLngLat(coords).setHTML(`
            <div style="padding:5px;">
                <h3 style="font-family:'Cinzel';">${p.name}</h3>
                <p>${p.address || ''}</p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}&travelmode=walking" target="_blank">🚶 PORTAMI QUI</a>
            </div>
        `).addTo(map);
    });
});
