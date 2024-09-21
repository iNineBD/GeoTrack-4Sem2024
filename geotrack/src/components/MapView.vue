<template>
  <div id="map" class="map"></div>
  <div v-for="(avatar, index) in avatars" :key="index" :id="'avatar-' + index" class="avatar-marker">
    <v-tooltip :open-on-hover="true" :text="`${avatar.fullName} (${avatar.coords})`">
      <template v-slot:activator="{ props }">
        <v-avatar v-bind="props" :color="avatar.color">
          <span class="text-h5">{{ avatar.initials }}</span>
        </v-avatar>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom } from 'ol/control';

export default {
  name: 'MapView',
  setup() {
    const avatars = ref([
      { initials: 'AK', fullName: 'Ali Khodr', color: 'primary', coords: [-45.88671, -23.21978] },
      { initials: 'CJ', fullName: 'Carlos José', color: 'primary', coords: [-45.88000, -23.22000] },
      { initials: 'LM', fullName: 'Leonardo Maicon', color: 'primary', coords: [-45.89000, -23.21800] },
    ]);

    onMounted(() => {
      const map = new Map({
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

      avatars.value.forEach((avatar, index) => {
        const avatarMarker = new Overlay({
          element: document.getElementById('avatar-' + index)!, // Elemento HTML do avatar
          position: fromLonLat(avatar.coords), // Coordenadas do marcador
          positioning: 'center-center', // Posicionamento centralizado
        });

        map.addOverlay(avatarMarker); // Adiciona o marcador ao mapa
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

.avatar-marker {
  /* Estilos dos avatares */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
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
