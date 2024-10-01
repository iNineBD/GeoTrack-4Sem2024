import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../pages/MapView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MapView,
  },
  {
    path: '/filter',
    name: 'Filter',
    component: MapView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
