import { logInAllStore } from '@/store/storeController.js';
import { authService } from '@/services/auth.service.js';

export class Controller {
    /**
     * Аутентификация пользователя
     * @param {Object} credentials - Данные для входа
     * @param {string} credentials.login - Логин пользователя
     * @param {string} credentials.password - Пароль пользователя
     * @returns {Promise<Object>} Результат аутентификации
     */
    async sendRestAuthentication({ login, password }) {
        try {
            const data = await authService.login({ login, password });
            console.log('sendRestAuthentication data', data);
            // Сохраняем данные пользователя в store
            await this.setStoreUserData(data);

            return {
                ok: true,
                status: 200,
                data,
            };
        } catch (error) {
            return {
                ok: false,
                status: error.status || 500,
                error: error.userMessage || error.message || 'Ошибка аутентификации',
                data: error,
            };
        }
    }

    /**
     * Регистрация нового пользователя
     * @param {Object} userData - Данные для регистрации
     * @param {string} userData.login - Логин пользователя
     * @param {string} userData.password - Пароль пользователя
     * @returns {Promise<Object>} Результат регистрации
     */
    async sendRestRegistration({ login, password }) {
        try {
            // Новый API не принимает name, используем только login и password
            const data = await authService.register({ login, password });
            console.log('sendRestRegistration data', data);
            // Сохраняем данные пользователя в store
            await this.setStoreUserData(data);

            return {
                ok: true,
                status: 201,
                data,
            };
        } catch (error) {
            return {
                ok: false,
                status: error.status || 500,
                error: error.userMessage || error.message || 'Ошибка регистрации',
                data: error,
            };
        }
    }

    /**
     * Сохранение данных пользователя в store
     * @param {Object} responseData - Данные от сервера
     */
    async setStoreUserData(responseData) {
        // Преобразуем данные в формат, ожидаемый store
        const userData = {
            token: responseData.token,
            user: {
                id: responseData.user?.id,
                login: responseData.user?.login,
                name: responseData.user?.login, // Используем login как имя
                email: responseData.user?.login, // Для совместимости
                createdAt: responseData.user?.createdAt,
            },
        };

        await logInAllStore(userData);

        // Сохраняем токен в localStorage через authService
        if (responseData.token) {
            authService.setAuthToken(responseData.token);
        }
    }

    /**
     * Проверка валидности токена
     * @param {string} token - Токен для проверки
     * @returns {Promise<Object>} Результат проверки
     */
    async verifyToken(token) {
        return await authService.verifyToken(token);
    }
}
