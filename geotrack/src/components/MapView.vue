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
    //createde reference for the map
    const map = ref<Map | null>(null)

    //initialize the map
    onMounted(() => {
      map.value = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View(initialView), // create a new instance of the view
        controls: defaultControls().extend([
          new Zoom() // Add the zoom control
        ])
      })
    })

    // Função para voltar à visão inicial
    const goHome = () => {
      if (map.value) {
        const view = map.value.getView()
        view.animate({
          center: initialView.center,  // Define initial center
          zoom: initialView.zoom,      // Define initial zoom
          duration: 1000               // animation duration (in ms)
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
  <!-- Botão Home -->
  <button id="home" @click="goHome">Home</button>
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
  position: fixed;
}

:global(.ol-zoom-out) {
  bottom: 4.5em;
  right: 2em;
  position: fixed;
}
#home {
  bottom: 8.5em;
  right: 2em;
  position: fixed;
}
</style>
