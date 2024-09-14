<script lang="ts">
import { ref, onMounted } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls, Zoom } from 'ol/control';

export default {
    name: 'MapView',
    setup() {
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
                    zoom: 12,
                }),
                controls: defaultControls().extend([
                    new Zoom() // Adiciona o controle de zoom manualmente
                ])
            });
        });
    },
};
</script>

<template>
    <div id="map" class="map"></div>
</template>

<style scoped>
.map {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
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
</style>
