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
     * Получить все данные для аналитики по аккаунту
     * @param {number} accountId - ID аккаунта
     * @param {Partial<AnalyticsConfig>} config - Конфигурация запроса
     * @returns {Promise<Object>} Данные аналитики
     */
    async getAnalyticsData(accountId, config = {}) {
        const finalConfig = { ...this.defaultConfig, ...config };

        try {
            // Используем общий эндпоинт для получения всех данных
            const response = await apiService.request(`/api/accounts/${accountId}/data`);

            // Фильтруем данные согласно конфигурации
            return this._filterDataByConfig(response.data, finalConfig);
        } catch (error) {
            console.error('[AnalyticsService] Error fetching analytics data:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Получить только диалоги
     * @param {number} accountId - ID аккаунта
     * @param {number} limit - Лимит диалогов
     * @param {number} offset - Смещение
     * @returns {Promise<Object>} Данные диалогов
     */
    async getDialogs(accountId, limit = 500, offset = 0) {
        try {
            const response = await apiService.request(`/api/accounts/${accountId}/dialogs`, {
                params: { limit, offset },
            });

            return {
                total: response.data.total,
                dialogs: response.data.dialogs,
            };
        } catch (error) {
            console.error('[AnalyticsService] Error fetching dialogs:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Получить статистику по диалогам
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Статистика
     */
    async getDialogStats(accountId) {
        try {
            const response = await apiService.request(`/api/accounts/${accountId}/dialogs/stats`);
            return response.data;
        } catch (error) {
            console.error('[AnalyticsService] Error fetching dialog stats:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Получить папки
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Array>} Список папок
     */
    async getFolders(accountId) {
        try {
            const response = await apiService.request(`/api/accounts/${accountId}/folders`);
            return response.data;
        } catch (error) {
            console.error('[AnalyticsService] Error fetching folders:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Получить рекомендуемые папки
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Array>} Рекомендуемые папки
     */
    async getSuggestedFolders(accountId) {
        try {
            const response = await apiService.request(
                `/api/accounts/${accountId}/folders/suggested`
            );
            return response.data;
        } catch (error) {
            console.error('[AnalyticsService] Error fetching suggested folders:', error);
            throw this._handleError(error);
        }
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
    _handleError(error) {
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 403:
                    return {
                        code: 'ACCOUNT_NOT_CONNECTED',
                        userMessage: 'Аккаунт не подключен к Telegram',
                        details: data,
                    };
                case 404:
                    return {
                        code: 'ACCOUNT_NOT_FOUND',
                        userMessage: 'Аккаунт не найден',
                        details: data,
                    };
                case 401:
                    return {
                        code: 'UNAUTHORIZED',
                        userMessage: 'Необходима авторизация',
                        details: data,
                    };
                default:
                    return {
                        code: 'UNKNOWN_ERROR',
                        userMessage: data?.message || 'Произошла ошибка при получении данных',
                        details: data,
                    };
            }
        }

        return {
            code: 'NETWORK_ERROR',
            userMessage: 'Ошибка сети. Проверьте подключение к интернету',
            details: error.message,
        };
    }
}

export const analyticsService = new AnalyticsService();
