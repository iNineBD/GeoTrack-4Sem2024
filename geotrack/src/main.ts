import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router';
import { registerPlugins } from '@/plugins';
import './assets/css/global.css';

const app = createApp(App);

registerPlugins(app);

app.use(router);

app.mount('#app');
