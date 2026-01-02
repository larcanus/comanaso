import { apiService } from './api.js';

/**
 * Сервис для работы с аутентификацией
 */
export class AuthService {
    /**
     * Регистрация нового пользователя
     * @param {Object} credentials - Данные для регистрации
     * @param {string} credentials.email - Email пользователя
     * @param {string} credentials.login - Логин пользователя
     * @param {string} credentials.password - Пароль пользователя
     * @returns {Promise<Object>} Данные пользователя и токен
     */
    async register({ email, login, password }) {
        try {
            const data = await apiService.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, login, password }),
            });

            return data;
        } catch (error) {
            if (error.error === 'USER_EXISTS') {
                throw {
                    ...error,
                    userMessage: 'Пользователь с таким логином уже существует',
                };
            }

            if (error.error === 'EMAIL_EXISTS') {
                throw {
                    ...error,
                    userMessage: 'Пользователь с таким email уже существует',
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
     * @returns {Promise<Object>} Данные пользователя, токен и настройки
     */
    async login({ login, password }) {
        try {
            const data = await apiService.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ login, password }),
            });

            if (data.aiPrivacySettings) {
                data.aiPrivacySettings = this.normalizeAiPrivacySettings(data.aiPrivacySettings);
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
     * Получение данных текущего пользователя
     * @returns {Promise<Object>} Данные пользователя с настройками
     */
    async getCurrentUser() {
        try {
            const data = await apiService.authRequest('/auth/me', {
                method: 'GET',
            });

            if (data.settings) {
                data.settings = this.normalizeAiPrivacySettings(data.settings);
            }

            return data;
        } catch (error) {
            console.error('getCurrentUser error', error);

            if (error.error === 'UNAUTHORIZED') {
                throw {
                    ...error,
                    userMessage: 'Требуется авторизация',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Не удалось загрузить данные пользователя',
            };
        }
    }

    /**
     * Обновление данных пользователя (включая настройки приватности)
     * @param {Object} updates - Объект с обновлениями
     * @param {string} [updates.username] - Новое имя пользователя
     * @param {string} [updates.email] - Новый email
     * @param {Object} [updates.settings] - Настройки приватности AI
     * @returns {Promise<Object>} Обновленные данные пользователя
     */
    async updateUserSettings(updates) {
        try {
            const data = await apiService.authRequest('/auth/me', {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });

            if (data.settings) {
                data.settings = this.normalizeAiPrivacySettings(data.settings);
            }

            return data;
        } catch (error) {
            console.error('updateUserSettings error', error);

            if (error.error === 'UNAUTHORIZED') {
                throw {
                    ...error,
                    userMessage: 'Требуется авторизация',
                };
            }

            if (error.error === 'USERNAME_EXISTS') {
                throw {
                    ...error,
                    userMessage: 'Пользователь с таким именем уже существует',
                };
            }

            if (error.error === 'EMAIL_EXISTS') {
                throw {
                    ...error,
                    userMessage: 'Пользователь с таким email уже существует',
                };
            }

            if (error.error === 'VALIDATION_ERROR') {
                throw {
                    ...error,
                    userMessage: 'Неверный формат данных',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Не удалось обновить данные пользователя',
            };
        }
    }

    /**
     * Обновление настроек приватности AI (обертка для updateUserSettings)
     * @param {Object} settings - Новые настройки приватности
     * @returns {Promise<Object>} Результат обновления
     */
    async updateAiPrivacySettings(settings) {
        return this.updateUserSettings({ settings });
    }

    /**
     * Выход из системы
     * @returns {Promise<Object>} Результат выхода
     */
    async logout() {
        try {
            await apiService.authRequest('/auth/logout', {
                method: 'POST',
            });

            return {
                ok: true,
                message: 'Успешный выход из системы',
            };
        } catch (error) {
            return {
                ok: false,
                error: error.message || 'Ошибка при выходе из системы',
            };
        }
    }

    /**
     * Удаление учетной записи пользователя
     * @returns {Promise<Object>} Результат удаления
     */
    async deleteAccount() {
        try {
            const data = await apiService.authRequest('/auth/delete-account', {
                method: 'DELETE',
            });

            return {
                ok: true,
                data,
            };
        } catch (error) {
            console.error('deleteAccount error', error);

            if (error.error === 'UNAUTHORIZED') {
                throw {
                    ...error,
                    userMessage: 'Требуется авторизация',
                };
            }

            if (error.error === 'USER_NOT_FOUND') {
                throw {
                    ...error,
                    userMessage: 'Пользователь не найден',
                };
            }

            if (error.error === 'DELETE_FAILED') {
                throw {
                    ...error,
                    userMessage: 'Не удалось удалить учетную запись',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка при удалении учетной записи',
            };
        }
    }

    /**
     * Нормализует настройки приватности AI
     * @param {Object} settings - Сырые настройки
     * @returns {Object} Нормализованные настройки
     */
    normalizeAiPrivacySettings(settings) {
        return {
            shareUserName: settings.shareUserName ?? true,
            shareNickname: settings.shareNickname ?? true,
            shareMessageText: settings.shareMessageText ?? true,
            shareDialogTitles: settings.shareDialogTitles ?? true,
        };
    }
}

export const authService = new AuthService();
