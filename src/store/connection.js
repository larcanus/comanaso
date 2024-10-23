import { defineStore } from 'pinia';
import { ref } from 'vue';
import { createClient } from '@/utils/connection.js';
import useAccountStore from '@/store/account.js';

export const useConnectionStore = defineStore('connection', () => {
    const defaultStateModel = {
        client: null,
        account: 0,
    };

    const state = ref({});

    function getStateById(id) {
        return this.state[id];
    }

    function getClientById(id) {
        const state = this.state[id];

        if(state?.client) {
            return state.client;
        }

        if(!state?.client) {
            this.state[id] = {
                ...defaultStateModel,
                client:  tryGetClientByAccountId(id),
            }

            return this.state[id].client;
        }

        return null;
    }

    function setConnection(id, newState) {
        this.state[id] = newState;
    }

    function setClient(id, client) {
        this.state[id].client = client;
    }

    function $reset() {
        this.state = defaultStateModel;
    }

    return { state, $reset, setConnection, setClient, getStateById, getClientById };
});

async function tryGetClientByAccountId(accountId) {
    console.log('tryGetClientByKeyAuth', accountId);
    const accountStore = useAccountStore();
    const accountData = accountStore.getById(accountId);

    if (accountData.apiId && accountData.apiHash) {
        return await createClient(accountData.apiId, accountData.apiHash);
    }

    return null
}

export default useConnectionStore;
