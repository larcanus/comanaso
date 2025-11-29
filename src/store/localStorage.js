import { logoutAllStore } from '@/store/storeController.js';
import router from '@/router/index.js';

import useAuthStore from '@/store/auth';
import useUserStore from '@/store/user';
import useAccountStore from '@/store/account.js';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ACC_KEY = 'acc_data';
const TOKEN_TTL_MS = 3600000 * 2; // 2 hours

// Проверка доступности localStorage
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage недоступен:', e);
        return false;
    }
}

// Безопасное получение данных из localStorage
function safeGetItem(key) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage недоступен, используются данные из памяти');
        return null;
    }
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error(`Ошибка чтения ${key} из localStorage:`, e);
        return null;
    }
}

// Безопасная запись данных в localStorage
function safeSetItem(key, value) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage недоступен, данные не сохранены');
        return false;
    }
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.error(`Ошибка записи ${key} в localStorage:`, e);
        return false;
    }
}

// Безопасное удаление данных из localStorage
function safeRemoveItem(key) {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error(`Ошибка удаления ${key} из localStorage:`, e);
        return false;
    }
}

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
    if (userData) {
        const userStore = useUserStore();
        userStore.setUserData(userData);
    }
}

async function setAccountDataToStore() {
    const accData = await getAccountData();
    if (accData) {
        const accStore = useAccountStore();
        accStore.setAccountsDataFromLocalStore(accData);
    }
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

// Экспорт функций для использования в других модулях
async function getAuthToken() {
    const token = safeGetItem(TOKEN_KEY);
    return token ? JSON.parse(token) : null;
}

async function getUserData() {
    const data = safeGetItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

async function getAccountData() {
    const data = safeGetItem(ACC_KEY);
    return data ? JSON.parse(data) : [];
}

function setAuthToken(token) {
    safeSetItem(
        TOKEN_KEY,
        JSON.stringify({
            value: token,
            timeStamp: new Date().getTime(),
        })
    );
}

function setUserData(userData) {
    safeSetItem(USER_KEY, JSON.stringify(userData));
}

function setAccountData(accountData) {
    safeSetItem(ACC_KEY, JSON.stringify(accountData));
}

function clearLocalStorage() {
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(USER_KEY);
    safeRemoveItem(ACC_KEY);
}

export default {
    initLocalStore,
    getAuthToken,
    getUserData,
    getAccountData,
    setAuthToken,
    setUserData,
    setAccountData,
    clearLocalStorage,
    isLocalStorageAvailable,
};
