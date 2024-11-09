import { logoutAllStore } from '@/store/storeController.js';
import router from '@/router/index.js';

import useAuthStore from '@/store/auth';
import useUserStore from '@/store/user';
import useAccountStore from '@/store/account.js';
import useTelegramClientStore from '@/store/telegramClient.js';
import { fullDisconnectClient, logOut } from '@/utils/connection.js';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ACC_KEY = 'acc_data';
const TOKEN_TTL_MS = 3600000; // 1 hour

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
        const accStore = useAccountStore();
        const accountIds = accStore.getCollectionId();
        for (const accountId of accountIds) {
            const tgClientStore = useTelegramClientStore();
            const client = await tgClientStore.getClientByAccountId(accountId);
            console.info('have client on accountId:', accountId);
            try {
                await client.connect();
                console.info('trying logout');
                const resultLogout = await logOut(client);
                console.log('logout --->', resultLogout);
                await fullDisconnectClient(client);
            } catch (e) {
                console.error(e);
            }

        }

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
    let result = null;
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        token && (result = await JSON.parse(token));
    } catch (error) {
        console.error(error);
    }

    return result;
}

function setUserData(data) {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
}

async function getUserData() {
    let result = null;
    try {
        const userData = localStorage.getItem(USER_KEY);
        userData && (result = await JSON.parse(userData));
    } catch (error) {
        console.error(error);
    }

    return result;
}

function removeAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function clearLocalStorage() {
    localStorage.clear();
}

function setAccountData(data) {
    localStorage.setItem(ACC_KEY, JSON.stringify(data));
}

async function getAccountData() {
    let result = null;
    try {
        const accData = localStorage.getItem(ACC_KEY);
        accData && (result = await JSON.parse(accData));
    } catch (error) {
        console.error(error);
    }

    return result;
}

const localStorageUtils = {
    initLocalStore,
    clearLocalStorage,
    setAuthToken,
    setUserData,
    setAccountData,
};
export default localStorageUtils;
