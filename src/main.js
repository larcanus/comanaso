import './style/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import localStorageUtils from '@/store/localStorage.js';

const app = createApp(App);
const store = createPinia();
app.use(store);
app.use(router);

localStorageUtils.initLocalStore().catch(console.error);

app.mount('#app');
