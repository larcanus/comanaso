import {clearLocalStorage} from '@/store/localStorage.js';
const {useUserStore} = await import ('@/store/user')
const {useAuthStore} = await import ('@/store/auth')

export function logoutStore() {
	try {
		const storeUser = useUserStore();
		const storeAuth = useAuthStore();
		storeUser?.$reset();
		storeAuth?.$reset();
		clearLocalStorage();
	} catch (e) {
		console.error(e);
	}
}
