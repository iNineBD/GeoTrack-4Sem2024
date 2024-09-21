<template>
  <v-app>
    <v-layout>
      <Sidebar />
      <v-main>
        <v-container fluid style="padding: 0;">
          <v-row no-gutters>
            <v-col :md="$route.name != 'Filter' ? 0 : 3" v-if="!isMobile || $route.name === 'Filter'">
              <router-view name="filter"></router-view>
            </v-col>
            <v-col :md="$route.name != 'Filter' ? 12 : 9" v-if="!isMobile || $route.name !== 'Filter'">
              <MapView />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-layout>
    <BottomNavegation/>
  </v-app>
</template>

<script>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Menu/Sidebar.vue';
import MapView from './components/MapView.vue';
import BottomNavegation from './components/Menu/BottomNavegation.vue';

export default {
  components: {
    Sidebar,
    MapView,
    BottomNavegation,
  },
  setup() {
    const isMobile = ref(false);

    const checkMobile = () => {
      isMobile.value = window.innerWidth <1000; // Define o limite para dispositivos móveis
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    return {
      isMobile,
    };
  },
};
</script>
