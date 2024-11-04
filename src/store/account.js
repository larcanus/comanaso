import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
    deleteAccountLocalStore,
    setAccountLocalStore,
    updateAccountLocalStore,
} from '@/store/storeController.js';

export const useAccountStore = defineStore('account', () => {
    const defaultStateModel = {
        id: 0,
        name: '',
        entity: '',
        apiId: 27151307,
        apiHash: 'ff9d24b00baaa16907c31afdbe318fd7',
        phoneNumber: '+79056002730',
        status: 'offline', // 'offline' 'connect' 'online' 'error'
        errorMessage: '',
    };

    const state = ref({});

    function setAccountsDataFromLocalStore(accountsData) {
        if (accountsData) {
            this.state = accountsData;
        }
    }

    async function setAccountData(accountData) {
        this.state[accountData.id] = validate({
            ...defaultStateModel,
            ...accountData,
        });
        await setAccountLocalStore(this.state);

        return { ...this.state[accountData.id] };
    }

    async function deleteAccountData(id) {
        delete this.state[id];
        await deleteAccountLocalStore(this.state);

        return { ...this.state };
    }

    async function updateAccountData(accountData) {
        const existingAccountData = state[accountData.id];
        this.state[accountData.id] = validate({
            ...defaultStateModel,
            ...existingAccountData,
            ...accountData,
        });
        await updateAccountLocalStore(this.state);

        return { ...this.state[accountData.id] };
    }

    function getCollectionId() {
        return Object.keys(this.state);
    }

    function getById(id) {
        return { ...this.state[id] };
    }

    async function changeStatus(id, status, errorMessage = null) {
        this.state[id].status = status;
        this.state[id].errorMessage = errorMessage;
        await updateAccountLocalStore(this.state);

        return { id, status, errorMessage };
    }

    function $reset() {
        this.state = {};
    }

    function validate(fields) {
        const preparedFields = {};
        Object.keys(fields).forEach((key) => {
            if (key in defaultStateModel) {
                preparedFields[key] = fields[key];
            }
        });

        if (preparedFields.name === null || preparedFields.name.length === 0) {
            preparedFields.name = `${generatePositiveAccountName()} telegram`;
        }

        return preparedFields;
    }

    return {
        state,
        $reset,
        getCollectionId,
        setAccountsDataFromLocalStore,
        setAccountData,
        deleteAccountData,
        updateAccountData,
        getById,
        changeStatus,
    };
});

function generatePositiveAccountName() {
    const adjectives = [
        'Замечательный',
        'Удивительный',
        'Великолепный',
        'Прекрасный',
        'Фантастический',
        'Восхитительный',
        'Чудесный',
        'Потрясающий',
        'Блестящий',
        'Исключительный',
        'Невероятный',
    ];

    const noun = 'аккаунт';

    const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];

    return `${randomAdjective} ${noun}`;
}

export default useAccountStore;
