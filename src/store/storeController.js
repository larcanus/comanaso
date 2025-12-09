import { useAuthStore } from '@/store/auth.js';
import { useUserStore } from '@/store/user.js';
import { useAccountStore } from '@/store/account.js';
import { useDialogStore } from '@/store/dialogs.js';
import { useToastStore } from '@/store/toast.js';

/**
 * Контроллер для инициализации и управления всеми stores
 */
export async function logInAllStore(userData) {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const toastStore = useToastStore();

    try {
        console.log('authStore', authStore);
        console.log('userData', userData); // Добавьте для отладки

        // Устанавливаем данные аутентификации
        authStore.setAuthData({
            token: userData.token,
            user: userData.user,
        });

        // Устанавливаем данные пользователя
        if (userData.user) {
            userStore.setUser({
                id: userData.user.id,
                username: userData.user.login,
                email: userData.user.login, // Для совместимости
                name: userData.user.login,
                createdAt: userData.user.createdAt,
            });
        }

        // Показываем уведомление об успешном входе
        toastStore.addToast({
            message: 'Успешный вход в систему',
            type: 'success',
            duration: 3000,
        });

        return true;
    } catch (error) {
        console.error('Ошибка при входе в систему:', error);

        toastStore.addToast({
            message: 'Ошибка при входе в систему',
            type: 'error',
            duration: 5000,
        });

        return false;
    }
}

/**
 * Выход из системы
 */
export async function logoutAllStore() {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const accountStore = useAccountStore();
    const dialogsStore = useDialogStore();
    const toastStore = useToastStore();

    try {
        // Очищаем все stores
        authStore.clearAuthData();
        userStore.clearUser();
        accountStore.clearAccounts();
        dialogsStore.$reset();

        // Показываем уведомление
        toastStore.addToast({
            message: 'Вы вышли из системы',
            type: 'info',
            duration: 3000,
        });

        return true;
    } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
        return false;
    }
}

/**
 * Получение токена для API запросов
 * @returns {string|null} Токен аутентификации
 */
export function getAuthToken() {
    const authStore = useAuthStore();
    return authStore.token;
}

export async function setAccountLocalStore(state) {
    try {
        // TODO: Реализовать логику сохранения аккаунта в localStorage
        // localStorageUtils.setAccountData(state);
        console.log('setAccountLocalStore:', state);
    } catch (e) {
        console.error('setAccountLocalStore error:', e);
    }
}

export async function deleteAccountLocalStore(state) {
    try {
        // TODO: Реализовать логику удаления аккаунта из localStorage
        // localStorageUtils.deleteAccountData(state);
        console.log('deleteAccountLocalStore:', state);
    } catch (e) {
        console.error('deleteAccountLocalStore error:', e);
    }
}

export async function updateAccountLocalStore(state) {
    try {
        // TODO: Реализовать логику обновления аккаунта в localStorage
        // localStorageUtils.updateAccountData(state);
        console.log('updateAccountLocalStore:', state);
    } catch (e) {
        console.error('updateAccountLocalStore error:', e);
    }
}
