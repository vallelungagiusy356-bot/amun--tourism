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

const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpl4lr6n003401r63fof43dl',
    center: [13.666, 37.933],
    zoom: 14,
    pitch: 45,
    bearing: 0
});

map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}));

// Funzione Motore 3D - Setup "Effetto Pietra Storica"
function create3DLayer(id, modelUrl, coords, offset = {x: 0, y: 0}) {
    return {
        id: id,
        type: 'custom',
        renderingMode: '3d',
                onAdd: function (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            
            // 1. LUCI: Sostituiamo AmbientLight con HemisphereLight
            // Questo crea profondità: luce "cielo" dall'alto e luce "terra" dal basso
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
            this.scene.add(hemiLight);
            
            // Directional light: manteniamola per creare ombre marcate
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
            dirLight.position.set(100, 100, 100);
            this.scene.add(dirLight);

            // 2. MATERIALE: "Pietra Calda" (color calcarenite)
            new THREE.GLTFLoader().load(modelUrl, (gltf) => {
                const model = gltf.scene;
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: 0xD2B48C,  // COLORE: Beige Sabbia/Pietra (si intona alla mappa)
                            metalness: 0.0,   
                            roughness: 1.2,   
                            side: THREE.DoubleSide
                        });
                        
                        if (node.geometry) {
                            node.geometry.computeVertexNormals();
                        }
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

map.on('load', () => {
    try { map.setLayoutProperty('poi', 'visibility', 'none'); } catch (e) {}

    map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }});
    map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#CDA843', 'line-width': 6, 'line-opacity': 0.8 }
    });

    fetch('data.geojson')
        .then(res => res.json())
        .then(data => {
            data.features.forEach((feature, index) => {
                if (feature.properties.model) {
                    const offset = feature.properties.offset || {x: 0, y: 0};
                    map.addLayer(create3DLayer('3d-model-' + index, feature.properties.model, feature.geometry.coordinates, offset));
                }
            });

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
                    layout: { 'icon-image': ['get', 'icona'], 'icon-size': 0.15, 'icon-allow-overlap': true }
                });
            });
        });

    map.on('click', 'poi-github', (e) => {
        const p = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        const userCoords = map.getCenter(); 
        map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[userCoords.lng, userCoords.lat], coords] } });
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}&travelmode=walking`;
        new mapboxgl.Popup().setLngLat(coords).setHTML(`
            <div style="padding:5px;">
                <h3 style="font-family:'Cinzel';">${p.name}</h3>
                <p>${p.address || ''}</p>
                <a href="${mapsUrl}" target="_blank" style="text-decoration:none; color:#CDA843; font-weight:bold;">🚶 PORTAMI QUI</a>
            </div>
        `).addTo(map);
    });
});
