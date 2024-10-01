<template>
  <v-app>
    <v-layout>
      <Sidebar />
      <v-main>
        <v-container fluid style="padding: 0;">
          <v-row no-gutters>
            <MapView />
          </v-row>
        </v-container>
      </v-main>
    </v-layout>
    <BottomNavegation />
  </v-app>
</template>

<script>
import Sidebar from './components/Menu/Sidebar.vue';
import MapView from './pages/MapView.vue';
import BottomNavegation from './components/Menu/BottomNavegation.vue';

export default {
  components: {
    Sidebar,
    MapView,
    BottomNavegation,
  },
};
</script>
