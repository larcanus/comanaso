import './style/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { apiService } from '@/services/api.js';
import { forceLogout } from '@/store/storeController.js';
import localStorageUtils from '@/store/localStorage.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
// Обработчик критических ошибок авторизации
apiService.setAuthErrorHandler(forceLogout);

localStorageUtils.initLocalStore().catch(console.error);

app.mount('#app');
