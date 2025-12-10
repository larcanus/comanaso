import { logoutAllStore } from '@/store/storeController.js';
import router from '@/router/index.js';

import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import useAccountStore from '@/store/account.js';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ACC_KEY = 'acc_data';
const TOKEN_TTL_MS = 3600000 * 2; // 2 hours

// Определяем доступное хранилище
let storageType = 'none';
let storage = null;

// Проверка доступности localStorage
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        storageType = 'localStorage';
        storage = localStorage;
        return true;
    } catch (e) {
        console.warn('localStorage недоступен, пробуем sessionStorage');
        return false;
    }
}

// Проверка доступности sessionStorage
function isSessionStorageAvailable() {
    try {
        const test = '__sessionStorage_test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        storageType = 'sessionStorage';
        storage = sessionStorage;
        console.info('✅ Используется sessionStorage (данные сохраняются только на время сессии)');
        return true;
    } catch (e) {
        console.error('sessionStorage также недоступен:', e);
        storageType = 'memory';
        storage = createMemoryStorage();
        console.warn(
            '⚠️  Используется хранилище в памяти (данные будут потеряны при перезагрузке)'
        );
        return false;
    }
}

// Создание хранилища в памяти
function createMemoryStorage() {
    const memoryStore = new Map();
    return {
        getItem: (key) => memoryStore.get(key) || null,
        setItem: (key, value) => memoryStore.set(key, value),
        removeItem: (key) => memoryStore.delete(key),
        clear: () => memoryStore.clear(),
    };
}

// Инициализация хранилища
function initStorage() {
    if (!storage) {
        if (!isLocalStorageAvailable()) {
            if (!isSessionStorageAvailable()) {
                // Уже установлено memory storage
            }
        }
    }
    return storage;
}

// Безопасное получение данных из хранилища
function safeGetItem(key) {
    const store = initStorage();
    try {
        return store.getItem(key);
    } catch (e) {
        console.error(`Ошибка чтения ${key} из ${storageType}:`, e);
        return null;
    }
}

// Безопасная запись данных в хранилище
function safeSetItem(key, value) {
    const store = initStorage();
    try {
        store.setItem(key, value);
        return true;
    } catch (e) {
        console.error(`Ошибка записи ${key} в ${storageType}:`, e);
        return false;
    }
}

// Безопасное удаление данных из хранилища
function safeRemoveItem(key) {
    const store = initStorage();
    try {
        store.removeItem(key);
        return true;
    } catch (e) {
        console.error(`Ошибка удаления ${key} из ${storageType}:`, e);
        return false;
    }
}

async function initLocalStore() {
    // Инициализируем хранилище
    initStorage();

    console.log(`📦 Используется хранилище: ${storageType}`);

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

        await logoutAllStore();
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
    // Слушаем изменения только если используется localStorage или sessionStorage
    if (storageType !== 'memory') {
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

function getStorageType() {
    return storageType;
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
    getStorageType,
};
