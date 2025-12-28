/**
 * Сервис для работы с API
 */
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;
        this.authToken = null;
        this.onAuthError = null; // Callback для обработки ошибок авторизации
    }

    /**
     * Установить обработчик ошибок авторизации
     * @param {Function} callback - Функция для вызова при ошибке авторизации
     */
    setAuthErrorHandler(callback) {
        this.onAuthError = callback;
    }

    /**
     * Проверить, является ли ошибка критической для авторизации
     * @param {Object} error - Объект ошибки
     * @returns {boolean}
     */
    isAuthError(error) {
        // 401 - Unauthorized
        if (error.status === 401) {
            return true;
        }

        // 403 - Forbidden
        if (error.status === 403) {
            return true;
        }

        // 404 с ошибкой USER_NOT_FOUND - пользователь удален или токен невалиден
        if (error.status === 404 && error.error === 'USER_NOT_FOUND') {
            return true;
        }

        // Токен истек или невалиден
        if (error.error === 'TOKEN_EXPIRED' || error.error === 'INVALID_TOKEN') {
            return true;
        }

        return false;
    }

    /**
     * Обработать критическую ошибку авторизации
     * @param {Object} error - Объект ошибки
     */
    async handleAuthError(error) {
        console.warn('🔴 Критическая ошибка авторизации:', error);

        if (this.onAuthError) {
            try {
                await this.onAuthError(error);
            } catch (callbackError) {
                console.error('Ошибка в обработчике авторизации:', callbackError);
            }
        }
    }

    /**
     * Базовый метод для HTTP запросов
     * @param {string} endpoint - Конечная точка API
     * @param {Object} options - Опции fetch
     * @returns {Promise<Response>}
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: this.timeout,
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            console.info('API SERVICE request fetch >>>', url, mergedOptions);

            const response = await fetch(url, {
                ...mergedOptions,
                signal: controller.signal,
            });

            console.info('API SERVICE request response <<<', response);
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: 'UNKNOWN_ERROR',
                    message: `HTTP ${response.status}: ${response.statusText}`,
                }));

                const error = {
                    status: response.status,
                    ...errorData,
                };

                // Проверяем, является ли это критической ошибкой авторизации
                if (this.isAuthError(error)) {
                    await this.handleAuthError(error);
                }

                throw error;
            }

            // Если ожидается blob
            if (options.responseType === 'blob') {
                return await response.blob();
            }

            // Обработка ответов без тела (204 No Content, 205 Reset Content)
            if (response.status === 204 || response.status === 205) {
                return null;
            }

            // Проверка наличия контента в ответе
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Если ответ не JSON, но статус успешный
                if (response.status >= 200 && response.status < 300) {
                    return null;
                }
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw {
                    error: 'TIMEOUT_ERROR',
                    message: 'Превышено время ожидания ответа от сервера',
                };
            }

            // Если ошибка уже обработана (имеет status), просто пробрасываем
            if (error.status) {
                throw error;
            }

            throw {
                error: 'NETWORK_ERROR',
                message: 'Ошибка сети. Проверьте подключение к интернету',
                originalError: error,
            };
        }
    }

    /**
     * Установка токена авторизации
     * @param {string} token - JWT токен
     */
    setAuthToken(token) {
        this.authToken = token;
    }

    /**
     * Очистка токена авторизации
     */
    clearAuthToken() {
        this.authToken = null;
    }

    /**
     * Авторизованный запрос
     * @param {string} endpoint - Конечная точка API
     * @param {Object} options - Опции fetch
     * @returns {Promise<Response>}
     */
    async authRequest(endpoint, options = {}) {
        console.log('authRequest', endpoint, options);
        if (!this.authToken) {
            const error = {
                error: 'NO_TOKEN',
                message: 'Токен авторизации отсутствует',
            };

            // Это тоже критическая ошибка авторизации
            await this.handleAuthError(error);
            throw error;
        }

        return this.request(endpoint, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${this.authToken}`,
            },
        });
    }
}

// Экспортируем синглтон экземпляр
export const apiService = new ApiService();
