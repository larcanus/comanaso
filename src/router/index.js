import { createRouter, createWebHistory } from 'vue-router';
import FrontPageView from '@/view/FrontPageView.vue';
import MainPageView from '@/view/MainPageView.vue';
import AccountView from '@/view/AccountView.vue';
import AnalyticsView from '@/view/AnalyticsView.vue';
import SettingsView from '@/view/SettingsView.vue';
import { useAuthStore } from '@/store/auth.js';
import { useAccountStore } from '@/store/account.js';
import FormForgotPassword from '@/components/form/forgot-password/FormForgotPassword.vue';
import PageResetPassword from '@/components/form/reset-password/PageResetPassword.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: FrontPageView,
            meta: {
                requiresAuth: false,
            },
        },
        {
            path: '/forgot-password',
            name: 'ForgotPassword',
            component: FormForgotPassword,
            meta: { requiresAuth: false },
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: PageResetPassword,
            meta: {
                requiresAuth: false,
                title: 'Сброс пароля',
            },
        },
        {
            path: '/main',
            name: 'main',
            component: MainPageView,
            meta: {
                requiresAuth: true,
            },
            children: [
                {
                    path: 'account',
                    name: 'account',
                    component: AccountView,
                    meta: {
                        requiresAuth: true,
                    },
                },
                {
                    path: 'analytics',
                    name: 'analytics',
                    component: AnalyticsView,
                    meta: {
                        requiresAuth: true,
                        requiresAccounts: true,
                    },
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: SettingsView,
                    meta: {
                        requiresAuth: true,
                    },
                },
            ],
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Проверяем аутентификацию
    const isAuthenticated = authStore.isAuth;

    // Если маршрут требует аутентификации и пользователь не аутентифицирован
    if (to.meta.requiresAuth && !isAuthenticated) {
        console.info('🔴 Доступ запрещен: требуется авторизация');
        next({ name: 'home' });
        return;
    }

    // Если пользователь аутентифицирован и пытается зайти на домашнюю страницу
    if (isAuthenticated && to.name === 'home') {
        next({ name: 'account' });
        return;
    }

    // Если пользователь на главной странице (/main) и аутентифицирован
    if (to.name === 'main' && isAuthenticated) {
        next({ name: 'account' });
        return;
    }

    // Проверка наличия аккаунтов для страниц, которым они нужны
    if (to.meta.requiresAccounts && isAuthenticated) {
        const accountStore = useAccountStore();
        const hasAccounts = accountStore.accountIds && accountStore.accountIds.length > 0;

        if (!hasAccounts) {
            console.info('⚠️ Загрузка аккаунтов для доступа к странице:', to.name);

            try {
                await accountStore.loadAccountsFromServer();

                // Проверяем снова после загрузки
                const accountsLoaded =
                    accountStore.accountIds && accountStore.accountIds.length > 0;

                if (!accountsLoaded) {
                    console.warn(
                        '⚠️ Нет доступных аккаунтов, перенаправление на страницу аккаунтов'
                    );
                    next({ name: 'account' });
                    return;
                }
            } catch (error) {
                console.error('🔴 Ошибка загрузки аккаунтов:', error);
                next({ name: 'account' });
                return;
            }
        }
    }

    // Во всех остальных случаях разрешаем переход
    next();
});

// Глобальный обработчик ошибок навигации
router.onError((error) => {
    console.error('🔴 Ошибка навигации:', error);
});

export default router;
