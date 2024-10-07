import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import {initLocalStore} from "@/store/localStorage.js";

const app = createApp(App);
const store = createPinia();
app.use(router);
app.use(store);

initLocalStore();

app.mount('#app');
