// Crea la mappa centrata su Caccamo
const map = L.map('mappa').setView([37.944, 13.671], 16);

// Aggiunge il layer di base OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Carica i dati GeoJSON dei monumenti
fetch("data.geojson")
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#d4a64a", // oro
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9
        });
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties.name) {
          layer.bindPopup(`<b>${feature.properties.name}</b>`);
        }
      }
    }).addTo(map);
  });
