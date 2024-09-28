<template>
  <v-card >
    <v-layout style="height: 100%;">
      <!-- Sidebar para desktop -->
      <v-navigation-drawer
        v-if="!isMobile"
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
      >
        <v-list-item nav>
          <v-img
            :src="rail ? logoPin : logo"
            height="32"
            style="margin: 6px;"
          />
          <template v-slot:append>
            <v-btn
              v-if="!rail"
              icon="mdi-chevron-left"
              variant="text"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>

        <!-- Divider -->
        <v-divider></v-divider>

        <!-- Navigation List -->
        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home" title="Home" to="/" :color="drawer ? 'primary' : ''" @click.stop="rail = !rail"></v-list-item>
          <v-list-item prepend-icon="mdi-filter" title="Filtrar" to="/filter" :color="drawer ? 'primary' : ''" @click.stop="rail = !rail"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Bottom Navigation para dispositivos móveis -->
      <v-bottom-navigation v-if="isMobile" grow>
        <v-btn value="home" to="/">
          <v-icon>mdi-home</v-icon>
          <span>Home</span>
        </v-btn>
        <v-btn value="filter" to="/filter">
          <v-icon>mdi-filter</v-icon>
          <span>Filtrar</span>
        </v-btn>
      </v-bottom-navigation>

      <v-main style="height: 250px"></v-main>
    </v-layout>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 600; // Define o limite para dispositivos móveis
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

const logo = '/src/assets/Logo.svg';
const logoPin = '/src/assets/LogoPin.svg';
const drawer = ref(true);
const rail = ref(true);
</script>

<style scoped>
.v-navigation-drawer {
  height: 100vh;
}
</style>
