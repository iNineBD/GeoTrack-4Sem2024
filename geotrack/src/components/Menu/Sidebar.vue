<template>
  <div class="floating-panel">
    <v-container width="400px" class="panel-container" style="padding: 0px;">
      <v-expansion-panels v-model="panel" rounded="xl" elevation="4">
        <v-expansion-panel>
          <template v-slot:title>
            <v-row class="panel-header" justify="center" align="center">
              <v-img :src="logo" height="35" class="icon" />
            </v-row>
          </template>
          <v-expansion-panel-text style="padding: 0px;">
            <v-container width="400px" class="filter-container" style="padding: 0px;">
              <v-divider :thickness="2" />
              <!-- Exibe o filtro correto com base na rota -->
              <StopPointsFilter v-if="route.path === '/stoppointsfilter'" @consult="handleFilterData" />
              <GeographicAreasFilter v-if="route.path === '/geographicareasfilter'" @drawCircle="handleDrawCircle"
                @consult="handleGeographicAreaConsult" @stopPointsReceived="handleStopPointsReceived" />
              <!-- Exibe a caixa de informações dos pontos de parada -->
              <StopPointsInformation v-if="showStopPointsInformation" :stopPoints="stopPoints" />
              <GeographicStopPointsInformation v-if="showGeographicStopPointsInformation"
                :geoStopPoints="geoStopPoints" />
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-speed-dial v-model="dial" location="bottom center" transition="scale-transition" class="speed-dial">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" icon="mdi-menu" large elevation="4"></v-btn>
      </template>

      <!-- Botão para StopPointsFilter -->
      <v-btn key="map-marker" @click="handleStopPointsFilterClick" icon="mdi-map-marker"
        title="Filtro de Pontos de Parada"></v-btn>

      <!-- Botão para GeographicAreasFilter -->
      <v-btn key="map-marker" @click="handleGeographicAreasFilterClick" icon="mdi-map-search"
        title="Filtro de Áreas Geográficas"></v-btn>
    </v-speed-dial>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StopPointsFilter from "../Filters/StopPointsFilter.vue";
import GeographicAreasFilter from "../Filters/GeographicAreasFilter.vue";
import StopPointsInformation from '../Menu/StopPointsInformation.vue';
import GeographicStopPointsInformation from '../Menu/GeographicStopPointsInformation.vue';
//@ts-ignore
import MapView, { FilterData } from "@/pages/MapView.vue";
import { useRoute, useRouter } from "vue-router";

// Definindo as props
const props = defineProps<{
  onConsult: (data: FilterData) => any;
  onDrawCircle: () => void;
  onGeographicAreaConsult: (data: FilterData) => any;
  onStopPointsReceived: (stopPoints: any) => void;
}>();

interface StopPoint {
  device: string;
  user: string;
  geoJsonDTO: any;
}

const showStopPointsInformation = ref(false);
const stopPoints = ref<StopPoint[]>([]);
const showGeographicStopPointsInformation = ref(false);
const geoStopPoints = ref<any[]>([]);

const handleFilterData = async (data: FilterData) => {
  const result = await props.onConsult(data);

  if (result.success) {
    showStopPointsInformation.value = true;
    stopPoints.value = result.data;
    console.log("Aqui está os pontos salvos: ", stopPoints.value)
  } else {
    showStopPointsInformation.value = false;
    stopPoints.value = [];
    console.log("Aqui está a lista vazia: ", stopPoints.value)
  }
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
  console.log("RESULT:", stopPoints)
  geoStopPoints.value = stopPoints;
  showGeographicStopPointsInformation.value = true;
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

const handlePanelChange = () => {
  showStopPointsInformation.value = false;
  showGeographicStopPointsInformation.value = false;
};

const handleStopPointsFilterClick = () => {
  goToFilterStopPoints();
  handlePanelChange();
};

const handleGeographicAreasFilterClick = () => {
  goToFilterGeographicAreas();
  handlePanelChange();
};

</script>

<style scoped>
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
</style>
