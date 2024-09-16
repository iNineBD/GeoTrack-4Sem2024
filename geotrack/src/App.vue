<script lang="ts">
import MapView from './components/MapView.vue';
import SideMenu from './components/SideMenu.vue';

export default {
  name: 'App',
  components: {
    MapView,
    SideMenu,
  },
};
</script>

<template>
  <div id="app">
    <MapView />
    <SideMenu />
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
  overflow: hidden;
}
</style>
