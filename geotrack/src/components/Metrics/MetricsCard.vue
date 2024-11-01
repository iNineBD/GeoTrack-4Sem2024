<template>
  <div class="metrics-container">
    <v-card class="metric-card" rounded="xl" elevation="4" outlined>
      <div class="metric-text">
        USUÁRIOS MONITORADOS: {{ metrics?.qtdMonitored }}
      </div>
    </v-card>
    <v-card class="metric-card" rounded="xl" elevation="4" outlined>
      <div class="metric-text">
        USUÁRIOS REGISTRADOS: {{ metrics?.qtdAdmins }}
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  width: 350px;
  padding-bottom: 20px;
  margin: auto;
}
.metric-card {
  width: 100%;
  background-color: #767cab96;
  padding: 10px;
}
.metric-text {
  font-size: 13px;
  color: black;
  font-weight: bold;
  text-align: center;
}
</style>
