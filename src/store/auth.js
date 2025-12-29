import { defineStore } from 'pinia';
// import { authService } from '@/services/auth.service.js';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null);
    const isAuth = ref(false);
    const user = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // Настройки приватности для AI-аналитики
    const aiPrivacySettings = ref({
        shareUserName: true, // Имя пользователя (firstName, lastName)
        shareNickname: true, // Username (@nickname)
        shareMessageText: true, // Текст последних сообщений
        shareDialogTitles: true, // Названия диалогов
    });

    function setToken(tokenValue) {
        token.value = tokenValue;
        isAuth.value = !!tokenValue;
    }

    function setUser(userData) {
        user.value = userData;
    }

    function setAuthData(data) {
        setToken(data.token);
        setUser(data.user);
        error.value = null;
    }

    /**
     * Устанавливает настройки приватности AI
     * @param {Object} settings - Объект с настройками приватности
     */
    function setAiPrivacySettings(settings) {
        if (!settings || typeof settings !== 'object') {
            console.warn('[AuthStore] Invalid AI privacy settings:', settings);
            return;
        }

        aiPrivacySettings.value = {
            shareUserName: settings.shareUserName ?? true,
            shareNickname: settings.shareNickname ?? true,
            shareMessageText: settings.shareMessageText ?? true,
            shareDialogTitles: settings.shareDialogTitles ?? true,
        };
    }

    /**
     * Обновляет отдельную настройку приватности
     * @param {string} key - Ключ настройки
     * @param {boolean} value - Новое значение
     */
    function updateAiPrivacySetting(key, value) {
        console.log('updateAiPrivacySetting', key, value);
        if (key in aiPrivacySettings.value) {
            aiPrivacySettings.value[key] = Boolean(value);
        }
    }

    function clear() {
        token.value = null;
        user.value = null;
        isAuth.value = false;
        error.value = null;
    }

    // async function checkAuth() {
    //     if (!token.value) {
    //         clear();
    //         return false;
    //     }
    //
    //     isLoading.value = true;
    //
    //     try {
    //         const result = await authService.verifyToken(token.value);
    //
    //         if (result.valid) {
    //             // Обновляем данные пользователя если нужно
    //             if (result.user && result.user.id !== user.value?.id) {
    //                 user.value = { ...user.value, ...result.user };
    //             }
    //
    //             isAuth.value = true;
    //             error.value = null;
    //             return true;
    //         } else {
    //             clear();
    //             return false;
    //         }
    //     } catch (error) {
    //         console.error('Ошибка проверки токена:', error);
    //         clear();
    //         return false;
    //     } finally {
    //         isLoading.value = false;
    //     }
    // }

    function setError(errorMessage) {
        error.value = errorMessage;
    }

    function clearError() {
        error.value = null;
    }

    // Getters (computed)
    const userId = computed(() => user.value?.id || null);
    const userLogin = computed(() => user.value?.login || null);
    const userName = computed(() => user.value?.name || null);
    const isAuthenticated = computed(() => isAuth.value);

    return {
        // State
        token,
        isAuth,
        user,
        aiPrivacySettings,
        isLoading,
        error,

        // Actions
        setToken,
        setUser,
        setAuthData,
        setAiPrivacySettings,
        updateAiPrivacySetting,
        clear,
        // checkAuth,
        setError,
        clearError,

        // Getters
        userId,
        userLogin,
        userName,
        isAuthenticated,
    };
});

export default useAuthStore;
