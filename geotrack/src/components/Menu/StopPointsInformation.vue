<template>
    <v-card class="stop-points-card" width="400px" height="220px" rounded="xl" elevation="4">
        <v-col class="scrollable-container">
            <template v-if="stopPoints && stopPoints.length > 0">
                <ul>
                    <li v-for="(address, index) in addresses" :key="index" style="margin: 5px">
                        <div class="header-row">
                            <h5 class="user-name"><strong>{{ getUserInitials(stopPoints[index].user) }}</strong></h5>
                            <span class="device-name"><strong>{{ stopPoints[index].device }}</strong></span>
                        </div>
                        <ul class="stop-points-list">
                            <li v-for="(featureAddress, featureIndex) in address" :key="featureIndex">
                                <p><strong>Parada {{ featureIndex + 1 }}:</strong>
                                    {{ featureAddress }}
                                </p>
                            </li>
                        </ul>
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
                geometry: { coordinates: [number, number] };
            }>;
        };
    }>;
}>();

const addresses = ref<string[][]>([]);

const getUserInitials = (fullName: string) => {
    const names = fullName.split(' ');
    return names.slice(0, 2).join(' '); // Retorna os dois primeiros nomes
};

const getFormattedAddress = async (lat: number, lng: number) => {
    const apiKey = 'AIzaSyD7OMuCxvuTi0AfzyZLoChSWkjUzNQj8Lk';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

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

watch(
    () => props.stopPoints,
    async (newStopPoints) => {
        addresses.value = []; // Limpa endereços antes de cada nova atualização
        for (const point of newStopPoints) {
            const featureAddresses: string[] = [];
            for (const feature of point.geoJsonDTO.features) {
                const [lat, lng] = feature.geometry.coordinates;
                const address = await getFormattedAddress(lat, lng);
                featureAddresses.push(address);
            }
            addresses.value.push(featureAddresses);
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
    max-height: 220px;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #d5d9ff;
    padding: 8px 10px;
    border-radius: 8px;
    margin-bottom: 8px;
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
    padding-left: 10px;
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
</style>