import { defineStore } from 'pinia';
import { shallowRef, toRaw } from 'vue';
import { createClient } from '@/utils/connection.js';
import useAccountStore from '@/store/account.js';

export const useTelegramClientStore = defineStore('telegramClient', () => {
    const state = shallowRef(null);

    async function getClientByAccountId(id) {
        if (!state.value) {
            state.value = await tryGetClientByAccountId(id);
        }
        return toRaw(state.value);
    }

    function setClient(newClient) {
        state.value = newClient;
    }

    function $reset() {
        state.value = null;
    }

    return { state, $reset, setClient, getClientByAccountId };
});

async function tryGetClientByAccountId(accountId) {
    console.log('store tryGetClientByAccountId accountId:', accountId);
    const accountStore = useAccountStore();
    const accountData = accountStore.getById(accountId);

    if (accountData.apiId && accountData.apiHash) {
        return await createClient(accountData.apiId, accountData.apiHash);
    }

    return null;
}

export default useTelegramClientStore;
