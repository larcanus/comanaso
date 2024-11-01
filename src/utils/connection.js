import { Api, TelegramClient } from 'telegram';
import { StoreSession, StringSession } from 'telegram/sessions';

export async function createClient(apiId, apiHash) {
    const storeSession = new StoreSession(`folder_${apiId}`);
    // const stringSession = new StringSession('');
    const client = new TelegramClient(storeSession, apiId, apiHash, {
        connectionRetries: 1,
        requestRetries: 2,
        downloadRetries: 2,
    });
    client.logger.colors.info = 'color : #56560d'

    storeSession.save();

    return client;
}

export async function fullDisconnectClient(client) {
    await client?.disconnect();
    await client?.session.delete();
    await client?.destroy();
}

export async function logOut(client) {
    return client.invoke(
        new Api.auth.LogOut(),
    );
}


