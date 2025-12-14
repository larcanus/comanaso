import { createRouter, createWebHistory } from 'vue-router';
import FrontPageView from '@/view/FrontPageView.vue';
import MainPageView from '@/view/MainPageView.vue';
import AccountView from '@/view/AccountView.vue';
import AnalyticsView from '@/view/AnalyticsView.vue';
import SettingsView from '@/view/SettingsView.vue';
import { useAuthStore } from '@/store/auth.js';

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
        console.warn('🔴 Доступ запрещен: требуется авторизация');
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

    // Во всех остальных случаях разрешаем переход
    next();
});

// Глобальный обработчик ошибок навигации (опционально)
router.onError((error) => {
    console.error('🔴 Ошибка навигации:', error);
});

export default router;
