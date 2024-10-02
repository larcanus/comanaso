import {createRouter, createWebHistory} from 'vue-router'
import FrontPageView from '@/views/FrontPageView.vue'
import MainPageView from '@/views/MainPageView.vue'

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
			}
		}
	]
})

router.beforeEach(async (to, from) => {
	if (to.meta.requiresAuth && isAuthenticated && to.name !== 'main') {
		return {name: to.name}
	}

	if (to.meta.requiresAuth && !isAuthenticated && to.name !== 'home') {
		return {name: 'home'}
	}
})

export default router
