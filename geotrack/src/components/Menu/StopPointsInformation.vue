<template>
    <v-card class="stop-points-card" width="400px" height="250px" rounded="xl" elevation="4">
        <v-col class="scrollable-container">
            <template v-if="stopPoints && stopPoints.length > 0">
                <ul>
                    <li v-for="(address, index) in addresses" :key="index" style="margin: 5px">
                        <div class="header-row">
                            <h5 class="user-name"><strong>{{ getUserInitials(stopPoints[index].user) }}</strong></h5>
                            <span class="device-name"><strong>{{ stopPoints[index].device }}</strong></span>
                        </div>
                        <ul class="stop-points-list">
                            <li v-for="(featureAddress, featureIndex) in displayedAddresses[index]" :key="featureIndex">
                                <div class="address-row">
                                    <div class="address-content">
                                        <div class="location-details">
                                            <v-icon color="secondary" class="location-icon" small>mdi-map-marker</v-icon>
                                            <p>{{ featureAddress }}</p>
                                        </div>
                                        <p class="date-row">
                                            {{
                                                formatDate(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.startDate)
                                            }}, {{
                                                formatTime(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.startDate)
                                            }} - {{
                                                formatTime(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.endDate)
                                            }}
                                        </p>
                                        <p class="stop-duration">
                                            Tempo parado: {{
                                                getStopDuration(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.startDate,
                                                    stopPoints[index].geoJsonDTO.features[featureIndex].geometry.endDate) }}
                                            minutos
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <v-btn v-if="remainingPoints(index) > 0" class="btn-next-address"
                            @click="showNextAddress(index)" variant="text">
                            + {{ remainingPoints(index) }} ponto<span v-if="remainingPoints(index) > 1">s</span> de
                            parada
                        </v-btn>
                        <p v-else-if="addresses[index].length > 1"
                            style="text-align: right; color: #3f51b5; margin-top: 5px;">
                            Todos os pontos foram exibidos
                        </p>
                        <v-divider v-if="index < addresses.length - 1"></v-divider>
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
import { defineProps, ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps<{
    stopPoints: Array<{
        user: string;
        device: string;
        geoJsonDTO: {
            features: Array<{
                geometry: {
                    coordinates: [number, number];
                    startDate: string;
                    endDate: string;
                };
            }>;
        };
    }>;
}>();

const addresses = ref<string[][]>([]);
const displayedAddresses = ref<string[][]>([]);

const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    return names.slice(0, 2).join(' '); // Retorna os dois primeiros nomes
};

const getFormattedAddress = async (lat: number, lng: number) => {
    const apiKey = 'AIzaSyD7OMuCxvuTi0AfzyZLoChSWkjUzNQj8Lk';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lng},${lat}&key=${apiKey}&language=BR&region`;

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

const remainingPoints = (index: number) => {
    return addresses.value[index].length - displayedAddresses.value[index].length;
};

const showNextAddress = (index: number) => {
    const nextIndex = displayedAddresses.value[index].length;
    if (nextIndex < addresses.value[index].length) {
        displayedAddresses.value[index].push(addresses.value[index][nextIndex]);
    }
};

const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit', month: '2-digit', year: 'numeric'
    };
    return parsedDate.toLocaleDateString('pt-BR', options);
};

const formatTime = (date: string) => {
    const parsedDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit', minute: '2-digit'
    };
    return parsedDate.toLocaleTimeString('pt-BR', options);
};

const getStopDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 60000); // Converte a diferença para minutos
    return diffInMinutes;
};

watch(
    () => props.stopPoints,
    async (newStopPoints) => {
        addresses.value = []; // Limpa endereços antes de cada nova atualização
        displayedAddresses.value = []; // Inicializa endereços exibidos
        for (const point of newStopPoints) {
            const featureAddresses: string[] = [];
            for (const feature of point.geoJsonDTO.features) {
                const [lat, lng] = feature.geometry.coordinates;
                const address = await getFormattedAddress(lat, lng);
                featureAddresses.push(address);
            }
            addresses.value.push(featureAddresses);
            displayedAddresses.value.push(featureAddresses.slice(0, 1)); // Mostra inicialmente apenas o primeiro endereço
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

.btn-next-address {
    font-size: 14px;
    color: #000B62;
    padding: 5px 10px;
    border-radius: 8px;
    text-transform: none;
    transition: background-color 0.2s, color 0.2s;
}

.date-row {
    font-size: 14px;
    color: #777;
    margin-left: 30px;
}

.stop-duration {
    font-size: 14px;
    color: #777;
    margin-left: 30px;
}
</style>