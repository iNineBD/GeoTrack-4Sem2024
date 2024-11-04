<template>
  <div class="floating-panel">
    <v-container width="400px" class="panel-container" style="padding: 0px">
      <v-expansion-panels v-model="panel" rounded="xl" elevation="4" color="primary">
        <v-expansion-panel>
          <template v-slot:title>
            <v-row class="panel-header" justify="center" align="center">
              <v-img :src="logo" height="30" class="icon" />
            </v-row>
          </template>
          <v-expansion-panel-text style="padding: 0px" >
            <v-container
              width="400px"
              class="filter-container"
              style="padding: 0px"
            >
              <v-divider :thickness="2" />
              <!-- Exibe o filtro correto com base na rota -->
              <StopPointsFilter v-if="route.path === '/stoppointsfilter'" @consult="handleFilterData" @initializeMap="initializeMap"/>
              <GeographicAreasFilter v-if="route.path === '/geographicareasfilter'" @removeCircle="handleRemoveCircle"
                @drawCircle="handleDrawCircle" @consult="handleGeographicAreaConsult"
                @stopPointsReceived="handleStopPointsReceived"  @initializeMap="initializeMap"/>
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-speed-dial
      v-model="dial"
      location="bottom center"
      transition="scale-transition"
      class="speed-dial"
    >
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          icon="mdi-menu"
          large
          elevation="4"
          color="primary"
        ></v-btn>
      </template>

      <!--Botão home-->
      <v-btn key="home" @click="goHome" icon="mdi-home" title="Home"></v-btn> 

      <!-- Botão para StopPointsFilter -->

      <v-btn key="map-marker" @click="goToFilterStopPoints" icon="mdi-map-marker"
        title="Filtro de Pontos de Parada" color="primary"></v-btn>

      <!-- Botão para GeographicAreasFilter -->
      <v-btn key="map-marker" @click="goToFilterGeographicAreas" icon="mdi-map-search"
        title="Filtro de Áreas Geográficas" color="primary"></v-btn>
    </v-speed-dial>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import StopPointsFilter from "../Filters/StopPointsFilter.vue";
import GeographicAreasFilter from "../Filters/GeographicAreasFilter.vue";
import { FilterData } from "@/pages/MapView.vue";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from '@/utils/EventBus'; // Verifique se está importado corretamente

const panel = ref([]);
const dial = ref(false);
const route = useRoute();
const router = useRouter();
const emit = defineEmits(["initializeMap", "removeCircle"]);
const logo = ref("/src/assets/Logo.svg");

onMounted(() => {
  eventBus.on("changeLogo", updateLogo);
});

onUnmounted(() => {
  eventBus.off("changeLogo", updateLogo);
});

const toggleDial = () => {
  dial.value = !dial.value;
};

const updateLogo = () => {
  logo.value = logo.value === "/src/assets/Logo.svg" ? "/src/assets/LogoWhite.svg" : "/src/assets/Logo.svg";
};

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

const handleRemoveCircle = () => {
  emit('removeCircle');
};

const handleGeographicAreaConsult = (data: FilterData) => {
  console.log("Dados recebidos do GeographicAreasFilter:", data);
  props.onGeographicAreaConsult(data);
};

const handleStopPointsReceived = (stopPoints: any) => {
  console.log("Pontos de parada recebidos do GeographicAreasFilter:", stopPoints);
  props.onStopPointsReceived(stopPoints);
};

const initializeMap = () => {
  emit("initializeMap");
};

const goHome = () => {
  emit("initializeMap"); // Centraliza o mapa na posição inicial
  panel.value = []; // Fecha qualquer painel aberto, se necessário
  // Adicione outras lógicas de reset, se necessário
  console.log("Mapa centralizado e filtros limpos");
};

const goToFilterStopPoints = () => {
  router.push("/stoppointsfilter");
  //@ts-ignore
  panel.value = [0];
  toggleDial();
  emit("initializeMap");
};

const goToFilterGeographicAreas = () => {
  router.push("/geographicareasfilter");
    //@ts-ignore
  panel.value = [0];
  toggleDial();
  emit("initializeMap");
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
