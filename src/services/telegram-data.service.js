import { apiService } from './api.js';

/**
 * Сервис для работы с данными Telegram (диалоги, папки и т.д.)
 */
export class TelegramDataService {
    /**
     * Получить диалоги аккаунта
     * @param {number} accountId - ID аккаунта
     * @param {number} limit - Лимит диалогов
     * @param {number} offset - Смещение для пагинации
     * @returns {Promise<Array>} Список диалогов
     */
    async getDialogs(accountId, limit = 100, offset = 0) {
        try {
            return await apiService.authRequest(
                `/accounts/${accountId}/dialogs?limit=${limit}&offset=${offset}`,
                {
                    method: 'GET',
                }
            );
        } catch (error) {
            console.error('Get dialogs error:', error);

            throw {
                ...error,
                userMessage: error.message || 'Ошибка получения диалогов',
            };
        }
    }

    /**
     * Получить папки аккаунта
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Array>} Список папок
     */
    async getFolders(accountId) {
        try {
            return await apiService.authRequest(`/accounts/${accountId}/folders`, {
                method: 'GET',
            });
        } catch (error) {
            console.error('Get folders error:', error);

            throw {
                ...error,
                userMessage: error.message || 'Ошибка получения папок',
            };
        }
    }

    /**
     * Получить рекомендуемые папки
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Array>} Список рекомендуемых папок
     */
    async getSuggestedDialogFilters(accountId) {
        try {
            return await apiService.authRequest(`/accounts/${accountId}/folders/suggested`, {
                method: 'GET',
            });
        } catch (error) {
            console.error('Get suggested filters error:', error);

            throw {
                ...error,
                userMessage: error.message || 'Ошибка получения рекомендуемых папок',
            };
        }
    }

    /**
     * Получить все данные аккаунта (диалоги, папки и т.д.)
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Все данные аккаунта
     */
    async getCommonData(accountId) {
        try {
            return await apiService.authRequest(`/accounts/${accountId}/data`, {
                method: 'GET',
            });
        } catch (error) {
            console.error('Get common data error:', error);

            throw {
                ...error,
                userMessage: error.message || 'Ошибка получения данных аккаунта',
            };
        }
    }
}

// Экспортируем синглтон экземпляр
export const telegramDataService = new TelegramDataService();
