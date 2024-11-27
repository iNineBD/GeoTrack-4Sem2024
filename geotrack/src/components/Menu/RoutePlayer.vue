<template>
    <v-card class="player-card" width="400px" height="100px" rounded="xl" elevation="4" color="primary">
        <!-- Cabeçalho com título -->
        <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ routeTitle }}</span>
        </v-card-title>

        <v-card-text>
            <!-- Controles principais: Play/Pause, Barra de progresso, Velocidade -->
            <v-row align="center" justify="space-between" no-gutters>
                <!-- Botão Play/Pause -->
                <v-btn icon @click="togglePlay" size="small" color="primary">
                    <v-icon v-if="isPlaying">mdi-pause</v-icon>
                    <v-icon v-else>mdi-play</v-icon>
                </v-btn>

                <!-- Barra de Progresso -->
                <v-progress-linear v-model="progress" class="player-progress mx-3" height="8" color="secondary"
                    background-color="primary-darken-1" rounded>
                </v-progress-linear>

                <!-- Controle de Velocidade -->
                <v-menu v-model="showSpeedMenu" offset-y>
                    <template #activator="{ props }">
                        <v-btn icon text size="small" color="primary" v-bind="props">
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
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { eventBus } from '@/utils/EventBus';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    routeTitle: string;
    routeData: any;
}>();

const isPlaying = ref(false);
const progress = ref(0);
const speeds = [2.0, 1.5, 1.0, 0.5, 0.1];
const selectedSpeed = ref("1.0");
const showSpeedMenu = ref(false);

const emit = defineEmits<{
    (event: 'play' | 'pause'): void;
    (event: 'speedChange', speed: number): void;
}>();

const handleUpdateButtonState = (state: string) => {
    isPlaying.value = state === 'play';
};

onMounted(() => {
    eventBus.on('updateButtonState', handleUpdateButtonState);
});

onUnmounted(() => {
    eventBus.off('updateButtonState', handleUpdateButtonState);
});

const togglePlay = () => {
    isPlaying.value = !isPlaying.value;
    emit(isPlaying.value ? 'play' : 'pause');
};

const selectSpeed = (speed: number) => {
    selectedSpeed.value = speed.toFixed(1); // Atualiza o botão com a velocidade selecionada
    emit("speedChange", speed);
    showSpeedMenu.value = false;
};
</script>

<style scoped>
.player-card {
    display: flex;
    flex-direction: column;
    position: fixed;
    margin-top: 330px;
}

/* Barra de progresso */
.player-progress {
    flex: 1;
}

/* Botão de fechar */
.close-button {
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
}

.close-button:hover {
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    color: rgb(103, 103, 103);
}

/* Espaçamento ajustado */
.v-row {
    margin: 0;
    padding: 0;
}
</style>
