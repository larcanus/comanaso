import useAuthStore from '@/store/auth.js';
import useUserStore from '@/store/user.js';
import { useAccountStore } from '@/store/account.js';
import { useDialogStore } from '@/store/dialogs.js';
import { useToastStore } from '@/store/toast.js';
import localStorageUtils from '@/store/localStorage.js';
import router from '@/router/index.js';

// Флаг для предотвращения множественных вызовов logout
let isLoggingOut = false;

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

        // Сбрасываем флаг при успешном входе
        isLoggingOut = false;

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
 * @param {boolean} showNotification - Показывать ли уведомление
 */
export async function logoutAllStore(showNotification = true) {
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

        if (showNotification) {
            toastStore.addToast({
                message: 'Вы вышли из системы',
                type: 'info',
                duration: 3000,
            });
        }

        console.log('=== logoutAllStore: все данные очищены ===');

        return true;
    } catch (error) {
        console.error('Ошибка при выходе:', error);

        // В случае ошибки всё равно пытаемся очистить localStorage
        try {
            localStorageUtils.clearLocalStorage();
        } catch (e) {
            console.error('Не удалось очистить localStorage:', e, error);
        }

        return false;
    }
}

/**
 * Принудительный выход из системы с перенаправлением
 * Используется при критических ошибках авторизации
 * @param {Object} error - Объект ошибки
 */
export async function forceLogout(error) {
    // Если уже идет процесс logout, игнорируем повторные вызовы
    if (isLoggingOut) {
        console.log('⚠️ Logout уже выполняется, пропускаем повторный вызов');
        return;
    }

    isLoggingOut = true;
    console.warn('🔴 Принудительный выход из системы:', error);

    const toastStore = useToastStore();

    // Определяем сообщение для пользователя
    let message = 'Сессия завершена. Пожалуйста, войдите снова';

    if (error?.error === 'TOKEN_EXPIRED') {
        message = 'Время сессии истекло. Войдите заново';
    } else if (error?.error === 'USER_NOT_FOUND') {
        message = 'Пользователь не найден. Требуется повторная авторизация';
    } else if (error?.status === 401 || error?.status === 403) {
        message = 'Доступ запрещен. Войдите в систему';
    }

    try {
        // Выполняем выход без уведомления (покажем свое)
        await logoutAllStore(false);

        // Показываем уведомление
        toastStore.addToast({
            message,
            type: 'warning',
            duration: 5000,
        });

        // Перенаправляем на страницу входа
        if (router.currentRoute.value.name !== 'home') {
            await router.push({ name: 'home' });
        }
    } finally {
        // Сбрасываем флаг после небольшой задержки
        // Это предотвращает повторные вызовы во время навигации
        setTimeout(() => {
            isLoggingOut = false;
        }, 1000);
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
