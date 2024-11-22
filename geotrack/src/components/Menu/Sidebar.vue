<template>
  <div class="floating-panel">
    <v-container width="400px" class="panel-container" style="padding: 0px">
      <v-expansion-panels v-model="panel" rounded="xl" elevation="4" color="primary">
        <v-expansion-panel>
          <template v-slot:title>
            <v-row class="panel-header" justify="center" align="center">
              <v-img :src="logo" height="35" class="icon" />
            </v-row>
          </template>
          <v-expansion-panel-text style="padding: 0px">
            <v-container width="400px" class="filter-container" style="padding: 0px">
              <v-divider :thickness="2" />
              <!-- Exibe o filtro correto com base na rota -->
              <StopPointsFilter v-if="route.path === '/stoppointsfilter'" @consult="handleFilterData"
                @initializeMap="initializeMap" @initializeMapDark="initializeMapDark" />
              <GeographicAreasFilter v-if="route.path === '/geographicareasfilter'" @removeCircle="handleRemoveCircle"
                @drawCircle="handleDrawCircle" @consult="handleGeographicAreaConsult"
                @stopPointsReceived="handleStopPointsReceived" @initializeMap="initializeMap"
                @initializeMapDark="initializeMapDark" />
              <GeoRoutesFilter @initializeMap="initializeMap" @initializeMapDark="initializeMapDark" @routesReceived="handleRoutesReceived"
                v-if="route.path === '/georoutesfilter'" />
              <StopPointsInformation v-if="showStopPointsInformation" :stopPoints="stopPoints"
                @go-to-location="navigateToLocation" />
              <GeographicStopPointsInformation v-if="showGeographicStopPointsInformation" :geoStopPoints="geoStopPoints"
                @navigate-to-stop-point="navigateGeoToLocation" />
              <GeoRoutesInformation v-if="showGeoRoutesInformation" :geoRoutes="geoRoutes" />
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-speed-dial v-model="dial" location="bottom center" transition="scale-transition" class="speed-dial">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" icon="mdi-menu" large elevation="4" color="primary"></v-btn>
      </template>

      <!-- Botão para Home -->
      <v-btn key="map-marker" @click="handleHomeClick" icon="mdi-home" title="Home" color="primary"></v-btn>

      <!-- Botão para StopPointsFilter -->
      <v-btn key="map-marker" @click="handleStopPointsFilterClick" icon="mdi-map-marker"
        title="Filtro de Pontos de Parada" color="primary"></v-btn>

      <!-- Botão para GeographicAreasFilter -->
      <v-btn key="map-marker" @click="handleGeographicAreasFilterClick" icon="mdi-map-search"
        title="Filtro de Áreas Geográficas" color="primary"></v-btn>

      <!-- Botão para GeoRoutesFilter -->
      <v-btn key="map-marker" @click="handleGeoRoutesFilterClick" icon="mdi-map-marker-distance" title="Filtro de Rotas"
        color="primary"></v-btn>

      <!-- Botão para Sair -->
      <v-btn key="map-marker" icon="mdi-export" @click="handleLogout" title="Saída" color="#F44336"></v-btn>
    </v-speed-dial>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import StopPointsFilter from "../Filters/StopPointsFilter.vue";
import GeographicAreasFilter from "../Filters/GeographicAreasFilter.vue";
import GeoRoutesFilter from "../Filters/GeoRoutesFilter.vue";
import GeoRoutesInformation from "../Menu/GeoRoutesInformation.vue";
import StopPointsInformation from '../Menu/StopPointsInformation.vue';
import GeographicStopPointsInformation from '../Menu/GeographicStopPointsInformation.vue';
import { FilterData } from "@/pages/MapView.vue";
import { useRoute, useRouter } from "vue-router";
import { eventBus } from '@/utils/EventBus'; // Verifique se está importado corretamente

const panel = ref([]);
const dial = ref(false);
const route = useRoute();
const router = useRouter();
const emit = defineEmits(["initializeMap", "removeCircle", "initializeMapDark"]);
const logo = ref("/src/assets/Logo.svg");

onMounted(() => {
  eventBus.on("changeLogo", updateLogo);
  eventBus.on("novoLogo", change);
  eventBus.on("clearStopPointsInformation", clearStopPointsInformation);
  eventBus.on('showRouteOnMap', handleRouteFromSidebar);
});

onUnmounted(() => {
  eventBus.off("novoLogo", change);
  eventBus.off("changeLogo", updateLogo);
  eventBus.off('showRouteOnMap', handleRouteFromSidebar);
});

// Método que será chamado quando o evento "novoLogo" for emitido
const change = (newLogo: string) => {
  logo.value = newLogo; // Atualizando o valor do logo com o valor recebido
  console.log("logo enviado: ", logo.value);
};

const toggleDial = () => {
  dial.value = !dial.value;
};

const updateLogo = () => {
  logo.value = logo.value === "/src/assets/Logo.svg" ? "/src/assets/LogoWhite.svg" : "/src/assets/Logo.svg";
  eventBus.emit("novoLogo", logo.value)
};

// Definindo as props
const props = defineProps<{
  onConsult: (data: FilterData) => any;
  onDrawCircle: () => void;
  onGeographicAreaConsult: (data: FilterData) => any;
  onStopPointsReceived: (stopPoints: any) => void;
  onRoutesReceived: (routes: any) => void;
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
const showGeoRoutesInformation = ref(false);
const geoRoutes = ref<any[]>([]);

const clearStopPointsInformation = () => {
  showStopPointsInformation.value = false;
  showGeographicStopPointsInformation.value = false;
  showGeoRoutesInformation.value = false;
};

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

const handleRemoveCircle = () => {
  emit('removeCircle');
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

const handleRoutesReceived = (routes: any) => {
  console.log("Rotas recebidas no sidebar", routes.routes);
  geoRoutes.value = routes.routes;
  showGeoRoutesInformation.value = true;
  props.onRoutesReceived(routes);
};

const initializeMap = () => {
  emit("initializeMap");
};

const initializeMapDark = () => {
  emit("initializeMapDark");
};

const goToFilterStopPoints = () => {
  router.push("/stoppointsfilter");
  //@ts-ignore
  panel.value = [0];
  toggleDial();

  if (logo.value === "/src/assets/Logo.svg") {
    emit("initializeMap");
  } else {
    emit("initializeMapDark");
  }
};

const goToFilterGeographicAreas = () => {
  router.push("/geographicareasfilter");
  //@ts-ignore
  panel.value = [0];
  toggleDial();
  if (logo.value === "/src/assets/Logo.svg") {
    emit("initializeMap");
  } else {
    emit("initializeMapDark");
  }
};

const goToFilterGeoRoutes = () => {
  router.push("/georoutesfilter");
  //@ts-ignore
  panel.value = [0];
  toggleDial();
  if (logo.value === "/src/assets/Logo.svg") {
    emit("initializeMap");
  } else {
    emit("initializeMapDark");
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  router.push({ name: "Login" });
}

const handlePanelChange = () => {
  showStopPointsInformation.value = false;
  showGeographicStopPointsInformation.value = false;
  showGeoRoutesInformation.value = false;
};

const handleStopPointsFilterClick = () => {
  goToFilterStopPoints();
  handlePanelChange();
};

const handleGeographicAreasFilterClick = () => {
  goToFilterGeographicAreas();
  handlePanelChange();
};

const handleGeoRoutesFilterClick = () => {
  goToFilterGeoRoutes();
  handlePanelChange();
};

const handleHomeClick = () => {
  handlePanelChange();
  clearStopPointsInformation();
  eventBus.emit("clearFields");

  if (logo.value == '/src/assets/LogoWhite.svg') {
    initializeMapDark();
  } else {
    initializeMap();
  }
}

// navigateToLocation é para ir até os pontos do filtro de usuários
const navigateToLocation = (coordinates: [number, number]) => {
  eventBus.emit("navigateToLocation", coordinates);
};

// navigateGeoToLocation é para ir até os pontos do filtro de áreas geográficas
const navigateGeoToLocation = (coord: [number, number]) => {
  console.log("COORDS AQUII", coord)
  eventBus.emit("navigateGeoToLocation", coord);
};

const handleRouteFromSidebar = (route: any) => {
  console.log('Rota recebida no Sidebar:', route);
  eventBus.emit("selectedRoute", route);
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
