<template>
  <div class="metrics-container">
    <v-card class="metric-card" rounded="xl" elevation="4" color="primary" outlined>
      <div class="metric-text">
        USUÁRIOS MONITORADOS: {{ metrics?.qtdMonitored }}
      </div>
    </v-card>
    <v-card class="metric-card" rounded="xl" elevation="4" color="primary" outlined>
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
      color="primary"
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  width: 250px;
  padding-bottom: 30px;
  margin: auto;
  margin-top: 06px; /* Ajuste este valor conforme necessário */
  color: primary;
}
.metric-card {
  width: 100%;
  background-color: "primary_light";
  padding: 10px;
}
.metric-text {
  font-size: 13px;
  color: "primary";
  font-weight: bold;
  text-align: center;
}
</style>
