<template>
    <v-card class="stop-points-card" width="400px" height="250px" rounded="xl" elevation="4">
        <v-col class="scrollable-container">
            <template v-if="geoStopPoints && Object.keys(geoStopPoints).length > 0">
                <div class="header-row">
                    <h5 class="user-name"><strong>{{ getUserInitials(geoStopPoints.userName) }}</strong></h5>
                    <span class="device-name"><strong>{{ geoStopPoints.device.toUpperCase() }}</strong></span>
                </div>
                <ul class="stop-points-list">
                    <li v-for="(coord, coordIndex) in geoStopPoints.coords" :key="coordIndex" @click="navigateToStopPoint(coord)">
                        <div class="address-row">
                            <div class="address-content">
                                <div class="location-details">
                                    <v-icon color="secondary" class="location-icon" small>mdi-map-marker</v-icon>
                                    <p>{{ displayedAddresses[coordIndex] }}</p>
                                </div>
                                <p class="date-row">
                                    {{ formatDateRange(coord.startDate, coord.endDate) }}
                                </p>
                                <p class="date-row">
                                    Tempo parado: {{ calculateStopDuration(coord.startDate, coord.endDate) }}
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </template>
            <template v-else>
                <p style="text-align: center;">Nenhum ponto de parada encontrado.</p>
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
}

.scrollable-container {
    padding: 10px;
    background-color: white;
    overflow-y: auto;
    max-height: 250px;
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
</style>
