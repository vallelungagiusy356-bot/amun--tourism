// ===============================
// MAPPA LEAFLET – CACCAMO
// ===============================

// Crea la mappa centrata su Caccamo
const map = L.map('mappa').setView([37.9324, 13.6610], 16);

// Aggiunge il layer di base OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// ===============================
// DEFINIZIONE ICONE PERSONALIZZATE
// ===============================

const iconaCastello = L.icon({
  iconUrl: 'img/castello.svg',
  iconSize: [42, 42],
  iconAnchor: [21, 42]
});

const iconaChiesa = L.icon({
  iconUrl: 'img/chiesa.svg',
  iconSize: [38, 38],
  iconAnchor: [19, 38]
});

const iconaConvento = L.icon({
  iconUrl: 'img/convento.svg',
  iconSize: [38, 38],
  iconAnchor: [19, 38]
});

const iconaRistorante = L.icon({
  iconUrl: 'img/ristorante.svg',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

const iconaBar = L.icon({
  iconUrl: 'img/bar.svg',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

const iconaPub = L.icon({
  iconUrl: 'img/pub.svg',
  iconSize: [34, 34],
  iconAnchor: [17, 34]
});

const iconaLudoteca = L.icon({
  iconUrl: 'img/ludoteca.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// ===============================
// CARICAMENTO GEOJSON
// ===============================

fetch("data.geojson")
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      
      // Scegli l’icona in base al tipo
      pointToLayer: (feature, latlng) => {
        const tipo = feature.properties.type;

        if (tipo === "castello") return L.marker(latlng, { icon: iconaCastello });
        if (tipo === "chiesa") return L.marker(latlng, { icon: iconaChiesa });
        if (tipo === "convento") return L.marker(latlng, { icon: iconaConvento });
        if (tipo === "ristorante") return L.marker(latlng, { icon: iconaRistorante });
        if (tipo === "bar") return L.marker(latlng, { icon: iconaBar });
        if (tipo === "pub") return L.marker(latlng, { icon: iconaPub });
        if (tipo === "ludoteca") return L.marker(latlng, { icon: iconaLudoteca });

        // fallback: cerchio oro
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#d4a64a",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9
        });
      },

      // Popup con nome + indirizzo + telefono se presente
      onEachFeature: (feature, layer) => {
        const p = feature.properties;

        let popup = `<b>${p.name}</b>`;
        if (p.address) popup += `<br><small>${p.address}</small>`;
        if (p.phone) popup += `<br><small>📞 ${p.phone}</small>`;

        layer.bindPopup(popup);
      }

    }).addTo(map);
  });
