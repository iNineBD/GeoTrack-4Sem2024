<template>
  <div id="map" class="map"></div>
  <!-- Componente AvatarMarkers -->
  <AvatarMarkers :avatars="avatars" />
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom } from 'ol/control';
import AvatarMarkers from '../components/Markers/AvatarMarkers.vue';
import { boundingExtent } from 'ol/extent';

// Definindo o tipo para o Avatar
interface Avatar {
  initials: string;
  fullName: string;
  color: string;
  coords: [number, number]; // Coordenadas de longitude e latitude
}

// Definindo o tipo da resposta GeoJSON
interface GeoJsonFeature {
  geometry: {
    coordinates: [number, number];
  };
}

interface GeoJsonResponse {
  user: string;
  device: number;
  geojson: {
    features: GeoJsonFeature[];
  };
}

export default {
  name: 'MapView',
  components: { AvatarMarkers }, // Importando AvatarMarkers
  setup() {
    const avatars = ref<Avatar[]>([]); // Definindo o tipo do array de avatares

    // Função para buscar dados GeoJSON da API
    const fetchGeoJsonData = async () => {
      try {
        const requestData = {
          user: 0,
          userName: "André",
          device: 2,
          userDevice: "string",
          startDate: "2024-08-24",
          finalDate: "2024-09-24"
        };

        const response = await axios.post('http://localhost:8080/stoppoint/find', requestData);
        const geoJsonData: GeoJsonResponse = {
          user: response.data.user,
          device: response.data.device,
          geojson: response.data.geoJsonDTO,
        };

        // Preenche os avatares com base nos dados GeoJSON retornados
        avatars.value = geoJsonData.geojson.features.map((feature) => {
          const coords = feature.geometry.coordinates;
          const initials = geoJsonData.user.substring(0, 2).toUpperCase() || 'NA';
          const fullName = geoJsonData.user || 'Unknown';
          return {
            initials,
            fullName,
            color: 'primary',
            coords,
          };
        });
      } catch (error) {
        console.error('Erro ao buscar os dados GeoJSON:', error);
      }
    };

    onMounted(() => {
  // Inicializa o mapa
  const map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([-45.88671, -23.21978]), // Centro do mapa (Brasil)
      zoom: 3, // Zoom inicial padrão
      extent: [
        -20026376.39,  // Limite Oeste (longitude mínima)
        -20048966.10,  // Limite Sul (latitude mínima)
        20026376.39,   // Limite Leste (longitude máxima)
        20048966.10,   // Limite Norte (latitude máxima)
      ], // Limite para a projeção EPSG:3857 (usada pelo OSM)
    }),
    controls: defaultControls().extend([new Zoom()]),
  });

  // Função para ajustar o zoom e a área visível
const adjustMapToFitAvatars = () => {
  const coordinates = avatars.value.map(avatar => fromLonLat(avatar.coords));
  // Cria uma extensão que abrange todas as coordenadas
  const extent = boundingExtent(coordinates);
  // Ajusta a visualização do mapa para essa extensão
  map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
};

  // Busca os dados e preenche os avatares
  fetchGeoJsonData().then(() => {
    avatars.value.forEach((avatar, index) => {
      const avatarMarker = new Overlay({
        element: document.getElementById('avatar-' + index)!,
        position: fromLonLat(avatar.coords),
        positioning: 'center-center',
      });

      map.addOverlay(avatarMarker);
    });

    // Após adicionar todos os avatares, ajusta o zoom para que todos fiquem visíveis
    if (avatars.value.length > 0) {
      adjustMapToFitAvatars();
    }
  });
});

    return { avatars };
  },
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}

:global(.ol-zoom) {
  bottom: 0.5em;
  top: auto;
  left: auto;
  right: 0.5em;
}

:global(.ol-attribution ul) {
  display: none;
}
</style>
