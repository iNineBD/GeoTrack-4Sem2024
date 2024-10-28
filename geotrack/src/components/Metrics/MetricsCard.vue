<template>
  <div class="metrics-container">
    <v-card class="metric-card" rounded="xl" elevation="4" outlined>
      <div class="metric-text">
        USUÁRIOS MONITORADOS: {{ metrics?.qtdMonitored }}
      </div>
    </v-card>
    <v-card class="metric-card" rounded="xl" elevation="4" outlined>
      <div class="metric-text">
        ÁREAS GEOGRÁFICAS: {{ metrics?.qtdSessions }}
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from "vue";
import axios from "axios";

interface Metrics {
  qtdMonitored: number;
  qtdSessions: number;
}

const metrics = ref<Metrics | null>(null);

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
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  max-width: calc(100% - 40px);
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
