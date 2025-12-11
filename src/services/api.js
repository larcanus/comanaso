/**
 * Сервис для работы с API
 */
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;
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

                throw {
                    status: response.status,
                    ...errorData,
                };
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw {
                    error: 'TIMEOUT_ERROR',
                    message: 'Превышено время ожидания ответа от сервера',
                };
            }

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
        if (!this.authToken) {
            throw {
                error: 'NO_TOKEN',
                message: 'Токен авторизации отсутствует',
            };
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
