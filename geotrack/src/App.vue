<script lang="ts">
import MapView from './components/MapView.vue';

export default {
  name: 'App',
  components: {
    MapView,
  },
};
</script>

<template>
  <div id="app">
    <MapView />
    <div class="content">
      <h1>GeoTrack - Mapa Interativo</h1>
    </div>
  </div>
</template>

<style scoped>
#app {
  margin: 0;
  padding: 0;
  height: 50vh;
  width: 50vw;
}

.content {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  color: white;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  font-size: 1rem;
}
</style>
