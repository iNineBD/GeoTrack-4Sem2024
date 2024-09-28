import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../components/MapView.vue';
import Filter from '../components/Filter.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MapView,
  },
  {
    path: '/filter',
    name: 'Filter',
    components: {
      default: MapView,
      filter: Filter,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
