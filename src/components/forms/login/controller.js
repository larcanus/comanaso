import {setUserData} from "@/store/localStorage.js";

const {useUserStore} = await import ('@/store/user')
const {useAuthStore} = await import ('@/store/auth')

export class Controller {
	userStore = useUserStore()
	authStore = useAuthStore()

	sendRestAuthentication({email, password}) {
		return fetch('https://a3c60676f813acc0.mokky.dev/auth', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email,
				password
			})
		})
	}

	sendRestRegistration({name: fullName, email, password}) {
		return fetch('https://a3c60676f813acc0.mokky.dev/register', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fullName,
				email,
				password
			})
		})
	}

	async setStoreUserData(response) {
		const userData = await response.json()
		this.userStore.setUserData(userData.data);
		this.authStore.setAuthData({
			userId: userData.data.id,
			token: userData.token,
			isAuthenticated: true,
		});

		const {setAuthToken, setUserData} = await import("@/store/localStorage.js");
		setAuthToken(userData.token);
		setUserData(userData.data);
	}
}
