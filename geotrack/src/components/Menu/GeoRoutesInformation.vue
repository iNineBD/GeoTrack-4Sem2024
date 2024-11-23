<template>
  <v-card class="stop-points-card" width="400px" height="300px" rounded="xl" elevation="4" color="primary">
    <template v-if="isMapReady">
      <v-list class="scrollable-container bg-primary">
        <v-list-item>
          <v-sheet class="pa-2 mb-2" color="primary_light" elevation="0" rounded>
            <v-row align="center" justify="space-between" style="padding: 5px 12px;">
              <span style="font-weight: bold; font-size: 16px;">
                {{ getUserInitials(geoRoutes[0].userName) }}
              </span>
              <span outlined>
                {{ geoRoutes[0].device.toUpperCase() }}
              </span>
            </v-row>
          </v-sheet>
          <v-list-item v-for="(route, index) in geoRoutes" :key="index" @click="showRoute(route, index)" style="padding: 0;"
            color="primary">
            <v-row align="start" no-gutters class="px-2 py-1">
              <v-col cols="1">
                <v-icon color="secondary" class="mr-1 mt-1">mdi-map-marker</v-icon>
              </v-col>
              <v-col cols="11">
                <v-list-item-title>
                  <v-sheet class="pa-2 mb-2" color="primary_light" elevation="0" rounded>
                    <v-row align="center" justify="space-between" style="padding: 5px 12px;">
                      <span style="font-weight: bold; font-size: 16px;">
                        {{ `Rota ${index + 1}` }}
                      </span>
                    </v-row>
                  </v-sheet>
                </v-list-item-title>
                <v-list-item-subtitle class="custom-subtitle">
                  <v-icon color="success" small>mdi-map-marker</v-icon>
                  {{ displayedAddresses[index] }}
                </v-list-item-subtitle>
                <v-list-item-subtitle class="custom-subtitle">
                  <v-icon color="error" small>mdi-flag-checkered</v-icon>
                  {{ displayedAddressesFinal[index] }}
                </v-list-item-subtitle>
              </v-col>
            </v-row>
            <v-divider v-if="index < geoRoutes.length - 1"></v-divider>
          </v-list-item>
        </v-list-item>
      </v-list>
    </template>
    <template v-else>
      <v-row align="center" justify="center" class="loading-container">
        <v-progress-circular indeterminate color="secondary" size="40"></v-progress-circular>
      </v-row>
    </template>
  </v-card>
</template>



<script setup lang="ts">
import { defineProps, ref, watch, computed } from 'vue';
import { eventBus } from '@/utils/EventBus';

const props = defineProps<{
  geoRoutes: Array<{
    coordinates: Array<{
      latitude: number;
      longitude: number;
      date: string;
    }>;
    userName: string;
    device: string;
    startDate: string;
    endDate: string;
  }>;
}>();

const displayedAddresses = ref<string[]>([]);
const displayedAddressesFinal = ref<string[]>([]);

const getUserInitials = (fullName: string) => {
  const names = fullName.split(' ');
  return names.slice(0, 3).join(' '); // Retorna os dois primeiros nomes
};

const getFormattedAddress = async (lat: number, lng: number) => {
  const apiKey = 'AIzaSyD7OMuCxvuTi0AfzyZLoChSWkjUzNQj8Lk'; // Substitua pela sua chave da API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=BR&region`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // console.log('Endereço retornado:', data);

    return data.results.length > 0 ? data.results[0].formatted_address : 'Endereço não encontrado';
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return 'Erro ao buscar endereço';
  }
};

const fetchAddresses = async () => {
  displayedAddresses.value = [];
  for (const route of props.geoRoutes) {
    const startCoord = route.coordinates[0];
    const address = await getFormattedAddress(startCoord.latitude, startCoord.longitude);
    displayedAddresses.value.push(address);
  }
};

const fetchAddressesFinal = async () => {
  displayedAddressesFinal.value = [];
  for (const route of props.geoRoutes) {
    const finalCoord = route.coordinates[route.coordinates.length - 1]; // Ponto final
    const addressFinal = await getFormattedAddress(finalCoord.latitude, finalCoord.longitude);
    displayedAddressesFinal.value.push(addressFinal);
  }
};

const showRoute = (route: any, index: number) => {
  console.log('Rota selecionada para exibição:', route);
  eventBus.emit('showRouteOnMap', route);
  eventBus.emit('openPlayer', { route, index }); // Emite o evento para abrir o player
};

const isMapReady = computed(() => {
  return (
    props.geoRoutes.length > 0 &&
    displayedAddresses.value.length === props.geoRoutes.length &&
    displayedAddressesFinal.value.length === props.geoRoutes.length
  );
});


watch(
  () => props.geoRoutes,
  async () => {
    await fetchAddresses();
    await fetchAddressesFinal();
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

.v-list-item-subtitle {
  display: block;
  white-space: normal;
  word-break: break-word;
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.009375em;
  line-height: 1.5;
  text-transform: none;
  opacity: 0.95;
}

.v-list-item-title {
  word-wrap: break-word;
  white-space: normal;
}

.loading-container {
  height: 100%;
}
</style>
