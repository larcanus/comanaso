import { Api, TelegramClient } from 'telegram';
import { StoreSession, StringSession } from 'telegram/sessions';
const LOC_TOAST_SUCCESS_DATA_UPDATE = 'Данные успешно получены';
const LOC_TOAST_ERROR_DATA_UPDATE =
    'При запросе произошла ошибка. Проверьте состояние подключения к аккаунту';
const LOC_TOAST_ERROR_DATA_UPDATE_AUTH =
    'При запросе произошла ошибка. Ключ авторизация не принят. Проверьте состояние подключения к аккаунту';

export async function createClient(apiId, apiHash) {
    const storeSession = new StoreSession(`folder_${apiId}`);
    // const stringSession = new StringSession('');
    const client = new TelegramClient(storeSession, apiId, apiHash, {
        connectionRetries: 1,
        requestRetries: 2,
        downloadRetries: 2,
    });
    client.logger.colors.info = 'color : #56560d';

    storeSession.save();

    return client;
}

export async function fullDisconnectClient(client) {
    await client?.disconnect();
    await client?.session.delete();
    await client?.destroy();
}

export async function logOut(client) {
    return client?.invoke(new Api.auth.LogOut());
}

export async function getCommonData(client, store, toast) {
    if (client && store) {
        try {
            const dialogData = await client?.getDialogs();
            await store.setDialogs(dialogData);
            toast.addToast('ok', LOC_TOAST_SUCCESS_DATA_UPDATE);

            return true;
        } catch (error) {
            console.error('getCommonData catch:', error);
            if(error.message.includes('AUTH_KEY_UNREGISTERED'))
            {
                toast.addToast('error', LOC_TOAST_ERROR_DATA_UPDATE_AUTH);
            }
            else {
                toast.addToast('error', error.message);
            }
            return true;
        }
    }

    toast.addToast('error', LOC_TOAST_ERROR_DATA_UPDATE);
    return true;
}
