<script lang="ts">
import { ref, onMounted } from 'vue'
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import { defaults as defaultControls, Zoom } from 'ol/control'

// Definir a visão inicial
const initialView = {
  center: fromLonLat([-45.88671, -23.21978]), // Coordenadas iniciais
  zoom: 12 // Zoom inicial
}

export default {
  name: 'MapView',
  setup() {
    const map = ref<Map | null>(null)

    onMounted(() => {
      map.value = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View(initialView),
        controls: defaultControls().extend([
          new Zoom()
        ])
      })
    })

    const goHome = () => {
      if (map.value) {
        const view = map.value.getView()
        view.animate({
          center: initialView.center,
          zoom: initialView.zoom,
          duration: 1000
        })
      }
    }

    return {
      goHome
    }
  }
}
</script>

<template>
  <div id="map" class="map"></div>
  <button id="home-button" @click="goHome">
    <img id="home-icon" src="/src/assets/images/home-map-pin.svg" alt="voltar ao início">
  </button>
</template>

<style scoped>
.map {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}

:global(.ol-zoom-in) {
  bottom: 6em;
  right: 2em;
  width: 3.5vh;
  height: auto;
  position: fixed;
}

:global(.ol-zoom-out) {
  bottom: 4.5em;
  right: 2em;
  width: 3.5vh;
  height: auto;
  position: fixed;
}

#home-button {
  bottom: 9.0em; /* Ajustado para ficar um pouco acima do botão de zoom-in */
  right: 2.3em;
  width: 3.2vh;
  height: auto;
  position: fixed;
  border-radius: 5px;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

#home-icon {
  width: 3.2vh; /* Mesmo tamanho dos botões de zoom */
  height: auto;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2); /* Sombra leve */
}
</style>
