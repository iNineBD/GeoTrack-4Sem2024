import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue'; 
import MapView from '../pages/MapView.vue';
import Register from '../pages/Register.vue'; // Adicione esta linha

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
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
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
