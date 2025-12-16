import { apiService } from './api.js';

/**
 * Конфигурация для запроса данных аналитики
 * @typedef {Object} AnalyticsConfig
 * @property {boolean} includeDialogs - Запрашивать диалоги
 * @property {boolean} includeFolders - Запрашивать папки
 * @property {boolean} includeStats - Запрашивать статистику
 * @property {number} dialogsLimit - Лимит диалогов (по умолчанию 500)
 * @property {number} dialogsOffset - Смещение для пагинации
 */

/**
 * Класс для управления запросами данных аналитики
 */
class AnalyticsService {
    /**
     * Конфигурация по умолчанию
     * @type {AnalyticsConfig}
     */
    defaultConfig = {
        includeDialogs: true,
        includeFolders: true,
        includeStats: true,
        dialogsLimit: 500,
        dialogsOffset: 0,
    };

    /**
     * Получить информацию об аккаунте (профиль)
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Данные профиля
     */
    async getAccountInfo(accountId) {
        try {
            const response = await apiService.authRequest(`/accounts/${accountId}/me`);
            return response;
        } catch (error) {
            console.error('[AnalyticsService] Error fetching account info:', error);
            throw this._handleError(error, 'Ошибка загрузки информации об аккаунте');
        }
    }

    /**
     * Получить список диалогов
     * @param {number} accountId - ID аккаунта
     * @param {Object} options - Параметры запроса
     * @param {number} options.limit - Лимит диалогов (default: 100, max: 500)
     * @param {number} options.offset - Смещение для пагинации (default: 0)
     * @param {boolean} options.archived - Включить архивные (default: false)
     * @returns {Promise<Object>} Данные диалогов
     */
    async getDialogs(accountId, options = {}) {
        const { limit = 100, offset = 0, archived = false } = options;

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                archived: archived.toString(),
            });

            const response = await apiService.authRequest(
                `/accounts/${accountId}/dialogs?${params}`
            );

            return {
                total: response.total,
                hasMore: response.hasMore,
                dialogs: response.dialogs,
            };
        } catch (error) {
            console.error('[AnalyticsService] Error fetching dialogs:', error);
            throw this._handleError(error, 'Ошибка загрузки диалогов');
        }
    }

    /**
     * Получить список папок
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Array>} Список папок
     */
    async getFolders(accountId) {
        try {
            const response = await apiService.authRequest(`/accounts/${accountId}/folders`);
            return response;
        } catch (error) {
            console.error('[AnalyticsService] Error fetching folders:', error);
            throw this._handleError(error, 'Ошибка загрузки папок');
        }
    }

    /**
     * Загрузить все данные последовательно с отслеживанием прогресса
     * @param {number} accountId - ID аккаунта
     * @param {Function} onProgress - Callback для отслеживания прогресса
     * @returns {Promise<Object>} Все данные аналитики
     */
    async loadAllData(accountId, onProgress) {
        const steps = [
            {
                name: 'accountInfo',
                label: 'Загрузка информации об аккаунте',
                method: () => this.getAccountInfo(accountId),
            },
            {
                name: 'dialogs',
                label: 'Загрузка диалогов',
                method: () => this.getDialogs(accountId, { limit: 500 }),
            },
            {
                name: 'folders',
                label: 'Загрузка папок',
                method: () => this.getFolders(accountId),
            },
        ];

        const result = {};
        const totalSteps = steps.length;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const progress = ((i + 1) / totalSteps) * 100;

            try {
                // Уведомляем о начале загрузки шага
                if (onProgress) {
                    onProgress({
                        step: i + 1,
                        total: totalSteps,
                        progress: Math.round(progress),
                        label: step.label,
                        status: 'loading',
                    });
                }

                // Выполняем запрос
                const data = await step.method();
                result[step.name] = data;

                // Уведомляем об успешной загрузке
                if (onProgress) {
                    onProgress({
                        step: i + 1,
                        total: totalSteps,
                        progress: Math.round(progress),
                        label: step.label,
                        status: 'success',
                        data,
                    });
                }
            } catch (error) {
                // Уведомляем об ошибке
                if (onProgress) {
                    onProgress({
                        step: i + 1,
                        total: totalSteps,
                        progress: Math.round(progress),
                        label: step.label,
                        status: 'error',
                        error,
                    });
                }

                throw error;
            }
        }

        return result;
    }

    /**
     * Фильтрует данные согласно конфигурации
     * @private
     */
    _filterDataByConfig(data, config) {
        const result = {
            account: data.account,
        };

        if (config.includeDialogs && data.dialogs) {
            result.dialogs = data.dialogs;
        }

        if (config.includeFolders && data.folders) {
            result.folders = data.folders;
        }

        if (config.includeStats && data.stats) {
            result.stats = data.stats;
        }

        return result;
    }

    /**
     * Обработка ошибок API
     * @private
     */
    _handleError(error, defaultMessage = 'Произошла ошибка при получении данных') {
        if (error.error) {
            // Ошибка уже обработана в apiService
            return {
                code: error.error,
                userMessage: this._getErrorMessage(error.error, error.message),
                details: error,
            };
        }

        return {
            code: 'UNKNOWN_ERROR',
            userMessage: defaultMessage,
            details: error,
        };
    }

    /**
     * Получить понятное сообщение об ошибке
     * @private
     */
    _getErrorMessage(errorCode, defaultMessage) {
        const messages = {
            ACCOUNT_NOT_CONNECTED: 'Аккаунт не подключен к Telegram',
            ACCOUNT_NOT_FOUND: 'Аккаунт не найден',
            UNAUTHORIZED: 'Необходима авторизация',
            NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету',
            TIMEOUT_ERROR: 'Превышено время ожидания ответа от сервера',
        };

        return messages[errorCode] || defaultMessage;
    }
}

export const analyticsService = new AnalyticsService();
