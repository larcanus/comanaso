import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Безопасное чтение из localStorage
    const getFromLocalStorage = (key, defaultValue = null) => {
        try {
            const value = localStorage.getItem(key);
            return value || defaultValue;
        } catch (e) {
            console.warn(`localStorage недоступен для ключа ${key}:`, e);
            return defaultValue;
        }
    };

    const getJsonFromLocalStorage = (key, defaultValue = null) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.warn(`localStorage недоступен для ключа ${key}:`, e);
            return defaultValue;
        }
    };

    // State
    const token = ref(getFromLocalStorage('auth_token', null));
    const isAuth = ref(!!getFromLocalStorage('auth_token'));
    const user = ref(getJsonFromLocalStorage('auth_user', null));
    const isLoading = ref(false);
    const error = ref(null);

    // Actions
    function setAuthData(data) {
        token.value = data.token;
        user.value = data.user;
        isAuth.value = true;
        error.value = null;

        // Сохраняем в localStorage
        try {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (e) {
            console.warn('Не удалось сохранить данные в localStorage:', e);
        }

        // Устанавливаем токен в сервисе
        authService.setToken(data.token);
    }

    function clearAuthData() {
        token.value = null;
        user.value = null;
        isAuth.value = false;
        error.value = null;

        // Очищаем localStorage
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        } catch (e) {
            console.warn('Не удалось очистить localStorage:', e);
        }

        // Очищаем токен в сервисе
        authService.logout();
    }

    async function checkAuth() {
        if (!token.value) {
            clearAuthData();
            return false;
        }

        isLoading.value = true;

        try {
            const result = await authService.verifyToken(token.value);

            if (result.valid) {
                // Обновляем данные пользователя если нужно
                if (result.user && result.user.id !== user.value?.id) {
                    user.value = { ...user.value, ...result.user };
                    try {
                        localStorage.setItem('auth_user', JSON.stringify(user.value));
                    } catch (e) {
                        console.warn('Не удалось обновить данные пользователя в localStorage:', e);
                    }
                }

                isAuth.value = true;
                error.value = null;
                return true;
            } else {
                clearAuthData();
                return false;
            }
        } catch (error) {
            console.error('Ошибка проверки токена:', error);
            clearAuthData();
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    function setError(errorMessage) {
        error.value = errorMessage;
    }

    function clearError() {
        error.value = null;
    }

    // Getters (computed)
    const userId = computed(() => user.value?.id || null);
    const userLogin = computed(() => user.value?.login || null);
    const isAuthenticated = computed(() => isAuth.value);

    return {
        // State
        token,
        isAuth,
        user,
        isLoading,
        error,

        // Actions
        setAuthData,
        clearAuthData,
        checkAuth,
        setError,
        clearError,

        // Getters
        userId,
        userLogin,
        isAuthenticated,
    };
});

export default useAuthStore;
