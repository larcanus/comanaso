import { createRouter, createWebHistory } from 'vue-router';
import FrontPageView from '@/view/FrontPageView.vue';
import MainPageView from '@/view/MainPageView.vue';
import AccountView from '@/view/AccountView.vue';
import AnalyticsView from '@/view/AnalyticsView.vue';
import SettingsView from '@/view/SettingsView.vue';
import useAuthStore from '@/store/auth';

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

router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.state.isAuthenticated && to.name !== 'home') {
        return { name: 'home' };
    }

    if (to.meta.requiresAuth && authStore.state.isAuthenticated && to.name === 'main') {
        return { name: 'account' };
    }

    if (authStore.state.isAuthenticated && to.name === 'home') {
        return { name: 'account' };
    }
});

export default router;
