<template>
  <div id="map" class="map"></div>

  <AvatarMarkers v-if="map" :avatars="avatars" :map="map" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom } from 'ol/control';
import AvatarMarkers from './Markers/AvatarMarkers.vue';

interface Avatar {
  fullName: string;
  coords: [number, number];
  color: string;
  initials: string;
}

export default defineComponent({
  name: 'MapView',
  components: {
    AvatarMarkers,
  },
  setup() {
    const map = ref<Map | null>(null);
    const avatars = ref<Avatar[]>([
      { initials: 'AK', fullName: 'Ali Khodr', color: 'primary', coords: [-45.88671, -23.21978] },
      { initials: 'CJ', fullName: 'Carlos José', color: 'primary', coords: [-45.88000, -23.22000] },
      { initials: 'LM', fullName: 'Leonardo Maicon', color: 'primary', coords: [-45.89000, -23.21800] },
    ]);

    onMounted(() => {
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

    return { map, avatars };
  },
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}
</style>
