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

// ============================================================
// CONTROLLI MAPPA — zoom/bussola + geolocalizzazione
// ============================================================
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}), 'top-right');

// ============================================================
// Funzione Motore 3D
// options può contenere:
//   - scale: numero, default 50. Più alto = modello più grande.
//   - rotation: gradi (0-360), default 0. Ruota il modello per
//     allinearlo alle vie reali sulla mappa.
//   - offset: {x, y} per spostamenti fini in metri mercatore.
//   - tint: colore esadecimale opzionale (es. "#D2B48C"). Se
//     omesso, il modello mantiene i suoi colori/texture originali.
//
// NOVITÀ: il modello viene ora agganciato all'elevazione reale
// del terreno tramite map.queryTerrainElevation(), invece di
// restare fisso a quota 0. Questo risolve il problema degli
// edifici che "galleggiano" sopra o sotto il livello del suolo
// nelle zone collinari.
// ============================================================
function create3DLayer(id, modelUrl, coords, options = {}) {
    const offset = options.offset || { x: 0, y: 0 };
    const scale = options.scale || 50;
    const rotationDeg = options.rotation || 0;
    const tint = options.tint || null;

    return {
        id: id,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
            this.scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
            dirLight.position.set(50, 100, 50);
            this.scene.add(dirLight);

            new THREE.GLTFLoader().load(modelUrl, (gltf) => {
                const model = gltf.scene;
                model.traverse((node) => {
                    if (node.isMesh) {
                        if (node.material) {
                            if (tint) {
                                node.material.color = new THREE.Color(tint);
                            }
                            node.material.roughness = 0.85;
                            node.material.metalness = 0.05;
                            node.material.side = THREE.DoubleSide;
                        }
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
            const m = new THREE.Matrix4().fromArray(matrix);

            // Elevazione reale del terreno in quel punto (metri).
            // Se il DEM non è ancora caricato, queryTerrainElevation
            // può restituire null: in quel caso si usa 0 come fallback,
            // e il repaint successivo correggerà comunque la quota.
            const elevation = this.map.queryTerrainElevation(coords) || 0;
            const merc = mapboxgl.MercatorCoordinate.fromLngLat(coords, elevation);

            // Conversione fissa da Y-up (formato glTF) a Z-up (formato Mapbox)
            const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            // Rotazione regolabile per allineare l'edificio alle vie reali
            const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(rotationDeg));

            const l = new THREE.Matrix4()
                .makeTranslation(merc.x + offset.x, merc.y + offset.y, merc.z)
                .scale(new THREE.Vector3(
                    merc.meterInMercatorCoordinateUnits() * scale,
                    -merc.meterInMercatorCoordinateUnits() * scale,
                    merc.meterInMercatorCoordinateUnits() * scale
                ))
                .multiply(rotationX)
                .multiply(rotationY);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
}

map.on('load', () => {
    // ============================================================
    // TERRENO 3D — aggancia l'intera mappa (e di conseguenza i calcoli
    // di elevazione usati da create3DLayer) al DEM reale di Mapbox.
    // Senza questo, queryTerrainElevation() restituirebbe sempre 0/null.
    // ============================================================
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.0 });

    try { map.setLayoutProperty('poi', 'visibility', 'none'); } catch (e) {}

    map.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
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
            // Caricamento Modelli 3D — legge scale/rotation/tint
            // per ogni monumento, se presenti nel geojson
            data.features.forEach((feature, index) => {
                if (feature.properties.model) {
                    map.addLayer(create3DLayer(
                        '3d-model-' + index,
                        feature.properties.model,
                        feature.geometry.coordinates,
                        {
                            offset: feature.properties.offset || { x: 0, y: 0 },
                            scale: feature.properties.scale,
                            rotation: feature.properties.rotation,
                            tint: feature.properties.tint
                        }
                    ));
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
                    id: 'poi-github',
                    type: 'symbol',
                    source: { type: 'geojson', data: data },
                    layout: {
                        'icon-image': ['get', 'icona'],
                        'icon-size': 0.15,
                        'icon-allow-overlap': true,
                        'text-field': ['get', 'name'],
                        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                        'text-size': 12,
                        'text-offset': [0, 1.3],
                        'text-anchor': 'top',
                        'text-allow-overlap': false
                    },
                    paint: {
                        'text-color': '#4a3b2a',
                        'text-halo-color': '#f7f2e8',
                        'text-halo-width': 1.4
                    }
                });
            });
        });

    map.on('click', 'poi-github', (e) => {
        const p = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;
        const userCoords = [map.getCenter().lng, map.getCenter().lat];

        map.getSource('route').setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [userCoords, coords] }
        });

        map.flyTo({ center: coords, zoom: 16, pitch: 45 });

        new mapboxgl.Popup({ className: 'popup-medievale' }).setLngLat(coords).setHTML(`
            <div style="padding:5px; text-align:center;">
                <h3 style="font-family:'Cinzel', serif; color:#CDA843;">${p.name}</h3>
                <p style="font-size:12px;">${p.address || ''}</p>
            </div>
        `).addTo(map);
    });
});
