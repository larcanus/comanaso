import { TelegramClient } from 'telegram';
import { StoreSession, StringSession } from 'telegram/sessions';

export async function createClient(apiId, apiHash) {
    const storeSession = new StoreSession('folder1');
    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 3,
    });
    client.logger.colors.info = 'color : #56560d'

    stringSession.save();

    return client;
}


