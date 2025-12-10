import useAuthStore from '@/store/auth.js';
import useUserStore from '@/store/user.js';
import { useAccountStore } from '@/store/account.js';
import { useDialogStore } from '@/store/dialogs.js';
import { useToastStore } from '@/store/toast.js';
import localStorageUtils from '@/store/localStorage.js';

/**
 * Контроллер для инициализации и управления всеми stores
 */
export async function logInAllStore(userData) {
    try {
        console.log('=== logInAllStore START ===', userData);

        const authStore = useAuthStore();
        const userStore = useUserStore();
        const toastStore = useToastStore();

        if (!userData?.token || !userData?.user) {
            throw new Error('Неверный формат данных пользователя');
        }

        // Устанавливаем данные аутентификации в store
        authStore.setAuthData({
            token: userData.token,
            user: userData.user,
        });

        // Устанавливаем данные пользователя в store
        userStore.setUserData({
            id: userData.user.id,
            fullName: userData.user.name || userData.user.login,
            avatar: userData.user.avatar || '',
        });

        // Сохраняем в localStorage
        localStorageUtils.setAuthToken(userData.token);
        localStorageUtils.setUserData(userData.user);

        // Показываем уведомление об успешном входе
        toastStore.addToast({
            message: 'Успешный вход в систему',
            type: 'success',
            duration: 3000,
        });

        console.log('=== logInAllStore SUCCESS ===');
        return true;
    } catch (error) {
        console.error('Ошибка при входе в систему:', error);
        console.error('Error stack:', error.stack);

        // Показываем уведомление об ошибке
        const toastStore = useToastStore();
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

        // Очищаем localStorage
        localStorageUtils.clearLocalStorage();

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
