import { registerPlugins } from '@/plugins';
import axios from 'axios';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/css/global.css';
import router from './router/router';

axios.defaults.withCredentials = true;

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const app = createApp(App);

registerPlugins(app);

app.use(router);

app.mount('#app');
