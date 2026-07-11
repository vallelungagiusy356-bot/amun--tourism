// TOKEN Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2l1c2lmaTg5IiwiYSI6ImNtcGNvYXpqYTAwZ3kzNHM5amI4emxxOTAifQ.iNuDFyanN-ZEyl8-zRevGw';

// ============================================================
// FOCUS DA CHAT — legge ?focus=NOME dall'indirizzo della pagina
// (es. mappa.html?focus=castello, generato dal pulsante "Apri la
// Mappa" nelle schede monumento e, in futuro, dai pulsanti "dove
// si trova" della chat sul sito desktop).
// ============================================================
const urlParams = new URLSearchParams(window.location.search);
const focusParam = urlParams.get('focus');

// Ponte tra lo slug usato nei link (es. "castello") e il nome
// esatto del monumento così com'è scritto in data.geojson.
// Se in futuro aggiungi altri monumenti con un modello 3D,
// aggiungi qui la riga corrispondente.
const FOCUS_TO_NAME = {
    castello: "Castello di Caccamo",
    badia: "Chiesa di San Benedetto alla Badia",
    santamaria: "Chiesa Santa Maria degli Angeli",
    sangiorgio: "Duomo di San Giorgio Martire",
    annunziata: "Parrocchia SS. Annunziata",
    cappuccini: "Convento dei Cappuccini"
};

// Centro del borgo, usato per capire se il turista è già nei
// dintorni di Caccamo oppure la sta guardando da lontano (es. da
// casa, prima ancora di partire per il viaggio).
const CACCAMO_CENTER = [13.666, 37.933];
const RAGGIO_VICINANZA_KM = 15;

const map = new mapboxgl.Map({
    container: 'mappa',
    style: 'mapbox://styles/giusifi89/cmpl4lr6n003401r63fof43dl',
    center: [13.666, 37.933],
    zoom: 14,
    pitch: 45,
    bearing: 0
});

// ============================================================
// CONTROLLI MAPPA — zoom/bussola, geolocalizzazione, ricerca indirizzo
// ============================================================
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
});
map.addControl(geolocateControl, 'top-right');

// Il pulsantino di geolocalizzazione predefinito (in alto a destra)
// finiva sotto il pannello di ricerca. Lo nascondiamo e lo spostiamo
// dentro il campo "Punto di partenza", come fa Google Maps: è lì che
// serve davvero, non in un angolo separato.
const nascondiGeolocateDefault = document.createElement('style');
nascondiGeolocateDefault.textContent = `.mapboxgl-ctrl-geolocate { display: none !important; }`;
document.head.appendChild(nascondiGeolocateDefault);

// ============================================================
// RICERCA PARTENZA/DESTINAZIONE — due campi come su Maps, invece
// di una singola barra che localizza un solo punto senza generare
// un percorso.
// ============================================================
let originOverrideCoords = null; // impostata solo se l'utente scrive una partenza a mano
let lastDestination = null;      // ultima destinazione cercata o cliccata

const searchPanel = document.createElement('div');
searchPanel.id = 'pannello-ricerca';
searchPanel.style.cssText = `
    position: absolute; top: 16px; left: 16px; z-index: 6;
    display: flex; flex-direction: column; gap: 6px; max-width: 280px;
`;
document.body.appendChild(searchPanel);

// IMPORTANTE: ogni campo ha bisogno di "position: relative" — è
// quello che permette al menu dei suggerimenti di comparire subito
// sotto il campo giusto, invece di posizionarsi rispetto al pannello
// intero (che è quello che causava i suggerimenti "invisibili").
const originContainer = document.createElement('div');
originContainer.style.cssText = 'position: relative; display: flex; align-items: center; gap: 6px;';
const destContainer = document.createElement('div');
destContainer.style.cssText = 'position: relative;';
searchPanel.appendChild(originContainer);
searchPanel.appendChild(destContainer);

if (typeof MapboxGeocoder !== 'undefined') {
    const geocoderOrigin = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: { color: '#1B4965' },
        placeholder: 'Punto di partenza (o usa GPS)',
        language: 'it',
        countries: 'it',
        proximity: { longitude: CACCAMO_CENTER[0], latitude: CACCAMO_CENTER[1] }
    });
    geocoderOrigin.addTo(originContainer);
    geocoderOrigin.on('result', (e) => {
        originOverrideCoords = e.result.center;
        if (lastDestination) drawFullRoute();
    });
    geocoderOrigin.on('clear', () => { originOverrideCoords = null; });

    // Pulsante "usa la mia posizione", accanto al campo Partenza.
    const useMyLocationBtn = document.createElement('button');
    useMyLocationBtn.innerHTML = '📍';
    useMyLocationBtn.title = 'Usa la mia posizione';
    useMyLocationBtn.style.cssText = `
        flex-shrink: 0; width: 34px; height: 34px; border: none; border-radius: 2px;
        background: #1B4965; color: #EFE6D3; font-size: 1rem; cursor: pointer;
    `;
    originContainer.appendChild(useMyLocationBtn);
    useMyLocationBtn.addEventListener('click', () => {
        originOverrideCoords = null; // usa il GPS, non un indirizzo scritto a mano
        geolocateControl.trigger();
        showLocationPrompt();
    });

    const geocoderDestination = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: { color: '#C1622D' },
        placeholder: 'Dove vuoi andare?',
        language: 'it',
        countries: 'it',
        proximity: { longitude: CACCAMO_CENTER[0], latitude: CACCAMO_CENTER[1] }
    });
    geocoderDestination.addTo(destContainer);
    geocoderDestination.on('result', (e) => {
        lastDestination = e.result.center;
        map.flyTo({ center: lastDestination, zoom: 16 });
        drawFullRoute();
    });
} else {
    console.warn('MapboxGeocoder non è caricato: mancano lo script/CSS del plugin in mappa.html.');
}

// Disegna il percorso tra partenza (scritta a mano, o GPS se vuota)
// e l'ultima destinazione cercata. Se non c'è né una partenza scritta
// né una posizione GPS nota, la chiede prima di procedere.
function drawFullRoute() {
    const origin = originOverrideCoords || userLocation;
    if (!origin) {
        pendingRouteTarget = lastDestination;
        showLocationPrompt();
        return;
    }
    drawRouteBetween(origin, lastDestination);
}


// ============================================================
// POSIZIONE UTENTE E PERCORSI REALI
// ============================================================
let userLocation = null;      // [lng, lat] dell'utente, appena disponibile
let pendingRouteTarget = null; // coordinate del monumento in attesa della posizione

function haversineKm(a, b) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // raggio terrestre in km
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

// ============================================================
// BANNER "Attiva la mia posizione" — richiede un tocco reale
// dell'utente: i browser bloccano l'attivazione automatica via
// codice per motivi di privacy.
// ============================================================
function showLocationPrompt() {
    const existing = document.getElementById('banner-posizione');
    if (existing) return; // già visibile, non serve un secondo banner

    const banner = document.createElement('div');
    banner.id = 'banner-posizione';
    banner.style.cssText = `
        position: absolute; left: 50%; top: 16px; transform: translateX(-50%);
        z-index: 5; background: rgba(15,25,34,0.92); color: #EFE6D3;
        border: 1px solid #B8873B; border-radius: 4px; padding: 10px 16px;
        font-family: sans-serif; font-size: 0.85rem; display: flex;
        align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 90%;
    `;
    banner.innerHTML = `
        <span>📍 Attiva la tua posizione per orientarti</span>
        <button id="btn-attiva-posizione" style="
            background:#B8873B; color:#14283A; border:none; border-radius:2px;
            padding:6px 12px; font-weight:600; cursor:pointer; white-space:nowrap;
        ">Attiva</button>
        <button id="btn-chiudi-banner" style="
            background:transparent; color:#EFE6D3; border:none;
            font-size:1rem; cursor:pointer; padding:0 2px;
        ">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('btn-attiva-posizione').addEventListener('click', () => {
        const btn = document.getElementById('btn-attiva-posizione');
        btn.textContent = 'Ricerca in corso…';
        btn.disabled = true;
        geolocateControl.trigger();
    });
    document.getElementById('btn-chiudi-banner').addEventListener('click', () => {
        banner.remove();
    });
}

// Chiamata quando la posizione arriva davvero: chiude il banner
// (se presente) e sblocca eventuali percorsi in attesa.
function removeLocationPrompt() {
    const banner = document.getElementById('banner-posizione');
    if (banner) banner.remove();
}

// Messaggio quando il turista guarda la mappa da lontano (non è
// ancora arrivato a Caccamo): niente percorso assurdo attraverso
// mezza Italia, solo un avviso gentile.
function showFarAwayMessage() {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%);
        z-index: 5; background: rgba(15,25,34,0.92); color: #EFE6D3;
        border: 1px solid #B8873B; border-radius: 4px; padding: 10px 16px;
        font-family: sans-serif; font-size: 0.85rem; max-width: 85%; text-align: center;
    `;
    msg.textContent = 'Sembra che tu non sia ancora nei dintorni di Caccamo. Quando arriverai, la mappa ti guiderà passo passo fino al monumento!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 5000);
}

// Chiede il percorso reale (a piedi, lungo le vie) tra due punti
// qualsiasi tramite il servizio Direzioni di Mapbox, e lo disegna
// sulla mappa insieme a tempo e distanza stimati.
async function drawRouteBetween(originCoords, destCoords) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (!json.routes || !json.routes[0]) return;

        const route = json.routes[0];
        map.getSource('route').setData({ type: 'Feature', geometry: route.geometry });

        const coords = route.geometry.coordinates;
        const bounds = coords.reduce(
            (b, c) => b.extend(c),
            new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.fitBounds(bounds, { padding: 70 });

        showRouteInfo(route.duration, route.distance);
    } catch (err) {
        console.warn('Errore nel calcolo del percorso:', err);
    }
}

// Mostra tempo (a piedi) e distanza del percorso appena calcolato,
// in un piccolo pannello in basso. Si aggiorna da solo se calcoli
// un nuovo percorso, invece di accumularne diversi in pagina.
function showRouteInfo(durationSeconds, distanceMeters) {
    const minuti = Math.max(1, Math.round(durationSeconds / 60));
    const km = (distanceMeters / 1000).toFixed(distanceMeters >= 1000 ? 1 : 2);

    let box = document.getElementById('info-percorso');
    if (!box) {
        box = document.createElement('div');
        box.id = 'info-percorso';
        box.style.cssText = `
            position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%);
            z-index: 5; background: rgba(15,25,34,0.92); color: #EFE6D3;
            border: 1px solid #B8873B; border-radius: 4px; padding: 8px 16px;
            font-family: sans-serif; font-size: 0.9rem; font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(box);
    }
    box.textContent = `🚶 ${minuti} min a piedi · ${km} km`;
}

// Punto d'ingresso per "portami lì" dalla mappa (click su un
// monumento, o arrivo da un link "dove si trova"): usa sempre la
// posizione GPS come partenza. Se non c'è ancora, la chiede e
// ricorda la meta per dopo; se il turista è lontano da Caccamo,
// avvisa invece di disegnare un percorso senza senso.
function requestRouteTo(destCoords) {
    lastDestination = destCoords;
    if (!userLocation) {
        pendingRouteTarget = destCoords;
        showLocationPrompt();
        return;
    }
    if (haversineKm(userLocation, CACCAMO_CENTER) > RAGGIO_VICINANZA_KM) {
        showFarAwayMessage();
        return;
    }
    drawRouteBetween(userLocation, destCoords);
}

geolocateControl.on('geolocate', (position) => {
    userLocation = [position.coords.longitude, position.coords.latitude];
    removeLocationPrompt();
    if (pendingRouteTarget) {
        const target = pendingRouteTarget;
        pendingRouteTarget = null;
        requestRouteTo(target);
    }
});

geolocateControl.on('error', (err) => {
    const btn = document.getElementById('btn-attiva-posizione');
    if (btn) {
        btn.textContent = 'Riprova';
        btn.disabled = false;
    } else {
        showLocationPrompt();
    }
    console.warn('Errore geolocalizzazione (controlla che il GPS sia attivo sul telefono):', err);
});

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
// Il modello viene agganciato all'elevazione reale del terreno
// tramite map.queryTerrainElevation(), invece di restare fisso
// a quota 0. Questo risolve il problema degli edifici che
// "galleggiano" sopra o sotto il livello del suolo nelle zone
// collinari.
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

            const elevation = this.map.queryTerrainElevation(coords) || 0;
            const merc = mapboxgl.MercatorCoordinate.fromLngLat(coords, elevation);

            const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
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

// ============================================================
// Vola sul monumento richiesto (?focus=...) e mostra un popup,
// esattamente come quando lo si tocca a mano sulla mappa.
// Restituisce le coordinate del monumento trovato, o null.
// ============================================================
function flyToFocusedMonument(data) {
    if (!focusParam || !FOCUS_TO_NAME[focusParam]) return null;

    const targetName = FOCUS_TO_NAME[focusParam];
    const targetFeature = data.features.find(f => f.properties.name === targetName);
    if (!targetFeature) return null;

    const coords = targetFeature.geometry.coordinates;

    map.flyTo({ center: coords, zoom: 17, pitch: 60 });

    new mapboxgl.Popup({ className: 'popup-medievale' }).setLngLat(coords).setHTML(`
        <div style="padding:5px; text-align:center;">
            <h3 style="font-family:'Cinzel', serif; color:#CDA843;">${targetFeature.properties.name}</h3>
            <p style="font-size:12px;">${targetFeature.properties.address || ''}</p>
        </div>
    `).addTo(map);

    return coords;
}

map.on('load', () => {
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
        paint: { 'line-color': '#CDA843', 'line-width': 6, 'line-opacity': 0.9 }
    });

    // Il banner compare sempre all'apertura della mappa, non solo
    // quando si arriva da un monumento specifico: è comodo per
    // orientarsi anche quando si guarda la mappa in generale.
    showLocationPrompt();

    fetch('data.geojson')
        .then(res => res.json())
        .then(data => {
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

            // Se siamo arrivati da un pulsante "dove si trova" / "Apri la
            // Mappa" con un monumento specifico, voliamo lì e proviamo
            // subito a disegnare il percorso reale (se la posizione è
            // già nota, o appena diventa disponibile).
            const focusedCoords = flyToFocusedMonument(data);
            if (focusedCoords) {
                requestRouteTo(focusedCoords);
            }
        });

    map.on('click', 'poi-github', (e) => {
        const p = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates;

        map.flyTo({ center: coords, zoom: 16, pitch: 45 });

        new mapboxgl.Popup({ className: 'popup-medievale' }).setLngLat(coords).setHTML(`
            <div style="padding:5px; text-align:center;">
                <h3 style="font-family:'Cinzel', serif; color:#CDA843;">${p.name}</h3>
                <p style="font-size:12px;">${p.address || ''}</p>
            </div>
        `).addTo(map);

        requestRouteTo(coords);
    });
});
