<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import StopPointsModal from "./StopPointsModal.vue";
import GeographicAreasModal from "./GeographicAreasModal.vue";
import GeoRoutesModal from "./GeoRoutesModal.vue";

type RoutePath =
  | "/stoppointsfilter"
  | "/geographicareasfilter"
  | "/georoutesfilter";

const showModal = ref(false);
const route = useRoute();

const modalsMap: Record<RoutePath, any> = {
  "/stoppointsfilter": StopPointsModal,
  "/geographicareasfilter": GeographicAreasModal,
  "/georoutesfilter": GeoRoutesModal,
};

const ModalComponent = computed(() => {
  console.log("Rota atual:", route.path); // Debug para verificar a rota atual
  return modalsMap[route.path as RoutePath] || null;
});
</script>

<template>
  <div>
    <!-- Botão para abrir a modal -->
    <v-btn
      class="tooltip-btn"
      title="Dúvidas?"
      color="primary"
      icon="mdi-help-circle"
      @click="showModal = true"
    ></v-btn>

    <!-- Modal condicional -->
    <v-dialog v-model="showModal" persistent max-width="1000px">
      <component :is="ModalComponent" @close="showModal = false" />
    </v-dialog>
  </div>
</template>

<style scoped>
.tooltip-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  z-index: 10;
}
</style>
