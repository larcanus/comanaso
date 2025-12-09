import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('auth_token') || null,
        isAuth: !!localStorage.getItem('auth_token'),
        user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
        isLoading: false,
        error: null,
    }),

    actions: {
        /**
         * Установка данных пользователя после успешной аутентификации
         * @param {Object} data - Данные от сервера
         */
        setAuthData(data) {
            this.token = data.token;
            this.user = data.user;
            this.isAuth = true;
            this.error = null;

            // Сохраняем в localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            // Устанавливаем токен в сервисе
            authService.setToken(data.token);
        },

        /**
         * Очистка данных аутентификации
         */
        clearAuthData() {
            this.token = null;
            this.user = null;
            this.isAuth = false;
            this.error = null;

            // Очищаем localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');

            // Очищаем токен в сервисе
            authService.logout();
        },

        /**
         * Проверка валидности токена
         * @returns {Promise<boolean>} Результат проверки
         */
        async checkAuth() {
            if (!this.token) {
                this.clearAuthData();
                return false;
            }

            this.isLoading = true;

            try {
                const result = await authService.verifyToken(this.token);

                if (result.valid) {
                    // Обновляем данные пользователя если нужно
                    if (result.user && result.user.id !== this.user?.id) {
                        this.user = { ...this.user, ...result.user };
                        localStorage.setItem('auth_user', JSON.stringify(this.user));
                    }

                    this.isAuth = true;
                    this.error = null;
                    return true;
                } else {
                    this.clearAuthData();
                    return false;
                }
            } catch (error) {
                console.error('Ошибка проверки токена:', error);
                this.clearAuthData();
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Установка ошибки аутентификации
         * @param {string} error - Сообщение об ошибке
         */
        setError(error) {
            this.error = error;
        },

        /**
         * Очистка ошибки
         */
        clearError() {
            this.error = null;
        },
    },

    getters: {
        /**
         * Получение ID текущего пользователя
         * @returns {number|null}
         */
        userId: (state) => state.user?.id || null,

        /**
         * Получение логина текущего пользователя
         * @returns {string|null}
         */
        userLogin: (state) => state.user?.login || null,

        /**
         * Проверка, загружается ли что-то
         * @returns {boolean}
         */
        isAuthenticated: (state) => state.isAuth || false,
    },
});

export default useAuthStore;
