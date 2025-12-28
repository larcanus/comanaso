import { logoutAllStore } from '@/store/storeController.js';
import router from '@/router/index.js';

import { useAuthStore } from '@/store/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const TOKEN_TTL_MS = 3600000 * 2; // 2 hours

// Определяем доступное хранилище
let storageType = 'none';
let storage = null;

async function initLocalStore() {
    setStorage();

    const token = await checkAuthToken();
    if (token) {
        await setAuthTokenToStore(token);
        await setUserDataToStore();
    } else {
        clearLocalStorage();
    }
    bindListener();
}

function setStorage() {
    if (!storage) {
        if (!isLocalStorageAvailable()) {
            isSessionStorageAvailable();
        }
    }
    return storage;
}

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

async function checkAuthToken() {
    const currentToken = await getAuthToken();
    console.log('checkAuthToken currentToken', currentToken);
    if (currentToken && !isTokenExpired(currentToken.timeStamp)) {
        return currentToken;
    } else {
        return null;
    }
}

async function setAuthTokenToStore(currentToken) {
    const authStore = useAuthStore();
    authStore.setToken(currentToken.value);
}

async function setUserDataToStore() {
    const userAuthData = await getUserData();
    if (userAuthData) {
        const authStore = useAuthStore();
        authStore.setUser(userAuthData);
    }
}

// Безопасное получение данных из хранилища
function safeGetItem(key) {
    const store = setStorage();
    try {
        return store.getItem(key);
    } catch (e) {
        console.error(`Ошибка чтения ${key} из ${storageType}:`, e);
        return null;
    }
}

// Безопасная запись данных в хранилище
function safeSetItem(key, value) {
    const store = setStorage();
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
    const store = setStorage();
    try {
        store.removeItem(key);
        return true;
    } catch (e) {
        console.error(`Ошибка удаления ${key} из ${storageType}:`, e);
        return false;
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

async function getAuthToken() {
    const token = safeGetItem(TOKEN_KEY);
    return token ? JSON.parse(token) : null;
}

async function getUserData() {
    const data = safeGetItem(USER_KEY);
    return data ? JSON.parse(data) : null;
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

function clearLocalStorage() {
    console.log('clearLocalStorage');
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(USER_KEY);
}

function getStorageType() {
    return storageType;
}

export default {
    initLocalStore,
    getAuthToken,
    getUserData,
    setAuthToken,
    setUserData,
    clearLocalStorage,
    isLocalStorageAvailable,
    getStorageType,
};
