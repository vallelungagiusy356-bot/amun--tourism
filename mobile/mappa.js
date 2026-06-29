// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

// --- DEBUG GLOBALE (Spostato fuori così funziona ovunque) ---
const debugPanel = document.createElement('div');
debugPanel.style.cssText = 'position:absolute; top:10px; left:10px; background:rgba(26,21,16,0.9); color:#CDA843; padding:10px; font-family:monospace; z-index:9999; border-radius:8px; border:1px solid #B48A1D; max-height: 80vh; overflow-y: auto;';
debugPanel.innerHTML = 'AMUNÌ TOURISM: System Ready';
document.body.appendChild(debugPanel);

function debug(msg) { 
    console.log(msg); 
    debugPanel.innerHTML += `<br>${msg}`; 
}
// -----------------------------------------------------------

const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpl4lr6n003401r63fof43dl',
    center: [13.666, 37.933],
    zoom: 14,
    pitch: 45,
    bearing: 0
});

function create3DLayer(id, modelUrl, coords) {
    return {
        id: id,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);
            this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));

            new THREE.GLTFLoader().load(modelUrl, (gltf) => {
                const model = gltf.scene;

                // Debug Dimensioni
                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                box.getSize(size);
                debug(`📏 ${id}: ${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}`);

                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: 0xD4AF37, metalness: 0.9, roughness: 0.1
                        });
                    }
                });
                this.scene.add(model);
            }, undefined, (err) => debug(`❌ Errore caricamento ${id}`));

            this.map = map;
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(), context: gl, antialias: true
            });
            this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
            // PROVA A CAMBIARE QUESTO VALORE (es. 10, 50, 100)
            const scaleFactor = 50; 
            
            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(mapboxgl.MercatorCoordinate.fromLngLat(coords, 0).x, mapboxgl.MercatorCoordinate.fromLngLat(coords, 0).y, 0)
                .scale(new THREE.Vector3(
                    mapboxgl.MercatorCoordinate.fromLngLat(coords, 0).meterInMercatorCoordinateUnits() * scaleFactor, 
                    -mapboxgl.MercatorCoordinate.fromLngLat(coords, 0).meterInMercatorCoordinateUnits() * scaleFactor, 
                    mapboxgl.MercatorCoordinate.fromLngLat(coords, 0).meterInMercatorCoordinateUnits() * scaleFactor
                ))
                .multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2));
            
            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
}

map.on('load', () => {
    try { map.setLayoutProperty('poi', 'visibility', 'none'); } catch (e) {}

    fetch('data.geojson')
        .then(res => res.json())
        .then(data => {
            debug("✅ GeoJSON caricato.");
            data.features.forEach((feature, index) => {
                if (feature.properties.model) {
                    map.addLayer(create3DLayer('3d-model-' + index, feature.properties.model, feature.geometry.coordinates));
                    debug(`🏗️ Inserito layer 3D: ${feature.properties.name}`);
                }
            });
        });
});


    // Debug Panel
    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = 'position:absolute; top:10px; left:10px; background:rgba(26,21,16,0.9); color:#CDA843; padding:10px; font-family:monospace; z-index:9999; border-radius:8px; border:1px solid #B48A1D;';
    debugPanel.innerHTML = 'AMUNÌ TOURISM: System Ready';
    document.body.appendChild(debugPanel);

    function debug(msg) { debugPanel.innerHTML += `<br>${msg}`; }

    // Caricamento Dati
    fetch('data.geojson')
        .then(res => res.json())
        .then(data => {
            debug("✅ GeoJSON caricato.");
            
            // INIEZIONE MODELLI 3D (Cicla nel GeoJSON e cerca la proprietà 'model')
            data.features.forEach((feature, index) => {
                if (feature.properties.model) {
                    map.addLayer(create3DLayer(
                        '3d-model-' + index, 
                        feature.properties.model, 
                        feature.geometry.coordinates
                    ));
                    debug(`🏗️ Caricato 3D: ${feature.properties.name}`);
                }
            });

            // Caricamento Icone 2D
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
            });
        })
        .catch(err => debug(`❌ Errore: ${err.message}`));

    // Popup interattivi
    map.on('click', 'poi-github', (e) => {
        const p = e.features[0].properties;
        new mapboxgl.Popup().setLngLat(e.features[0].geometry.coordinates).setHTML(`
            <div style="padding:5px;">
                <h3 style="font-family:'Cinzel';">${p.name}</h3>
                <p>${p.address || ''}</p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=$${e.features[0].geometry.coordinates[1]},${e.features[0].geometry.coordinates[0]}&travelmode=walking" target="_blank">🚶 PORTAMI QUI</a>
            </div>
        `).addTo(map);
    });
});
