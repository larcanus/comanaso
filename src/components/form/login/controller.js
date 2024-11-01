import { logInAllStore } from '@/store/storeController.js';

export class Controller {
    sendRestAuthentication({ email, password }) {
        return fetch('https://a3c60676f813acc0.mokky.dev/auth', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
    }

    sendRestRegistration({ name: fullName, email, password }) {
        return fetch('https://a3c60676f813acc0.mokky.dev/register', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName,
                email,
                password,
            }),
        });
    }

    async setStoreUserData(response) {
        const userData = await response.json();
        await logInAllStore(userData);
    }
}
