<template>
  <div class="floating-panel">
    <v-container width="400px" class="panel-container" style="padding: 0px;">
      <v-expansion-panels v-model="panel" rounded="xl" elevation="4">
        <v-expansion-panel>
          <template v-slot:title>
            <v-row class="panel-header" justify="center" align="center">
              <v-img :src="logo" height="30" class="icon" />
            </v-row>
          </template>
          <v-expansion-panel-text style="padding: 0px;">
            <v-container width="400px" class="filter-container" style="padding: 0px;">
              <v-divider :thickness="2" />
              <StopPointsFilter v-if="route.path === '/stoppointsfilter'" @consult="handleFilterData"/>
              <GeographicAreasFilter v-if="route.path === '/geographicareasfilter'" @drawCircle="handleDrawCircle" @consult="handleGeographicAreaConsult" @stopPointsReceived="handleStopPointsReceived"/>
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-speed-dial v-model="dial" location="bottom center" transition="scale-transition" class="speed-dial">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" icon="mdi-menu" large elevation="4"></v-btn>
      </template>

      <v-btn key="map-marker" @click="goToFilterStopPoints" icon="mdi-map-marker" title="Filtro de Pontos de Parada"></v-btn>
      <v-btn key="map-marker" @click="goToFilterGeographicAreas" icon="mdi-map-search" title="Filtro de Áreas Geográficas"></v-btn>
      <v-btn  key="map-marker" icon="mdi-export" @click="handleLogout" title="Saída"></v-btn>
    </v-speed-dial>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StopPointsFilter from "../Filters/StopPointsFilter.vue";
import GeographicAreasFilter from "../Filters/GeographicAreasFilter.vue";
//@ts-ignore
import MapView, { FilterData } from "@/pages/MapView.vue";
import { useRoute, useRouter } from "vue-router";

// Definindo as props
const props = defineProps<{
  onConsult: (data: FilterData) => void;
  onDrawCircle: () => void;
  onGeographicAreaConsult: (data: FilterData) => void;
  onStopPointsReceived: (stopPoints: any) => void;
}>();

const handleFilterData = (data: FilterData) => {
  props.onConsult(data);
};

const handleDrawCircle = () => {
  props.onDrawCircle();
};

const handleGeographicAreaConsult = (data: FilterData) => {
  console.log("Dados recebidos do GeographicAreasFilter:", data);
  props.onGeographicAreaConsult(data);
};

const handleStopPointsReceived = (stopPoints: any) => {
  console.log("Pontos de parada recebidos do GeographicAreasFilter:", stopPoints);
  props.onStopPointsReceived(stopPoints);
};

const logo = "/src/assets/Logo.svg";
const panel = ref([]);
const dial = ref(false);

const route = useRoute();
const router = useRouter();

const toggleDial = () => {
  dial.value = !dial.value;
};

const goToFilterStopPoints = () => {
  router.push("/stoppointsfilter");
  //@ts-ignore
  panel.value = 0; // Define o primeiro painel como aberto
  toggleDial();
};

const goToFilterGeographicAreas = () => {
  router.push("/geographicareasfilter");
  //@ts-ignore
  panel.value = 0; // Define o primeiro painel como aberto
  toggleDial();
};

const handleLogout = () => {
  localStorage.removeItem("token");
  router.push({ name: "Login" });
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.floating-panel {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  max-width: calc(100% - 40px);
  gap: 10px;
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
}

.logout-icon {
  color: #000B62 !important;
}
</style>