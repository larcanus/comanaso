import { apiService } from './api.js';
import { log10 } from 'chart.js/helpers';

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
     * Получить информацию об аккаунте (профиль)
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Данные профиля
     */
    async getAccountInfo(accountId) {
        try {
            return await apiService.authRequest(`/accounts/${accountId}/me`);
        } catch (error) {
            console.error('[AnalyticsService] Error fetching account info:', error);
            throw this._handleError(error, 'Ошибка загрузки информации об аккаунте');
        }
    }

    /**
     * Получить фото профиля аккаунта
     * @param {number} accountId - ID аккаунта
     * @param {string} size - Размер фото ("small" или "big")
     * @returns {Promise<string|null>} URL фото или null если не установлено
     */
    async getProfilePhoto(accountId, size = 'big') {
        try {
            const params = new URLSearchParams({ size });
            const blob = await apiService.authRequest(`/accounts/${accountId}/me/photo?${params}`, {
                method: 'GET',
                responseType: 'blob',
            });

            // Создаем blob URL для изображения
            if (blob && blob instanceof Blob && blob.size > 0) {
                const photoUrl = URL.createObjectURL(blob);
                console.info('[AnalyticsService] Profile photo loaded successfully', {
                    size: blob.size,
                    type: blob.type,
                });
                return photoUrl;
            }

            console.warn('[AnalyticsService] Received empty blob');
            return null;
        } catch (error) {
            // Если фото не установлено - это нормально
            if (error.error === 'PHOTO_NOT_FOUND') {
                console.info('[AnalyticsService] Profile photo not set');
                return null;
            }

            console.error('[AnalyticsService] Error fetching profile photo:', error);
            throw this._handleError(error, 'Ошибка загрузки фото профиля');
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
        const { limit = 100, offset = 0 } = options;

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
            });

            const response = await apiService.authRequest(
                `/accounts/${accountId}/dialogs?${params}`
            );
            console.info('[AnalyticsService] fetching dialogs response:', response);
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
            console.info('[AnalyticsService] fetching folders response:', response);
            return response;
        } catch (error) {
            console.error('[AnalyticsService] Error fetching folders:', error);
            throw this._handleError(error, 'Ошибка загрузки папок');
        }
    }

    /**
     * Получить AI анализ данных Telegram
     * @param {Object} telegramData - Данные Telegram для анализа
     * @param {Function} onChunk - Callback для обработки стриминговых чанков
     * @returns {Promise<void>}
     */
    async getAiAnalysis(telegramData, onChunk) {
        try {
            const response = await apiService.aiStreamRequest(telegramData);

            if (response.isError) {
                throw response.userMessage;
            }

            // Обрабатываем стриминговый ответ
            const reader = response?.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            console.info('[AnalyticsService] AI analysis completed');
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;

                            if (content && onChunk) {
                                onChunk({ content });
                            }
                        } catch (parseError) {
                            console.warn(
                                '[AnalyticsService] Failed to parse AI response chunk:',
                                parseError
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[AnalyticsService] Error in AI analysis:', error);

            // Если ошибка уже имеет userMessage, просто пробрасываем
            if (error.userMessage) {
                throw error;
            }

            // Обрабатываем сетевые ошибки
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw {
                    code: 'NETWORK_ERROR',
                    userMessage: 'Ошибка сети при подключении к AI сервису',
                    details: error,
                };
            }

            throw this._handleError(error, 'Ошибка при выполнении AI анализа');
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
                name: 'profilePhoto',
                label: 'Загрузка фото профиля',
                method: () => this.getProfilePhoto(accountId),
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

                // Уведомляем об успешном завершении шага
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
                console.error(`[AnalyticsService] Error in step ${step.name}:`, error);

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
            PHOTO_NOT_FOUND: 'Фото профиля не установлено',
            AI_SERVICE_NOT_CONFIGURED: 'AI сервис не настроен',
            AI_SERVICE_ERROR: 'Ошибка AI сервиса',
        };

        return messages[errorCode] || defaultMessage;
    }
}

export const analyticsService = new AnalyticsService();
