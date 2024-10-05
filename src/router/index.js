import {createRouter, createWebHistory} from 'vue-router'
import FrontPageView from '@/views/FrontPageView.vue'
import MainPageView from '@/views/MainPageView.vue'
import AccountView from "@/views/AccountView.vue";
import AnalyticsView from "@/views/AnalyticsView.vue";
import SettingsView from "@/views/SettingsView.vue";

const isAuthenticated = true; // from cookie or store


const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: FrontPageView,
			meta: {
				requiresAuth: false,
			}
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
			]
		}
	]
})

router.beforeEach(async (to, from) => {
	if (to.meta.requiresAuth && !isAuthenticated && to.name !== 'home') {
		return {name: 'home'}
	}

	if (to.meta.requiresAuth && isAuthenticated && to.name === 'main') {
		return {name: 'account'}
	}
})

export default router
