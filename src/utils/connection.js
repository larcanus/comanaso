const LOC_TOAST_SUCCESS_DATA_UPDATE = 'Данные успешно получены';
const LOC_TOAST_ERROR_DATA_UPDATE =
    'При запросе произошла ошибка. Проверьте состояние подключения к аккаунту';
const LOC_TOAST_ERROR_DATA_UPDATE_AUTH =
    'При запросе произошла ошибка. Ключ авторизация не принят. Проверьте состояние подключения к аккаунту';

export async function createClient(apiId, apiHash) {
   return {};
}

export async function fullDisconnectClient() {
    return {};
}

export async function logOut() {
    return true;
}

export async function getCommonData(accountId, store, toast) {
    console.log('getCommonData', accountId, store, toast)
    if (accountId && store) {
        try {
            // Заглушка для получения данных с сервера
            // const response = await fetch(`/api/accounts/${accountId}/dialogs`);
            // const data = await response.json();

            console.log('getCommonData: будет реализовано через серверные запросы');
            toast.addToast('ok', LOC_TOAST_SUCCESS_DATA_UPDATE);
            return true;
        } catch (error) {
            console.error('getCommonData error:', error);
            toast.addToast('error', error.message || LOC_TOAST_ERROR_DATA_UPDATE);
            return false;
        }
    }

    toast.addToast('error', LOC_TOAST_ERROR_DATA_UPDATE);
    return false;
}

export async function getFolders(accountId) {
    console.log('getFolders: будет реализовано через серверные запросы');
    // const response = await fetch(`/api/accounts/${accountId}/folders`);
    // return response.json();
    return [];
}

export async function getSuggestedDialogFilters(accountId) {
    console.log('getSuggestedDialogFilters: будет реализовано через серверные запросы');
    // const response = await fetch(`/api/accounts/${accountId}/suggested-filters`);
    // return response.json();
    return [];
}
