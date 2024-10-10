<template>
  <div class="floating-panel">
    <div class="panel-container">
      <v-expansion-panels v-model="panel">
        <v-expansion-panel>
          <template v-slot:title>
            <div class="panel-header">
              <v-img :src="logo" height="32" class="icon" />
            </div>
          </template>
          <v-expansion-panel-text>
            <div class="filter-container" v-show="showFilter">
              <Filter @consult="props.onConsult" />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="speed-dial-container">
      <v-speed-dial
        v-model="dial"
        location="bottom center"
        transition="scale-transition"
        class="speed-dial"
      >
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" icon="mdi-menu" large></v-btn>
        </template>

        <v-btn
          key="map-marker"
          @click="goToFilter"
          icon="mdi-map-marker"
        ></v-btn>
      </v-speed-dial>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Filter from "../Filter/Filter.vue";
import { FilterData } from "@/pages/MapView.vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps<{
  onConsult: (data: FilterData) => void;
}>();

const logo = "/src/assets/Logo.svg";
const panel = ref([]);
const dial = ref(false);

const route = useRoute();
const router = useRouter();

const showFilter = computed(
  () => route.path === "/" || route.path === "/filter"
);

const toggleDial = () => {
  dial.value = !dial.value;
};

// const goToHome = () => {
//   router.push("/");
// };

const goToFilter = () => {
  router.push("/filter");
  toggleDial();
};
</script>

<style scoped>
.floating-panel {
  position: fixed;
  top: 100px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  max-width: calc(100% - 40px);
}

.panel-container {
  display: flex;
  width: 100%;
}

.expansion-panel {
  width: 500px;
  max-width: 90vw;
  background-color: white;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.filter-container {
  padding: 10px;
  width: 100%;
}

.speed-dial-container {
  margin-left: 16px;
}

.icon {
  cursor: pointer;
}

.v-expansion-panel-header {
  font-size: 16px;
  font-weight: bold;
  padding: 0 16px;
}

.v-expansion-panel--active .panel-header,
.v-expansion-panel:not(.v-expansion-panel--active) .panel-header {
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
