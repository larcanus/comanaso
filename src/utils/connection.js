import { TelegramClient } from 'telegram';
import { StoreSession, StringSession } from 'telegram/sessions';

export async function createClient(apiId, apiHash) {
    const storeSession = new StoreSession(`folder_${apiId}`);
    // const stringSession = new StringSession('');
    const client = new TelegramClient(storeSession, apiId, apiHash, {
        connectionRetries: 2,
    });
    client.logger.colors.info = 'color : #56560d'

    storeSession.save();

    return client;
}


