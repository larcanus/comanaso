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
        logger.log('=== logInAllStore START ===', userData);

        const authStore = useAuthStore();
        const userStore = useUserStore();
        const toastStore = useToastStore();

        if (!userData?.token || !userData?.user) {
            return new Error('Неверный формат данных пользователя');
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
        toastStore.addToast('success', 'Успешный вход в систему');

        logger.log('=== logInAllStore SUCCESS ===');
        return true;
    } catch (error) {
        logger.error('Ошибка при входе в систему:', error);
        logger.error('Error stack:', error.stack);

        // Показываем уведомление об ошибке
        const toastStore = useToastStore();
        toastStore.addToast('error', 'Ошибка при входе в систему');

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
        authStore.clear();
        userStore.clearUser();
        accountStore.clearAccounts();
        dialogsStore.clear();
        toastStore.clear();

        // Очищаем localStorage
        localStorageUtils.clearLocalStorage();

        logger.log('=== logoutAllStore: все данные очищены ===');

        return true;
    } catch (error) {
        logger.error('Ошибка при выходе:', error);

        // В случае ошибки всё равно пытаемся очистить localStorage
        try {
            localStorageUtils.clearLocalStorage();
        } catch (e) {
            logger.error('Не удалось очистить localStorage:', e, error);
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
        logger.log('⚠️ Logout уже выполняется, пропускаем повторный вызов');
        return;
    }

    isLoggingOut = true;
    logger.warn('🔴 Принудительный выход из системы:', error);

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
        // Выполняем выход без уведомления
        await logoutAllStore(false);

        // Показываем уведомление
        toastStore.addToast('warning', message);

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
