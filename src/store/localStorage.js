import { logoutAllStore } from '@/store/storeController.js';
import router from '@/router/index.js';

import useAuthStore from '@/store/auth';
import useUserStore from '@/store/user';
import useAccountStore from '@/store/account.js';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ACC_KEY = 'acc_data';
const TOKEN_TTL_MS = 3600000 * 2; // 2 hours

async function initLocalStore() {
    await setAuthTokenToStore();
    bindListener();
}

async function setAuthTokenToStore() {
    const currentToken = await getAuthToken();
    if (currentToken && !isTokenExpired(currentToken.timeStamp)) {
        const authStore = useAuthStore();
        authStore.setToken(currentToken.value);

        await setUserDataToStore();
        await setAccountDataToStore();
    } else {
        await setAccountDataToStore();

        // TODO: Здесь будет запрос на сервер для отключения всех аккаунтов
        const accStore = useAccountStore();
        const accountIds = accStore.getCollectionId();
        console.log('Accounts to disconnect:', accountIds);

        logoutAllStore();
    }
}

async function setUserDataToStore() {
    const userData = await getUserData();
    const userStore = useUserStore();

    userStore.setUserData(userData);
}

async function setAccountDataToStore() {
    const accData = await getAccountData();
    const accStore = useAccountStore();

    accStore.setAccountsDataFromLocalStore(accData);
}

function bindListener() {
    window.addEventListener('storage', function (e) {
        if (
            (e.key === TOKEN_KEY && e.newValue === null) ||
            (e.key === null && e.newValue === null)
        ) {
            logoutAllStore();
            router.replace({ name: 'home' }).catch(console.error);
        }
    });
}

const isTokenExpired = (timeStamp) => {
    if (!timeStamp) return false;

    const now = new Date().getTime();
    const diff = now - timeStamp;

    return diff > TOKEN_TTL_MS;
};

function setAuthToken(access_token) {
    localStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({
            value: access_token,
            timeStamp: new Date().getTime(),
        })
    );
}

async function getAuthToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? JSON.parse(token) : null;
}

function setUserData(data) {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
}

async function getUserData() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

function removeAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function clearLocalStorage() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACC_KEY);
}

function setAccountData(data) {
    localStorage.setItem(ACC_KEY, JSON.stringify(data));
}

async function getAccountData() {
    const data = localStorage.getItem(ACC_KEY);
    return data ? JSON.parse(data) : [];
}

const localStorageUtils = {
    initLocalStore,
    getAuthToken,
    getUserData,
    getAccountData,
    setAuthToken,
    setUserData,
    setAccountData,
    clearLocalStorage
};

export default localStorageUtils;
