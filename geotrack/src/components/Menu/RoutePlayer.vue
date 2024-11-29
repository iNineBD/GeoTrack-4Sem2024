<template>
    <v-card class="player-card" width="400px" height="140px" rounded="xl" elevation="4" color="primary">
        <v-card-text>
            <!-- Controles principais: Play/Pause, Informações adicionais, Velocidade -->
            <v-row align="center" justify="space-between" no-gutters>
                <!-- Botão Play/Pause -->
                <v-btn icon @click="togglePlay" size="small" color="secondary">
                    <v-icon v-if="isPlaying">mdi-pause</v-icon>
                    <v-icon v-else>mdi-play</v-icon>
                </v-btn>

                <!-- Cabeçalho com título -->
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ routeTitle }}</span>
                </v-card-title>

                <!-- Controle de Velocidade -->
                <v-menu v-model="showSpeedMenu" offset-y>
                    <template #activator="{ props }">
                        <v-btn icon text size="small" color="primary_light" v-bind="props">
                            {{ selectedSpeed }}x
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(speed, index) in speeds" :key="index" @click="selectSpeed(speed)"
                            class="text-secondary">
                            <v-list-item-title>{{ `${speed}x` }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-row>

            <!-- Informações adicionais -->
            <v-row align="center" justify="center" class="mt-2">
                <v-col class="info-col" cols="6">
                    <div class="info-item">
                        <span class="info-label">Distância percorrida:</span>
                        <span class="info-value">{{ distance }} km</span>
                    </div>
                </v-col>
                <v-col class="info-col" cols="6">
                    <div class="info-item">
                        <span class="info-label">Tempo estimado:</span>
                        <span class="info-value">{{ estimatedTime }}</span>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { eventBus } from '@/utils/EventBus';
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    routeTitle: string;
    routeData: {
        startDate: string;
        endDate: string;
        userName: string;
        device: string;
        coordinates: { latitude: number; longitude: number; date: string }[];
    };
}>();

const isPlaying = ref(false);
const speeds = [2.0, 1.5, 1.0, 0.5, 0.1];
const selectedSpeed = ref("1.0");
const showSpeedMenu = ref(false);
const distance = ref("0.0"); // Distância em quilômetros
const estimatedTime = ref(""); // Tempo estimado

onMounted(() => {
    calculateRouteData();
    eventBus.on("updateButtonState", (state: string) => {
        isPlaying.value = state === "play";
    });
});

onUnmounted(() => {
    eventBus.off("updateButtonState", (state: string) => {
        isPlaying.value = state === "play";
    });
});

const emit = defineEmits<{
    (event: 'play' | 'pause'): void;
    (event: 'speedChange', speed: number): void;
}>();

const togglePlay = () => {
    isPlaying.value = !isPlaying.value;
    emit(isPlaying.value ? 'play' : 'pause');
};

const selectSpeed = (speed: number) => {
    selectedSpeed.value = speed.toFixed(1); // Atualiza o botão com a velocidade selecionada
    emit("speedChange", speed);
    showSpeedMenu.value = false;
};

// Calcula a distância total percorrida
const calculateTotalDistance = (coordinates: { latitude: number; longitude: number }[]) => {
    let totalDistance = 0;

    // Loop para calcular a distância entre pontos consecutivos
    for (let i = 0; i < coordinates.length - 1; i++) {
        const point1 = coordinates[i];
        const point2 = coordinates[i + 1];

        // Calcula a distância entre os pontos consecutivos usando a fórmula de Haversine
        totalDistance += haversine(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
    }

    return totalDistance; // Distância total percorrida em quilômetros
};

// Fórmula de Haversine
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em quilômetros
    const toRad = (value: number) => (value * Math.PI) / 180; // Função para converter graus para radianos
    const dLat = toRad(lat2 - lat1); // Diferença de latitude
    const dLon = toRad(lon2 - lon1); // Diferença de longitude

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Cálculo do arco
    return R * c; // Distância em quilômetros
};

// Calcula a distância total e o tempo estimado
const calculateRouteData = () => {
    const { coordinates } = props.routeData;

    // Garantimos que existam coordenadas para o cálculo
    if (coordinates.length === 0) {
        distance.value = "0.0";
        estimatedTime.value = "00:00";
        return;
    }

    // Cálculo da distância total
    let totalDistance = calculateTotalDistance(coordinates);
    distance.value = totalDistance.toFixed(2);

    // Cálculo do tempo estimado baseado nas coordenadas
    const start = new Date(coordinates[0].date).getTime(); // Data do primeiro ponto
    const end = new Date(coordinates[coordinates.length - 1].date).getTime(); // Data do último ponto
    const diffInMinutes = Math.floor((end - start) / (1000 * 60)); // Diferença em minutos

    // Converte a diferença de tempo em horas e minutos
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    // Atualizamos o tempo estimado no formato hh:mm
    estimatedTime.value = `${hours}h ${minutes.toString().padStart(2, '0')}min`;
};

// Watcher para atualizar valores ao mudar o routeData
watch(
    () => props.routeData,
    (newRouteData) => {
        calculateRouteData();
    },
    { deep: true } // Monitora mudanças profundas no objeto
);
</script>

<style scoped>
.player-card {
    display: flex;
    flex-direction: column;
    position: fixed;
    margin-top: 330px;
}

/* Coluna de informações */
.info-col {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.info-label {
    font-size: 14px;
}

.info-value {
    font-size: 16px;
    font-weight: bold;
}
</style>
