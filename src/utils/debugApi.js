/**
 * Debug API для ручного тестирования и отладки
 * Позволяет включать/выключать режим отладки и логирование
 */
import logger from './logger';

/**
 * Debug API класс
 */
class DebugAPI {
    constructor() {
        this.isDebugMode = false;
        this.router = null;
        this.app = null;
    }

    /**
     * Инициализирует Debug API с Vue app и router
     * @param {object} app - Vue app instance
     * @param {object} router - Vue Router instance
     */
    initialize(app, router) {
        this.app = app;
        this.router = router;
        logger.initialize(this);
        logger.log('[Debug API] Initialized with app and router');
    }

    /**
     * Включает debug режим
     */
    enable() {
        this.isDebugMode = true;
        logger.info('[Debug API] Debug mode ENABLED');
        logger.info('[Debug API] Use "debugApi.help()" for available commands');
    }

    /**
     * Выключает debug режим
     */
    disable() {
        this.isDebugMode = false;
        logger.log('[Debug API] Debug mode DISABLED');
    }

    /**
     * Проверяет, активен ли debug режим
     * @returns {boolean}
     */
    isEnabled() {
        return this.isDebugMode;
    }

    /**
     * Получает информацию о текущем роуте
     * @returns {object}
     */
    getRouteInfo() {
        if (!this.isDebugMode) {
            logger.warn('Debug mode is not enabled. Call debugApi.enable() first');
            return null;
        }

        if (!this.router) {
            logger.error('[Debug API] Router not initialized');
            return null;
        }

        const currentRoute = this.router.currentRoute.value;

        const routeInfo = {
            path: currentRoute.path,
            name: currentRoute.name,
            params: currentRoute.params,
            query: currentRoute.query,
            meta: currentRoute.meta,
        };

        logger.table('Current Route', routeInfo);
        return routeInfo;
    }

    /**
     * Навигация к указанному пути
     * @param {string} path - Путь для навигации
     */
    navigateTo(path) {
        if (!this.router) {
            logger.error('[Debug API] Router not initialized');
            return;
        }

        logger.info('[Debug API] Navigating to:', path);
        this.router.push(path);
    }

    /**
     * Очищает localStorage
     * @param {string} [key] - Конкретный ключ для удаления (опционально)
     */
    clearStorage(key = null) {
        if (!this.isDebugMode) {
            console.warn('Debug mode is not enabled. Call debugApi.enable() first');
            return;
        }

        try {
            if (key) {
                localStorage.removeItem(key);
                logger.info('[Debug API] Removed from localStorage:', key);
            } else {
                const confirmation = confirm(
                    'Вы уверены, что хотите очистить весь localStorage? Это удалит все сохраненные данные.'
                );
                if (confirmation) {
                    localStorage.clear();
                    logger.info('[Debug API] localStorage cleared');
                    logger.warn('[Debug API] Page reload recommended');
                }
            }
        } catch (error) {
            logger.error('[Debug API] Error clearing storage:', error);
        }
    }

    /**
     * Показывает содержимое localStorage
     * @returns {object}
     */
    showStorage() {
        if (!this.isDebugMode) {
            console.warn('Debug mode is not enabled. Call debugApi.enable() first');
            return null;
        }

        const storage = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                storage[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                storage[key] = localStorage.getItem(key);
            }
        }

        logger.group('LocalStorage Contents', () => {
            Object.entries(storage).forEach(([key, value]) => {
                logger.info(`[${key}]:`, value);
            });
        });

        return storage;
    }

    /**
     * Имитирует ошибку для тестирования обработки ошибок
     * @param {string} type - Тип ошибки ('network', 'auth', 'unknown')
     */
    simulateError(type = 'unknown') {
        if (!this.isDebugMode) {
            console.warn('Debug mode is not enabled. Call debugApi.enable() first');
            return;
        }

        const errors = {
            network: new Error('Network request failed'),
            auth: new Error('Authentication failed'),
            unknown: new Error('Unknown error occurred'),
        };

        const error = errors[type] || errors.unknown;
        logger.error('[Debug API] Simulated error:', error);
        throw error;
    }

    /**
     * Выводит информацию о производительности
     */
    showPerformance() {
        if (!this.isDebugMode) {
            console.warn('Debug mode is not enabled. Call debugApi.enable() first');
            return;
        }

        if (!window.performance) {
            logger.warn('[Debug API] Performance API not available');
            return;
        }

        const perfData = window.performance.getEntriesByType('navigation')[0];
        const timing = window.performance.timing;

        const metrics = {
            'Page Load Time': `${(perfData?.loadEventEnd - perfData?.fetchStart).toFixed(2)}ms`,
            'DOM Content Loaded': `${(timing.domContentLoadedEventEnd - timing.navigationStart).toFixed(2)}ms`,
            'DOM Interactive': `${(timing.domInteractive - timing.navigationStart).toFixed(2)}ms`,
            'DNS Lookup': `${(timing.domainLookupEnd - timing.domainLookupStart).toFixed(2)}ms`,
            'TCP Connection': `${(timing.connectEnd - timing.connectStart).toFixed(2)}ms`,
        };

        logger.group('Performance Metrics', () => {
            Object.entries(metrics).forEach(([key, value]) => {
                logger.info(key + ':', value);
            });
        });
    }

    /**
     * Включает/выключает Vue devtools подсказки
     * @param {boolean} enable - Включить или выключить
     */
    toggleDevtools(enable = true) {
        if (!this.app) {
            logger.error('[Debug API] App not initialized');
            return;
        }

        this.app.config.performance = enable;
        this.app.config.devtools = enable;

        logger.info('[Debug API] Vue devtools:', enable ? 'ENABLED' : 'DISABLED');
    }

    /**
     * Выводит справку по использованию API
     */
    help() {
        console.log(`
=== Debug API Help ===

🔧 Основные команды:
--------------------
debugApi.enable()              - Включить debug режим
debugApi.disable()             - Выключить debug режим
debugApi.isEnabled()           - Проверить статус debug режима

📊 Информация о состоянии:
-------------------------
debugApi.getStoresState()      - Показать состояние всех stores
debugApi.getRouteInfo()        - Информация о текущем роуте
debugApi.showPerformance()     - Метрики производительности

🗺️ Навигация:
-------------
debugApi.navigateTo('/path')   - Перейти на указанный путь

💾 LocalStorage:
---------------
debugApi.showStorage()         - Показать содержимое localStorage
debugApi.clearStorage()        - Очистить весь localStorage
debugApi.clearStorage('key')   - Удалить конкретный ключ

🛠️ Утилиты:
-----------
debugApi.simulateError('type') - Симулировать ошибку (network/auth/unknown)
debugApi.toggleDevtools(true)  - Включить Vue devtools

📝 Логирование:
--------------
logger.help()                  - Справка по logger
logger.log('message', data)    - Обычное логирование
logger.info('tag', 'message')  - Информационное
logger.debug('tag', 'details') - Детальное
logger.warn('tag', 'warning')  - Предупреждения
logger.error('tag', 'error')   - Ошибки

Примеры использования:
--------------------
// Базовый debug
debugApi.enable()
logger.info('App', 'Started debugging')

// Просмотр состояния
debugApi.getRouteInfo()

// Навигация
debugApi.navigateTo('/dialogs')

// Очистка данных
debugApi.clearStorage('auth_token')
debugApi.clearStorage()  // Очистит все

// Производительность
debugApi.showPerformance()
        `);
    }
}

// Создаем singleton экземпляр
const debugApi = new DebugAPI();

// Добавляем в window для глобального доступа
if (typeof window !== 'undefined') {
    window.debugApi = debugApi;
    window.logger = logger;
}

export default debugApi;
