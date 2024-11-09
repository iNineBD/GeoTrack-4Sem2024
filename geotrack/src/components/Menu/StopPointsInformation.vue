<template>
    <v-card class="stop-points-card" width="400px" height="300px" rounded="xl" elevation="4" color="primary">
        <template v-if="stopPoints && stopPoints.length > 0">
            <v-list class="stop-points-list bg-primary">
                <v-list-item v-for="(address, index) in addresses" :key="index" class="mb-1">
                    <v-sheet class="pa-2 mb-2" color="primary_light" elevation="0" rounded>
                        <v-row align="center" justify="space-between" style="padding: 5px 12px;">
                            <span style="font-weight: bold; font-size: 16px;">
                                {{ getUserInitials(stopPoints[index].user) }}
                            </span>
                            <span outlined>
                                {{ stopPoints[index].device }}
                            </span>
                        </v-row>
                    </v-sheet>
                    <v-list style="padding: 0;" class="bg-primary">
                        <v-list-item v-for="(featureAddress, featureIndex) in displayedAddresses[index]"
                            :key="featureIndex"
                            @click="goToLocation(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.coordinates)"
                            style="padding: 0;" color="primary">
                            <v-row align="start" no-gutters class="px-2 py-1" style="padding: 0;">
                                <v-col cols="1">
                                    <v-icon color="secondary" class="mt-1">mdi-map-marker</v-icon>
                                </v-col>
                                <v-col cols="11">
                                    <v-list-item-title>
                                        {{ featureAddress }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ "Data: " }}{{
                                            formatDate(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.startDate)
                                        }},
                                        {{
                                            formatTime(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.startDate)
                                        }} -
                                        {{
                                            formatTime(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.endDate)
                                        }}
                                    </v-list-item-subtitle>
                                    <v-list-item-subtitle>
                                        Tempo parado: {{ " " }}{{
                                            getStopDuration(stopPoints[index].geoJsonDTO.features[featureIndex].geometry.startDate,
                                                stopPoints[index].geoJsonDTO.features[featureIndex].geometry.endDate) }} minutos
                                    </v-list-item-subtitle>
                                </v-col>
                            </v-row>
                            <v-divider v-if="featureIndex < displayedAddresses[index].length"></v-divider>
                        </v-list-item>
                    </v-list>

                    <v-btn v-if="remainingPoints(index) > 0" color="secondary" variant="text"
                        @click="showNextAddress(index)">
                        + {{ remainingPoints(index) }} ponto<span v-if="remainingPoints(index) > 1">s</span> de
                        parada
                    </v-btn>
                </v-list-item>
            </v-list>
        </template>
        <template v-else>
            <v-row justify="center">
                <v-icon color="grey">mdi-alert</v-icon>
                <span>Nenhum ponto de parada encontrado.</span>
            </v-row>
        </template>
    </v-card>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, defineEmits } from 'vue';
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

const emit = defineEmits<{
    (event: 'go-to-location', coordinates: [number, number]): void;
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

const goToLocation = (coordinates: [number, number]) => {
    emit('go-to-location', coordinates);
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

.stop-points-list {
    max-height: 300px;
    overflow-y: auto;
}

.stop-points-list::-webkit-scrollbar {
    width: 10px;
}

.stop-points-list::-webkit-scrollbar-track {
    background: #f0f0f5;
    border-radius: 5px;
}

.stop-points-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #c7c9ff, #7a7de9);
    border-radius: 10px;
}

.stop-points-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #6b6fe1, #4f51d3);
    border-radius: 10px;
}

.v-list-item-title {
    word-wrap: break-word;
    white-space: normal;
}
</style>
