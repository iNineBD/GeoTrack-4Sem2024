<template>
  <div class="floating-panel">
    <v-container width="400px" class="panel-container" style="padding: 0px;">
      <v-expansion-panels v-model="panel" rounded="xl" elevation="4">
        <v-expansion-panel>
          <template v-slot:title>
            <v-row class="panel-header" justify="center" align="center">
              <v-img :src="logo" height="30" class="icon" />
            </v-row>
          </template>
          <v-expansion-panel-text style="padding: 0px;">

            <v-container width="400px" class="filter-container" v-show="showFilter" style="padding: 0px;">
              <v-divider :thickness="2"/>
              <Filter @consult="handleFilterData" @drawCircle="handleDrawCircle"/>
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>


    <v-speed-dial v-model="dial" location="bottom center" transition="scale-transition" class="speed-dial">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" icon="mdi-menu" large elevation="4"></v-btn>
      </template>

      <v-btn key="map-marker" @click="goToFilter" icon="mdi-map-marker" ></v-btn>
    </v-speed-dial>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Filter from "../Filter/Filter.vue";
import { FilterData } from "@/pages/MapView.vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps<{
  onConsult: (data: FilterData) => void;
  onDrawCircle: () => void;
}>();

const handleFilterData = (data: FilterData) => {
  props.onConsult(data);
};

const handleDrawCircle = () => {
  props.onDrawCircle();
};

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

const goToFilter = () => {
  router.push("/");
  toggleDial();
};
</script>

<style scoped>
.floating-panel {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  max-width: calc(100% - 40px);
  gap: 10px;
}
</style>
