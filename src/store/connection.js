import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createClient } from '@/utils/connection.js';
import useAccountStore from '@/store/account.js';

export const useConnectionStore = defineStore('connection', () => {
    let client = null;
    const state = ref({});

    async function getClientByAccountId(id) {
        if (!client) {
            client = await tryGetClientByAccountId(id);
        }
        return client;
    }

    function setClient(newClient) {
        client = newClient;
    }

    function $reset() {
        this.state = {};
        client = null;
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

export default useConnectionStore;
