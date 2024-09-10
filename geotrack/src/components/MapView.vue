<script lang="ts">
import { onMounted } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Zoom from 'ol/control/Zoom';
import { fromLonLat } from 'ol/proj';

export default {
    name: 'MapView',
    setup() {
        onMounted(() => {
            const map = new Map({
                target: 'map', // ID do div onde o mapa será renderizado
                layers: [
                    new TileLayer({
                        source: new OSM(), // Usa o OpenStreetMap como fonte de tiles
                    }),
                ],
                view: new View({
                    center: fromLonLat([-45.88671, -23.21978]), // Centro inicial do mapa (São José dos Campos - SP - Brasil)
                    zoom: 12, // Nível de zoom inicial
                })
            });
        });
    },
};
</script>

<template>
    <div id="map" class="map"></div>
    <div id="zoom-control" class="custom-zoom-control"></div>
</template>

<style scoped>
.map {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
}
</style>
