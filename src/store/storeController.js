import localStorageUtils from '@/store/localStorage.js';
import useAuthStore from '@/store/auth';
import useUserStore from '@/store/user';
import useDialogStore from '@/store/dialogs.js';
import useAccountStore from '@/store/account.js';

export function logoutAllStore() {
    try {
        const userStore = useUserStore();
        const authStore = useAuthStore();
        const accountStore = useAccountStore();
        const dialogStore = useDialogStore();

        userStore?.$reset();
        authStore?.$reset();
        accountStore?.$reset();
        dialogStore?.$reset();
        localStorageUtils.clearLocalStorage();
    } catch (e) {
        console.error('logoutAllStore error:', e);
    }
}

export async function logInAllStore(userData) {
    try {
        const userStore = useUserStore();
        const authStore = useAuthStore();

        userStore?.setUserData(userData.data);
        authStore?.setAuthData({
            userId: userData.data.id,
            token: userData.token,
            isAuthenticated: true,
        });

        localStorageUtils.setAuthToken(userData.token);
        localStorageUtils.setUserData(userData.data);
    } catch (e) {
        console.error('logInAllStore error:', e);
    }
}

export async function setAccountLocalStore(state) {
    try {
        localStorageUtils.setAccountData(state);
    } catch (e) {
        console.error('setAccountLocalStore error:', e);
    }
}

export async function deleteAccountLocalStore(state) {
    try {
        localStorageUtils.setAccountData(state);
    } catch (e) {
        console.error('deleteAccountLocalStore error:', e);
    }
}

export async function updateAccountLocalStore(state) {
    try {
        localStorageUtils.setAccountData(state);
    } catch (e) {
        console.error('updateAccountLocalStore error:', e);
    }
}
