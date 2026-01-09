/**
 * Централизованная утилита для логирования
 * Управляется через debugApi.isDebugMode
 */
class Logger {
    constructor() {
        this.debugApi = null;
    }

    /**
     * Инициализирует logger с debugApi
     * @param {object} debugApi - Экземпляр debugApi
     */
    initialize(debugApi) {
        this.debugApi = debugApi;
        logger.log('[Logger] Initialized with debugApi');
    }

    /**
     * Проверяет, включен ли debug режим
     * @returns {boolean}
     */
    isDebugEnabled() {
        return this.debugApi?.isDebugMode || false;
    }

    /**
     * Форматирует сообщение с префиксом
     * @returns {string}
     */
    formatPrefix() {
        const timestamp = new Date().toLocaleTimeString();
        return `[${timestamp}]`;
    }

    /**
     * Вызов нативного лога
     * @param {string} level
     * @param {Array} args - Аргументы для логирования
     */
    print(level, ...args) {
        if (!this.isDebugEnabled()) {
            return;
        }

        const prefix = this.formatPrefix();
        const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';

        console[consoleMethod](prefix, ...args);
    }

    /**
     * Основной метод логирования
     * @param {Array} args - Аргументы для логирования
     */
    log(...args) {
        this.print('LOG', ...args);
    }

    /**
     * Логирование ошибок (всегда показывается, даже без debug режима)
     * @param {Array} args - Аргументы
     */
    error(...args) {
        const prefix = this.formatPrefix();
        logger.error(prefix, ...args);
    }

    /**
     * Логирование предупреждений
     * @param {Array} args - Аргументы
     */
    warn(...args) {
        this.print('WARN', ...args);
    }

    /**
     * Информационное логирование
     * @param {Array} args - Аргументы
     */
    info(...args) {
        this.print('INFO', ...args);
    }

    /**
     * Debug логирование (самый подробный уровень)
     * @param {Array} args - Аргументы
     */
    debug(...args) {
        this.print('DEBUG', ...args);
    }

    /**
     * Группировка логов
     * @param {string} label - Заголовок группы
     * @param {Function} callback - Функция с логами внутри группы
     */
    group(label, callback) {
        if (!this.isDebugEnabled()) {
            return;
        }

        const prefix = this.formatPrefix();
        console.group(`${prefix} ${label}`);
        callback();
        console.groupEnd();
    }

    /**
     * Таблица данных
     * @param {string} label - Описание таблицы
     * @param {Array|Object} data - Данные для отображения
     */
    table(label, data) {
        if (!this.isDebugEnabled()) {
            return;
        }

        const prefix = this.formatPrefix();
        console.log(`${prefix} ${label}`);
        console.table(data);
    }

    /**
     * Замер времени выполнения
     * @param {string} label - Метка таймера
     */
    time(label) {
        if (!this.isDebugEnabled()) {
            return;
        }

        const timerLabel = `${label}`;
        console.time(timerLabel);
    }

    /**
     * Завершение замера времени
     * @param {string} label - Метка таймера
     */
    timeEnd(label) {
        if (!this.isDebugEnabled()) {
            return;
        }

        const timerLabel = `${label}`;
        console.timeEnd(timerLabel);
    }

    /**
     * Выводит справку по использованию
     */
    help() {
        console.log(`
=== Logger Help ===

Основные методы:
---------------
logger.log('message', data)       - Обычное логирование
logger.info('tag', 'message')     - Информационное
logger.debug('tag', 'details')    - Детальное (debug)
logger.warn('tag', 'warning')     - Предупреждения
logger.error('tag', 'error')      - Ошибки (всегда видны)

Группировка:
-----------
logger.group('Group Name', () => {
    logger.info('item 1')
    logger.info('item 2')
})

Таблицы:
-------
logger.table('Users', usersArray)

Замер времени:
-------------
logger.time('operation')
// ... код ...
logger.timeEnd('operation')

Примеры:
-------
// Включить debug режим
debugApi.enable()

// Использовать в коде
logger.info('API', 'Fetching data...')
logger.debug('Store', 'State updated:', state)
logger.error('Component', 'Render error:', error)
        `);
    }
}

// Создаем singleton экземпляр
const logger = new Logger();

export default logger;
