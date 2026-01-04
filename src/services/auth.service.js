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

    /**
     * Запрос на восстановление пароля
     * @param {string} email - Email пользователя
     * @returns {Promise<Object>} Результат отправки письма
     */
    async requestPasswordReset(email) {
        try {
            const data = await apiService.request('/auth/password-reset/request', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            console.log('requestPasswordReset data', data);
            return {
                ok: true,
                message: data.message || 'Письмо отправлено',
            };
        } catch (error) {
            console.error('requestPasswordReset error', error);

            if (error.error === 'USER_NOT_FOUND') {
                // Не раскрываем информацию о существовании пользователя
                return {
                    ok: true,
                    message: 'Если аккаунт существует, письмо будет отправлено',
                };
            }

            if (error.error === 'EMAIL_SEND_FAILED') {
                throw {
                    ...error,
                    userMessage: 'Не удалось отправить письмо. Попробуйте позже.',
                };
            }

            if (error.error === 'VALIDATION_ERROR') {
                throw {
                    ...error,
                    userMessage: 'Неверный формат email',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка при отправке письма',
            };
        }
    }

    /**
     * Валидация токена сброса пароля
     * @param {string} token - Токен из URL
     * @returns {Promise<{ok: boolean, data?: {valid: boolean, email: string}, error?: string}>}
     */
    async validateResetToken(token) {
        try {
            const response = await apiService.request('/auth/password-reset/validate', {
                params: { token },
            });
            console.log('validateResetToken response', response);
            return {
                ok: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Validate reset token error:', error);
            return {
                ok: false,
                error: error.response?.data?.detail || 'Ошибка проверки токена',
            };
        }
    }

    /**
     * Сброс пароля по токену
     * @param {Object} params - Параметры сброса
     * @param {string} params.token - Токен из письма
     * @param {string} params.newPassword - Новый пароль
     * @returns {Promise<Object>} Результат сброса пароля
     */
    async resetPassword({ token, newPassword }) {
        try {
            const data = await apiService.request('/auth/password-reset/confirm', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword }),
            });

            return {
                ok: true,
                message: data.message || 'Пароль успешно изменен',
            };
        } catch (error) {
            console.error('resetPassword error', error);

            if (error.error === 'INVALID_TOKEN') {
                throw {
                    ...error,
                    userMessage: 'Недействительная или устаревшая ссылка для сброса пароля',
                };
            }

            if (error.error === 'TOKEN_EXPIRED') {
                throw {
                    ...error,
                    userMessage: 'Срок действия ссылки истек. Запросите новую ссылку.',
                };
            }

            if (error.error === 'VALIDATION_ERROR') {
                throw {
                    ...error,
                    userMessage: error.message || 'Пароль не соответствует требованиям',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Не удалось изменить пароль',
            };
        }
    }
}

export const authService = new AuthService();
