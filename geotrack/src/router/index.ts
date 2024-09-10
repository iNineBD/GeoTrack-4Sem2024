import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../components/MapView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // Rota principal para o MapView
      name: 'map',
      component: MapView, // Exibe o MapView como página inicial
    }
  ]
});

export default router;
