import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // State
    const token = ref(localStorage.getItem('auth_token') || null);
    const isAuth = ref(!!localStorage.getItem('auth_token'));
    const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'));
    const isLoading = ref(false);
    const error = ref(null);

    // Actions
    function setAuthData(data) {
        token.value = data.token;
        user.value = data.user;
        isAuth.value = true;
        error.value = null;

        // Сохраняем в localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        // Устанавливаем токен в сервисе
        authService.setToken(data.token);
    }

    function clearAuthData() {
        token.value = null;
        user.value = null;
        isAuth.value = false;
        error.value = null;

        // Очищаем localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

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
                    localStorage.setItem('auth_user', JSON.stringify(user.value));
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
