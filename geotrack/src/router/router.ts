import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../pages/MapView.vue';

const routes = [
  {
    path: '/',
    redirect: '/stoppointsfilter',
  },
  {
    path: '/stoppointsfilter',
    name: 'StopPointFilter',
    component: MapView,
  },
  {
    path: '/geographicareasfilter',
    name: 'GeographicAreasFilter',
    component: MapView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
