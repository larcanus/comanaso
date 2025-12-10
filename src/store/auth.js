import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null);
    const isAuth = ref(false);
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    function setToken(tokenValue) {
        token.value = tokenValue;
        isAuth.value = !!tokenValue;

        if (tokenValue) {
            authService.setToken(tokenValue);
        }
    }

    function setUser(userData) {
        user.value = userData;
    }

    function setAuthData(data) {
        setToken(data.token);
        setUser(data.user);
        error.value = null;
    }

    function clearAuthData() {
        token.value = null;
        user.value = null;
        isAuth.value = false;
        error.value = null;

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
        setToken,
        setUser,
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
