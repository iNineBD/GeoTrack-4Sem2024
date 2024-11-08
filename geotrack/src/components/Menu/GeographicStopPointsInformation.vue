<template>
    <v-card class="stop-points-card" width="400px" height="300px" rounded="xl" elevation="4">
        <v-col class="scrollable-container" cols="12">
            <template v-if="geoStopPoints && Object.keys(geoStopPoints).length > 0">
                <v-sheet color="primary_light" class="header-row pa-2 mb-2" rounded>
                    <v-row align="center" justify="space-between">
                        <span class="user-name" style="font-weight: bold;">{{ getUserInitials(geoStopPoints.userName) }}</span>
                        <span class="device-name" style="font-weight: bold;">{{ geoStopPoints.device.toUpperCase() }}</span>
                    </v-row>
                </v-sheet>
                <v-list dense>
                    <v-list-item v-for="(coord, coordIndex) in geoStopPoints.coords" :key="coordIndex" @click="navigateToStopPoint(coord)" class="address-row pa-2 mb-2" rounded>
                        <v-row no-gutters align="center">
                            <v-col cols="auto">
                                <v-icon color="secondary" class="mr-2">mdi-map-marker</v-icon>
                            </v-col>
                            <v-col>
                                <v-list-item-title class="text-wrap">
                                    {{ displayedAddresses[coordIndex] }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-wrap">
                                    {{ formatDateRange(coord.startDate, coord.endDate) }}
                                </v-list-item-subtitle>
                                <v-list-item-subtitle class="text-wrap">
                                    Tempo parado: {{ calculateStopDuration(coord.startDate, coord.endDate) }}
                                </v-list-item-subtitle>
                            </v-col>
                        </v-row>
                    </v-list-item>
                </v-list>
            </template>
            <template v-else>
                <v-row justify="center" align="center">
                    <v-icon color="grey">mdi-alert</v-icon>
                    <span>Nenhum ponto de parada encontrado.</span>
                </v-row>
            </template>
        </v-col>
    </v-card>
</template>

<script setup lang="ts">
import { defineProps, watch, ref, defineEmits } from 'vue';
import axios from 'axios';

const props = defineProps<{
    geoStopPoints: {
        userName: string;
        device: string;
        coords: Array<{
            latitude: number;
            longitude: number;
            startDate: string;
            endDate: string;
        }>;
    }
}>();

const emit = defineEmits<{
    (e: 'navigate-to-stop-point', coordinates: [number, number]): void;
}>();

const addresses = ref<string[][]>([]);
const displayedAddresses = ref<string[][]>([]);

const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    return names.slice(0, 2).join(' '); // Retorna os dois primeiros nomes
};

const getFormattedAddress = async (lat: number, lng: number) => {
    const apiKey = 'AIzaSyD7OMuCxvuTi0AfzyZLoChSWkjUzNQj8Lk';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=BR&region`;

    try {
        const response = await axios.get(url);
        console.log("ENDEREÇO:", response)

        const formattedAddress = response.data.results.length > 0 ? response.data.results[0].formatted_address : 'Endereço não encontrado';

        return formattedAddress;
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        return 'Erro ao buscar endereço';
    }
};

const fetchAddresses = async () => {
    addresses.value = [];
    displayedAddresses.value = [];
    for (const coord of props.geoStopPoints.coords) {
        const address = await getFormattedAddress(coord.latitude, coord.longitude);
        addresses.value.push([address]); // Inicializa cada endereço como array de strings
        displayedAddresses.value.push(address); // Exibe inicialmente apenas o primeiro endereço
    }
};

const formatDateRange = (startDate: string, endDate: string) => {
    const parseDate = (date: string) => new Date(date);
    const formatDatePart = (date: Date) =>
        date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatTimePart = (date: Date) =>
        date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    return `${formatDatePart(start)}, ${formatTimePart(start)} - ${formatTimePart(end)}`;
};

const calculateStopDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));

    return `${durationMinutes} minuto${durationMinutes !== 1 ? 's' : ''}`;
};

const navigateToStopPoint = (coord: { latitude: number; longitude: number }) => {
    console.log("ESTOU AQUII!!", coord.latitude, coord.longitude)
    emit('navigate-to-stop-point', [coord.latitude, coord.longitude]);
};

watch(
    () => props.geoStopPoints,
    fetchAddresses,
    { immediate: true }
);
</script>

<style scoped>
.stop-points-card {
    box-shadow: none;
    border-radius: 0;
    position: fixed;
    margin-top: 15px;
    overflow-y: auto;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #d5d9ff;
    padding: 8px 10px;
    border-radius: 8px;
    margin-bottom: 4px;
}

.user-name,
.device-name {
    font-size: 15px;
    color: #333;
}

ul {
    list-style-type: none;
    padding-left: 0;
}

.stop-points-list {
    list-style-type: none;
}

.scrollable-container::-webkit-scrollbar {
    width: 8px;
}

.scrollable-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 8px;
}

.scrollable-container::-webkit-scrollbar-thumb {
    background-color: #d5d9ff;
    border-radius: 8px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
    background-color: #979edb;
}

.address-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: #d5d9ff2d;
    padding: 8px;
    border-radius: 8px;
    margin-bottom: 5px;
}

.address-row:hover {
    background-color: #bec4f852;
    cursor: pointer;
}

.location-details {
    display: flex;
    align-items: center;
}

.location-icon {
    margin-right: 5px;
}

.date-row {
    font-size: 14px;
    color: #777;
    margin-left: 30px;
}

.text-wrap {
    white-space: normal;
    word-wrap: break-word;
}
</style>
