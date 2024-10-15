import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAccountStore = defineStore('account', () => {
    const defaultStateModel = {
        id: 0,
        name: '',
        entity: '',
        apiId: '',
        apiHash: '',
        phoneNumber: '',
        status: 'offline', // 'offline' 'connect' 'online' 'error'
    };

    const state = ref({});

    function setAccountData(accountData) {
        this.state[accountData.id] = validate({
            ...defaultStateModel,
            ...accountData,
        });

        return { ...this.state[accountData.id] };
    }

    function deleteAccountData(id) {
        delete this.state[id];

        return { ...this.state };
    }

    function updateAccountData(accountData) {
        const existingAccountData = state[accountData.id];
        this.state[accountData.id] = validate({
            ...defaultStateModel,
            ...existingAccountData,
            ...accountData,
        });

        return { ...this.state[accountData.id] };
    }

    function getCollectionId() {
        return Object.keys(this.state);
    }

    function getById(id) {
        return { ...this.state[id] };
    }

    function changeStatus(id, status) {
        this.state[id].status = status;

        return {id, status};
    }

    function $reset() {
        this.state = {};
    }

    function validate(fields) {
        if (fields.name === null || fields.name.length === 0) {
            fields.name = `${generatePositiveAccountName()} telegram`;
        }

        return fields;
    }

    return {
        state,
        $reset,
        getCollectionId,
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
    ];

    const noun = 'аккаунт';

    const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];

    return `${randomAdjective} ${noun}`;
}

export default useAccountStore;
