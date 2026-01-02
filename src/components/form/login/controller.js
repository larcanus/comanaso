import { logInAllStore } from '@/store/storeController.js';
import { authService } from '@/services/auth.service.js';
import { cryptoService } from '@/services/crypto.service.js';

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

            const encryptedToken = await cryptoService.encrypt(data.token);

            await this.setStoreUserData({
                ...data,
                token: encryptedToken,
            });

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
     * @param {string} userData.email - Email пользователя
     * @param {string} userData.login - Логин пользователя
     * @param {string} userData.password - Пароль пользователя
     * @returns {Promise<Object>} Результат регистрации
     */
    async sendRestRegistration({ email, login, password }) {
        try {
            const data = await authService.register({ email, login, password });

            const encryptedToken = await cryptoService.encrypt(data.token);

            await this.setStoreUserData({
                ...data,
                token: encryptedToken,
            });

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
        const userData = {
            token: responseData.token,
            user: {
                id: responseData.user?.id,
                login: responseData.user?.login,
                name: responseData.user?.login,
                email: responseData.user?.email,
                createdAt: responseData.user?.createdAt,
            },
        };

        await logInAllStore(userData);
    }
}
