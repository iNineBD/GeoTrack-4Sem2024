<template>
  <div id="map" class="map"></div>

  <AvatarMarkers v-if="map && geoJsonData" :avatars="avatars" :map="map" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom } from 'ol/control';
import axios from 'axios';
import AvatarMarkers from './Markers/AvatarMarkers.vue';

// Interface para Avatar e GeoJsonData
interface Avatar {
  fullName: string;
  coords: [number, number];
  color: string;
  initials: string;
}

interface GeoJsonData {
  user: string;
  device: string;
  geojson: {
    type: string;
    features: Array<{
      type: string;
      properties: Record<string, any>;
      geometry: {
        type: string;
        coordinates: number[];
      };
    }>;
  };
}

export default defineComponent({
  name: 'MapView',
  components: {
    AvatarMarkers,
  },
  setup() {
    const map = ref<Map | null>(null);
    const avatars = ref<Avatar[]>([]);
    const geoJsonData = ref<GeoJsonData | null>(null);

    // Função para buscar dados do backend
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
        const response = await axios.post('http://localhost:8080/stopoint/find', requestData);
        console.log(response.data)
        geoJsonData.value = {
          user: response.data.user,
          device: response.data.device,
          geojson: response.data.geoJsonDTO,
        };

        // Transformar dados do GeoJSON em avatares
        avatars.value = geoJsonData.value.geojson.features.map((feature) => ({
          initials: geoJsonData.value?.user.substring(0, 2).toUpperCase() || 'NA',
          fullName: geoJsonData.value?.user || 'Unknown',
          coords: feature.geometry.coordinates as [number, number],
          color: 'primary',
        }));
      } catch (error) {
        console.error('Error fetching points from the backend:', error);
      }
    };

    onMounted(() => {
      fetchGeoJsonData();
      map.value = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([-45.88671, -23.21978]),
          zoom: 13,
        }),
        controls: defaultControls().extend([new Zoom()]),
      });
    });

    return { map, avatars, geoJsonData, fetchGeoJsonData };
  },
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}
</style>
