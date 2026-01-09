import './style/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { apiService } from '@/services/api.js';
import { forceLogout } from '@/store/storeController.js';
import localStorageUtils from '@/store/localStorage.js';
import debugApi from '@/utils/debugApi';
import logger from '@/utils/logger';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Обработчик критических ошибок авторизации
apiService.setAuthErrorHandler(forceLogout);

localStorageUtils.initLocalStore().catch(logger.error);

app.use(router);

// Инициализация Debug API
debugApi.initialize(app, router);

// В режиме разработки автоматически включаем debug
if (import.meta.env.MODE === 'development') {
    logger.log('[App] Development mode detected');
    logger.log('[App] Debug API available: window.debugApi');
    logger.log('[App] Logger available: window.logger');
    logger.log('[App] Use "debugApi.enable()" to start debugging');
    logger.log('[App] Use "debugApi.help()" for available commands');
}

app.mount('#app');
