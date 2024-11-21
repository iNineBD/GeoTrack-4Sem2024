<template>
  <v-card class="stop-points-card" width="400px" height="300px" rounded="xl" elevation="4" color="primary">
    <template v-if="routes && routes.length > 0">
      <v-list class="scrollable-container bg-primary">
        <v-list-item>
          <v-sheet class="pa-2 mb-2" color="primary_light" elevation="0" rounded>
            <v-row align="center" justify="space-between" style="padding: 5px 12px;">
              <span style="font-weight: bold; font-size: 16px;">
                {{ getUserInitials(userName) }}
              </span>
              <span outlined>
                {{ device.toUpperCase() }}
              </span>
            </v-row>
          </v-sheet>
          <v-list-item v-for="(route, index) in routes" :key="index" @click="showRoute(route)" style="padding: 0;"
            color="primary">
            <v-row align="start" no-gutters class="px-2 py-1">
              <v-col cols="1">
                <v-icon color="secondary" class="mr-1 mt-1">mdi-map-marker</v-icon>
              </v-col>
              <v-col cols="11">
                <v-list-item-title>
                  {{ `Rota ${index + 1}` }}
                </v-list-item-title>
              </v-col>
              <v-icon color="green" size="18">mdi-map-marker</v-icon>
              <span style="font-size: 14px;">
                {{ `Início (lat, lgn): ${route.coordinates[0]?.latitude},
                ${route.coordinates[0]?.longitude} - ${new
                    Date(route.coordinates[0]?.date).toLocaleTimeString()}` }}
              </span>
              <v-icon color="red" size="18">mdi-map-marker</v-icon>
              <span style="font-size: 14px;">
                {{ `Final (lat, lgn): ${route.coordinates[route.coordinates.length - 1]?.latitude},
                ${route.coordinates[route.coordinates.length - 1]?.longitude} - ${new
                    Date(route.coordinates[route.coordinates.length - 1]?.date).toLocaleTimeString()}` }}
              </span>
            </v-row>
            <v-divider v-if="index < routes.length"></v-divider>
          </v-list-item>
        </v-list-item>
      </v-list>
    </template>
    <template v-else>
      <v-row justify="center">
        <v-icon color="grey">mdi-alert</v-icon>
        <span>Nenhuma rota encontrada.</span>
      </v-row>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, onMounted } from 'vue';
import { eventBus } from '@/utils/EventBus';

const props = defineProps<{
  routes: Array<{
    coordinates: Array<{
      latitude: number;
      longitude: number;
      date: string;
    }>;
    startDate: string;
    endDate: string;
  }>;
}>();

const routes = ref(props.routes || []);
const userName = ref('');
const device = ref('');
const selectedRoute = ref(null);

function handleRoutesData(dados: { routes: any[]; userName: string; device: string }) {
  console.log('Dados recebidos no componente via eventBus:', dados);

  if (dados) {
    routes.value = dados.routes || [];
    userName.value = dados.userName || '';
    device.value = dados.device || '';
  }
}

const getUserInitials = (fullName: string) => {
  const names = fullName.split(' ');
  return names.slice(0, 2).join(' ');
};

function showRoute(route: any) {
  selectedRoute.value = route;

  // Emitir o evento para exibir a rota no mapa
  eventBus.emit('showRouteOnMap', route);

  console.log('Rota selecionada para exibição:', route);
}

onMounted(() => {
  eventBus.on('routesReceived', handleRoutesData);
});

watch(
  () => props.routes,
  (newRoutes) => {
    if (newRoutes) {
      routes.value = newRoutes;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.stop-points-card {
  box-shadow: none;
  border-radius: 0;
  position: fixed;
  margin-top: 15px;
}

.scrollable-container {
  max-height: 300px;
  /* Ajuste a altura conforme necessário */
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-container::-webkit-scrollbar {
  width: 10px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f0f0f5;
  border-radius: 5px;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c7c9ff, #7a7de9);
  border-radius: 10px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b6fe1, #4f51d3);
}

.v-list-item-title {
  word-wrap: break-word;
  white-space: normal;
}
</style>
