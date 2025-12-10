import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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

    // State
    const state = ref({});

    // Actions
    function setAccountsDataFromLocalStore(accountsData) {
        if (accountsData) {
            state.value = accountsData;
        }
    }

    async function setAccountData(accountData) {
        state.value[accountData.id] = validate({
            ...defaultStateModel,
            ...accountData,
        });
        await setAccountLocalStore(state.value);

        return { ...state.value[accountData.id] };
    }

    async function deleteAccountData(id) {
        delete state.value[id];
        await deleteAccountLocalStore(state.value);

        return { ...state.value };
    }

    async function updateAccountData(accountData) {
        const existingAccountData = state.value[accountData.id];
        state.value[accountData.id] = validate({
            ...defaultStateModel,
            ...existingAccountData,
            ...accountData,
        });
        await updateAccountLocalStore(state.value);

        return { ...state.value[accountData.id] };
    }

    async function changeStatus(id, status, errorMessage = null) {
        if (state.value[id]) {
            state.value[id].status = status;
            state.value[id].errorMessage = errorMessage;
            await updateAccountLocalStore(state.value);
        }

        return { id, status, errorMessage };
    }

    function getById(id) {
        return state.value[id] ? { ...state.value[id] } : null;
    }

    function clearAccounts() {
        state.value = {};
    }

    // Вспомогательная функция для валидации полей аккаунта
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

    // Getters (computed)
    const accountIds = computed(() => Object.keys(state.value));
    const accounts = computed(() => Object.values(state.value));
    const accountsCount = computed(() => Object.keys(state.value).length);
    const hasAccounts = computed(() => Object.keys(state.value).length > 0);
    const onlineAccounts = computed(() =>
        Object.values(state.value).filter(acc => acc.status === 'online')
    );
    const offlineAccounts = computed(() =>
        Object.values(state.value).filter(acc => acc.status === 'offline')
    );

    return {
        // State
        state,

        // Actions
        setAccountsDataFromLocalStore,
        setAccountData,
        deleteAccountData,
        updateAccountData,
        changeStatus,
        getById,
        clearAccounts,

        // Getters
        accountIds,
        accounts,
        accountsCount,
        hasAccounts,
        onlineAccounts,
        offlineAccounts,
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

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    return `${randomAdjective} ${noun}`;
}

export default useAccountStore;
