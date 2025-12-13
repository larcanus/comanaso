import { apiService } from './api.js';

/**
 * Сервис для работы с аккаунтами Telegram
 */
export class AccountService {
    /**
     * Получить список всех аккаунтов пользователя
     * @returns {Promise<Response>} Список аккаунтов
     */
    async getAccounts() {
        try {
            return await apiService.authRequest('/accounts', {
                method: 'GET',
            });
        } catch (error) {
            console.error('Get accounts error:', error);

            if (error.error === 'NO_TOKEN') {
                throw {
                    ...error,
                    userMessage: 'Требуется авторизация',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка получения списка аккаунтов',
            };
        }
    }

    /**
     * Создать новый аккаунт
     * @param {Object} accountData - Данные аккаунта
     * @param {string} accountData.name - Название аккаунта
     * @param {string} accountData.phoneNumber - Номер телефона
     * @param {string} accountData.apiId - API ID от Telegram
     * @param {string} accountData.apiHash - API Hash от Telegram
     * @returns {Promise<Object>} Созданный аккаунт
     */
    async createAccount({ name, phoneNumber, apiId, apiHash }) {
        try {
            const account = await apiService.authRequest('/accounts', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    phoneNumber,
                    apiId,
                    apiHash,
                }),
            });

            return account;
        } catch (error) {
            console.error('Create account error:', error);

            if (error.error === 'ACCOUNT_EXISTS') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт с таким номером уже добавлен',
                };
            }

            if (error.error === 'VALIDATION_ERROR') {
                throw {
                    ...error,
                    userMessage: error.message || 'Ошибка валидации данных аккаунта',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка создания аккаунта',
            };
        }
    }

    /**
     * Обновить данные аккаунта
     * @param {number} accountId - ID аккаунта
     * @param {Object} accountData - Обновляемые данные
     * @param {string} [accountData.name] - Новое название
     * @param {string} [accountData.apiId] - Новый API ID
     * @param {string} [accountData.apiHash] - Новый API Hash
     * @returns {Promise<Object>} Обновленный аккаунт
     */
    async updateAccount(accountId, accountData) {
        try {
            const account = await apiService.authRequest(`/accounts/${accountId}`, {
                method: 'PATCH',
                body: JSON.stringify(accountData),
            });

            return account;
        } catch (error) {
            console.error('Update account error:', error);

            if (error.error === 'ACCOUNT_NOT_FOUND') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт не найден',
                };
            }

            if (error.error === 'ACCOUNT_CONNECTED') {
                throw {
                    ...error,
                    userMessage: 'Невозможно изменить данные подключенного аккаунта',
                };
            }

            if (error.error === 'VALIDATION_ERROR') {
                throw {
                    ...error,
                    userMessage: error.message || 'Ошибка валидации данных',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка обновления аккаунта',
            };
        }
    }

    /**
     * Удалить аккаунт
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Результат удаления
     */
    async deleteAccount(accountId) {
        try {
            const result = await apiService.authRequest(`/accounts/${accountId}`, {
                method: 'DELETE',
            });

            return {
                ok: true,
                message: 'Аккаунт успешно удален',
                ...result,
            };
        } catch (error) {
            console.error('Delete account error:', error);

            if (error.error === 'ACCOUNT_NOT_FOUND') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт не найден',
                };
            }

            if (error.error === 'ACCOUNT_CONNECTED') {
                throw {
                    ...error,
                    userMessage: 'Невозможно удалить подключенный аккаунт',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка удаления аккаунта',
            };
        }
    }

    /**
     * Получить данные конкретного аккаунта
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Данные аккаунта
     */
    async getAccountById(accountId) {
        try {
            const account = await apiService.authRequest(`/accounts/${accountId}`, {
                method: 'GET',
            });

            return account;
        } catch (error) {
            console.error('Get account by ID error:', error);

            if (error.error === 'ACCOUNT_NOT_FOUND') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт не найден',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка получения данных аккаунта',
            };
        }
    }

    // ==================== TELEGRAM CONNECTION ====================

    /**
     * Подключить аккаунт (начать авторизацию)
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Результат с phoneCodeHash для следующего шага
     */
    async connectAccount(accountId) {
        try {
            const result = await apiService.authRequest(`/accounts/${accountId}/connect`, {
                method: 'POST',
            });

            return result;
        } catch (error) {
            console.error('Connect account error:', error);

            if (error.error === 'INVALID_API_CREDENTIALS') {
                throw {
                    ...error,
                    userMessage: 'Неверный API ID или API Hash',
                };
            }

            if (error.error === 'ALREADY_CONNECTED') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт уже подключен',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка подключения аккаунта',
            };
        }
    }

    /**
     * Подтвердить код авторизации
     * @param {number} accountId - ID аккаунта
     * @param {string} code - Код из Telegram
     * @param {string} phoneCodeHash - Хеш из предыдущего шага
     * @returns {Promise<Object>} Данные подключенного аккаунта
     */
    async verifyCode(accountId, code, phoneCodeHash) {
        try {
            const result = await apiService.authRequest(`/accounts/${accountId}/verify-code`, {
                method: 'POST',
                body: JSON.stringify({ code, phoneCodeHash }),
            });

            return result;
        } catch (error) {
            console.error('Verify code error:', error);

            if (error.error === 'INVALID_CODE') {
                throw {
                    ...error,
                    userMessage: 'Неверный код подтверждения',
                };
            }

            if (error.error === 'PASSWORD_REQUIRED') {
                throw {
                    ...error,
                    userMessage: 'Требуется двухфакторная аутентификация',
                    passwordHint: error.passwordHint,
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка подтверждения кода',
            };
        }
    }

    /**
     * Подтвердить 2FA пароль
     * @param {number} accountId - ID аккаунта
     * @param {string} password - Пароль 2FA
     * @returns {Promise<Object>} Данные подключенного аккаунта
     */
    async verifyPassword(accountId, password) {
        try {
            const result = await apiService.authRequest(`/accounts/${accountId}/verify-password`, {
                method: 'POST',
                body: JSON.stringify({ password }),
            });

            return result;
        } catch (error) {
            console.error('Verify password error:', error);

            if (error.error === 'INVALID_PASSWORD') {
                throw {
                    ...error,
                    userMessage: 'Неверный пароль',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка подтверждения пароля',
            };
        }
    }

    /**
     * Отключить аккаунт
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Результат отключения
     */
    async disconnectAccount(accountId) {
        try {
            const result = await apiService.authRequest(`/accounts/${accountId}/disconnect`, {
                method: 'POST',
            });

            return result;
        } catch (error) {
            console.error('Disconnect account error:', error);

            if (error.error === 'ACCOUNT_NOT_FOUND') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт не найден',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка отключения аккаунта',
            };
        }
    }

    /**
     * Выйти из Telegram (logout)
     * @param {number} accountId - ID аккаунта
     * @returns {Promise<Object>} Результат выхода
     */
    async logoutAccount(accountId) {
        try {
            const result = await apiService.authRequest(`/accounts/${accountId}/logout`, {
                method: 'POST',
            });

            return result;
        } catch (error) {
            console.error('Logout account error:', error);

            if (error.error === 'ACCOUNT_NOT_CONNECTED') {
                throw {
                    ...error,
                    userMessage: 'Аккаунт не подключен',
                };
            }

            throw {
                ...error,
                userMessage: error.message || 'Ошибка выхода из аккаунта',
            };
        }
    }
}

// Экспортируем синглтон экземпляр
export const accountService = new AccountService();
