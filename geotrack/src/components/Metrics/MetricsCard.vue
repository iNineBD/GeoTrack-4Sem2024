<template>
  <div class="metrics-container" :style="metricsContainerStyle">
    <v-card class="metric-card" rounded="xl" elevation="4" outlined>
      <div class="metric-text">
        USUÁRIOS MONITORADOS: {{ metrics?.qtdMonitored }}
      </div>
    </v-card>
    <v-card
      v-if="isGeographicAreasRoute"
      class="metric-card"
      rounded="xl"
      elevation="4"
      outlined
    >
      <div class="metric-text">
        ÁREAS GEOGRÁFICAS: {{ metrics?.qtdSessions }}
      </div>
    </v-card>
    <v-card class="metric-card" rounded="xl" elevation="4" outlined>
      <div class="metric-text">
        USUÁRIOS REGISTRADOS: {{ metrics?.qtdAdmins }}
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

interface Metrics {
  qtdMonitored: number;
  qtdSessions: number;
  qtdAdmins: number;
}

const metrics = ref<Metrics | null>(null);
const route = useRoute();

const isGeographicAreasRoute = computed(
  () => route.name === "GeographicAreasFilter"
);

const isStoppingPointsRoute = computed(() => route.name === "StopPointFilter");

// Estilo condicional para os cards de métricas dependendo da rota
const metricsContainerStyle = computed(() => {
  if (isGeographicAreasRoute.value) {
    return { bottom: "155px" };
  } else if (isStoppingPointsRoute.value) {
    return { bottom: "275px" };
  } else {
    return { bottom: "100px" };
  }
});

const fetchMetrics = async () => {
  try {
    const response = await axios.get("http://localhost:8080/metrics");
    metrics.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
  }
};

watchEffect(() => {
  fetchMetrics();
});

onMounted(() => {
  fetchMetrics();
});
</script>

<style scoped>
.metrics-container {
  position: fixed;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  max-width: calc(100% - 40px);
  width: 400px;
}
.metric-card {
  width: 100%;
  background-color: rgba(128, 128, 128, 0.8);
  padding: 10px;
}
.metric-text {
  font-size: 13px;
  color: black;
  font-weight: bold;
  text-align: center;
}
</style>
