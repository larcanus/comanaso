import { apiService } from './api.js';

/**
 * Сервис для работы с аутентификацией
 */
export class AuthService {
    /**
     * Регистрация нового пользователя
     * @param {Object} credentials - Данные для регистрации
     * @param {string} credentials.login - Логин пользователя
     * @param {string} credentials.password - Пароль пользователя
     * @returns {Promise<Object>} Данные пользователя и токен
     */
    async register({ login, password }) {
        try {
            const data = await apiService.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ login, password }),
            });

            // Сохраняем токен в сервисе
            if (data.token) {
                apiService.setAuthToken(data.token);
            }

            return data;
        } catch (error) {
            // Преобразуем ошибки API в понятные сообщения
            if (error.error === 'USER_EXISTS') {
                throw {
                    ...error,
                    userMessage: 'Пользователь с таким логином уже существует',
                };
            }

            if (error.error === 'VALIDATION_ERROR') {
                throw {
                    ...error,
                    userMessage: error.message || 'Ошибка валидации данных',
                };
            }

            throw error;
        }
    }

    /**
     * Вход в систему
     * @param {Object} credentials - Данные для входа
     * @param {string} credentials.login - Логин пользователя
     * @param {string} credentials.password - Пароль пользователя
     * @returns {Promise<Object>} Данные пользователя и токен
     */
    async login({ login, password }) {
        try {
            const data = await apiService.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ login, password }),
            });
            console.log('login', data);
            // Сохраняем токен в сервисе
            if (data.token) {
                apiService.setAuthToken(data.token);
            }

            return data;
        } catch (error) {
            console.error('login error', error);
            if (error.error === 'INVALID_CREDENTIALS') {
                throw {
                    ...error,
                    userMessage: 'Неверный логин или пароль',
                };
            }

            throw error;
        }
    }

    /**
     * Проверка валидности токена
     * @param {string} token - JWT токен для проверки
     * @returns {Promise<Object>} Результат проверки
     */
    async verifyToken(token) {
        try {
            // Временно устанавливаем токен для проверки
            const previousToken = apiService.authToken;
            apiService.setAuthToken(token);

            const result = await apiService.authRequest('/auth/verify');

            // Восстанавливаем предыдущий токен
            apiService.setAuthToken(previousToken);

            return result;
        } catch (error) {
            if (error.error === 'INVALID_TOKEN') {
                return { valid: false, error: error.message };
            }

            return { valid: false, error: 'Ошибка проверки токена' };
        }
    }

    /**
     * Выход из системы
     * @returns {Promise<Object>} Результат выхода
     */
    async logout() {
        try {
            // Отправляем запрос на сервер для инвалидации токена
            await apiService.authRequest('/auth/logout', {
                method: 'POST',
            });

            // Очищаем токен локально
            apiService.clearAuthToken();

            return {
                ok: true,
                message: 'Успешный выход из системы',
            };
        } catch (error) {
            apiService.clearAuthToken();

            return {
                ok: false,
                error: error.message || 'Ошибка при выходе из системы',
            };
        }
    }

    /**
     * Получение текущего токена
     * @returns {string|null} Текущий токен
     */
    getToken() {
        return apiService.authToken;
    }

    /**
     * Получение текущего токена
     * @param {string|null} token
     */
    setToken(token) {
        return apiService.setAuthToken(token);
    }
}

// Экспортируем синглтон экземпляр
export const authService = new AuthService();
