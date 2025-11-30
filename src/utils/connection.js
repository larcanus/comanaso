const LOC_TOAST_SUCCESS_DATA_UPDATE = 'Данные успешно получены';
const LOC_TOAST_ERROR_DATA_UPDATE =
    'При запросе произошла ошибка. Проверьте состояние подключения к аккаунту';
const LOC_TOAST_ERROR_DATA_UPDATE_AUTH =
    'При запросе произошла ошибка. Ключ авторизация не принят. Проверьте состояние подключения к аккаунту';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
}

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API Error');
    }

    return response.json();
}

// Подключение аккаунта
export async function connectAccount(accountId) {
    return apiRequest(`/accounts/${accountId}/connect`, {
        method: 'POST',
    });
}

// Подтверждение кода
export async function verifyCode(accountId, code, phoneCodeHash) {
    return apiRequest(`/accounts/${accountId}/verify-code`, {
        method: 'POST',
        body: JSON.stringify({ code, phoneCodeHash }),
    });
}

// Подтверждение пароля 2FA
export async function verifyPassword(accountId, password) {
    return apiRequest(`/accounts/${accountId}/verify-password`, {
        method: 'POST',
        body: JSON.stringify({ password }),
    });
}

// Отключение аккаунта
export async function disconnectAccount(accountId) {
    return apiRequest(`/accounts/${accountId}/disconnect`, {
        method: 'POST',
    });
}

// Получение диалогов
export async function getDialogs(accountId, limit = 100, offset = 0) {
    return apiRequest(`/accounts/${accountId}/dialogs?limit=${limit}&offset=${offset}`);
}

// Получение папок
export async function getFolders(accountId) {
    return apiRequest(`/accounts/${accountId}/folders`);
}

// Получение рекомендуемых папок
export async function getSuggestedDialogFilters(accountId) {
    return apiRequest(`/accounts/${accountId}/folders/suggested`);
}

// Получение всех данных
export async function getCommonData(accountId) {
    return apiRequest(`/accounts/${accountId}/data`);
}

// Выход из Telegram
export async function logOut(accountId) {
    return apiRequest(`/accounts/${accountId}/logout`, {
        method: 'POST',
    });
}

export async function createClient(apiId, apiHash) {
    return {};
}

export async function fullDisconnectClient() {
    return {};
}

// export async function getCommonData(accountId, store, toast) {
//     console.log('getCommonData', accountId, store, toast);
//     if (accountId && store) {
//         try {
//             // Заглушка для получения данных с сервера
//             // const response = await fetch(`/api/accounts/${accountId}/dialogs`);
//             // const data = await response.json();
//
//             console.log('getCommonData: будет реализовано через серверные запросы');
//             toast.addToast('ok', LOC_TOAST_SUCCESS_DATA_UPDATE);
//             return true;
//         } catch (error) {
//             console.error('getCommonData error:', error);
//             toast.addToast('error', error.message || LOC_TOAST_ERROR_DATA_UPDATE);
//             return false;
//         }
//     }
//
//     toast.addToast('error', LOC_TOAST_ERROR_DATA_UPDATE);
//     return false;
// }
//
// export async function getFolders(accountId) {
//     console.log('getFolders: будет реализовано через серверные запросы');
//     // const response = await fetch(`/api/accounts/${accountId}/folders`);
//     // return response.json();
//     return [];
// }
//
// export async function getSuggestedDialogFilters(accountId) {
//     console.log('getSuggestedDialogFilters: будет реализовано через серверные запросы');
//     // const response = await fetch(`/api/accounts/${accountId}/suggested-filters`);
//     // return response.json();
//     return [];
// }
