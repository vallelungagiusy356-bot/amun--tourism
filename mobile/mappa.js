// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpl4lr6n003401r63fof43dl',
    center: [13.666, 37.933],
    zoom: 14,
    pitch: 45,
    bearing: 0
});

// Funzione Motore 3D
function create3DLayer(id, modelUrl, coords, offset = {x: 0, y: 0}) {
    return {
        id: id,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            
            // Illuminazione ottimizzata per pietra/architettura
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
            this.scene.add(hemiLight);
            
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
            dirLight.position.set(50, 100, 50);
            this.scene.add(dirLight);

            new THREE.GLTFLoader().load(modelUrl, (gltf) => {
                const model = gltf.scene;
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.material = new THREE.MeshStandardMaterial({
                            color: 0xD2B48C,
                            metalness: 0.0,   
                            roughness: 0.9,   
                            side: THREE.DoubleSide
                        });
                        if (node.geometry) node.geometry.computeVertexNormals();
                    }
                });
                this.scene.add(model);
            });

            this.map = map;
            this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
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
    // Nascondi etichette di sistema per pulizia visiva
    try { map.setLayoutProperty('poi', 'visibility', 'none'); } catch (e) {}

    // Sorgente Linea Percorso
    map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }});
    map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#CDA843', 'line-width': 8, 'line-opacity': 0.9 }
    });

    fetch('data.geojson')
        .then(res => res.json())
        .then(data => {
            // Caricamento Modelli 3D
            data.features.forEach((feature, index) => {
                if (feature.properties.model) {
                    const offset = feature.properties.offset || {x: 0, y: 0};
                    map.addLayer(create3DLayer('3d-model-' + index, feature.properties.model, feature.geometry.coordinates, offset));
                }
            });

            // Caricamento Icone POI
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

    // Interazione Click
    map.on('click', 'poi-github', (e) => {
        const p = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        const userCoords = [map.getCenter().lng, map.getCenter().lat]; 
        
        map.getSource('route').setData({ 
            type: 'Feature', 
            geometry: { type: 'LineString', coordinates: [userCoords, coords] } 
        });

        map.flyTo({ center: coords, zoom: 16, pitch: 45 });

        new mapboxgl.Popup().setLngLat(coords).setHTML(`
            <div style="padding:5px; text-align:center;">
                <h3 style="font-family:'Cinzel', serif; color:#CDA843;">${p.name}</h3>
                <p style="font-size:12px;">${p.address || ''}</p>
            </div>
        `).addTo(map);
    });
});
