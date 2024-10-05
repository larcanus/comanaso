const {useUserStore} = await import ('@/store/user')

export class Controller {
	store = useUserStore()

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
		return this.store.setUserData(userData.data);
	}
}
