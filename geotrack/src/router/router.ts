import { createRouter, createWebHistory } from 'vue-router';
import Vue from 'vue';
import Router from 'vue-router';
import Login from '../pages/Login.vue'; 
import MapView from '../pages/MapView.vue';
import Register from '../pages/Register.vue';

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
    beforeEnter: (to, from, next) => {
      if (isTokenExpired()) {
        next({ name: 'Login' });
      } else {
        next();
      }
    }
  },
  {
    path: '/geographicareasfilter',
    name: 'GeographicAreasFilter',
    component: MapView,
    beforeEnter: (to, from, next) => {
      if (isTokenExpired()) {
        next({ name: 'Login' });
      } else {
        next();
      }
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
];

// Função para verificar se o token está expirado
function isTokenExpired() {
  const expiration = localStorage.getItem('token');
  return !expiration || Date.now() > Number(expiration);
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  const requiresAuth = to.name !== 'Login';

  if (requiresAuth && (!token || isTokenExpired(token))) {
    next({
      name: 'Login'});
  } else {
    next();
  }
});

export default router;
