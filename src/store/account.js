import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    deleteAccountLocalStore,
    setAccountLocalStore,
    updateAccountLocalStore,
} from '@/store/storeController.js';
import { accountService } from '@/services/account.service.js';

export const useAccountStore = defineStore('account', () => {
    const defaultStateModel = {
        id: 0,
        name: '',
        entity: '',
        apiId: 11111111,
        apiHash: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        phoneNumber: '+79001002020',
        status: 'offline', // 'offline' 'connect' 'online' 'error'
        errorMessage: '',
        createdAt: '',
        updatedAt: '',
    };

    // State
    const state = ref({});
    const isLoading = ref(false);
    const error = ref(null);

    // Actions
    function setAccountsDataFromLocalStore(accountsData) {
        if (accountsData) {
            state.value = accountsData;
        }
    }

    /**
     * Загрузить все аккаунты с сервера
     * @param {boolean} force - Принудительная загрузка даже если уже идет запрос
     */
    async function loadAccountsFromServer(force = false) {
        // Если уже загружаем и не форсируем - пропускаем
        if (isLoading.value && !force) {
            console.log('Accounts are already loading, skipping...');
            return state.value;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const accounts = await accountService.getAccounts();
            console.log('accounts', accounts);
            // Преобразуем массив в объект с ключами по id
            const accountsObject = {};
            accounts.forEach((account) => {
                accountsObject[account.id] = validate({
                    ...defaultStateModel,
                    ...account,
                });
            });

            state.value = accountsObject;
            await setAccountLocalStore(state.value);

            return accountsObject;
        } catch (err) {
            error.value = err.userMessage || err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Создать новый аккаунт на сервере
     */
    async function setAccountData(accountData) {
        isLoading.value = true;
        error.value = null;

        const newAccData = validate({
            ...defaultStateModel,
            ...accountData,
        });

        try {
            // Отправляем на сервер
            const createdAccount = await accountService.createAccount(newAccData);

            // Сохраняем в локальное состояние
            state.value[createdAccount.id] = validate({
                ...defaultStateModel,
                ...createdAccount,
            });

            await setAccountLocalStore(state.value);

            return { ...state.value[createdAccount.id] };
        } catch (err) {
            error.value = err.userMessage || err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Удалить аккаунт на сервере
     */
    async function deleteAccountData(id) {
        isLoading.value = true;
        error.value = null;

        try {
            // Удаляем на сервере
            await accountService.deleteAccount(id);

            // Удаляем из локального состояния
            delete state.value[id];
            await deleteAccountLocalStore(state.value);

            return { ...state.value };
        } catch (err) {
            error.value = err.userMessage || err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Обновить данные аккаунта на сервере
     */
    async function updateAccountData(accountData) {
        isLoading.value = true;
        error.value = null;

        try {
            const updateData = {};
            if (accountData.name !== undefined) updateData.name = accountData.name;
            if (accountData.apiId !== undefined) updateData.apiId = accountData.apiId;
            if (accountData.apiHash !== undefined) updateData.apiHash = accountData.apiHash;
            if (accountData.phoneNumber !== undefined)
                updateData.phoneNumber = accountData.phoneNumber;

            // Отправляем на сервер
            const updatedAccount = await accountService.updateAccount(accountData.id, updateData);

            // Обновляем локальное состояние
            const existingAccountData = state.value[accountData.id];
            state.value[accountData.id] = validate({
                ...defaultStateModel,
                ...existingAccountData,
                ...updatedAccount,
            });

            await updateAccountLocalStore(state.value);

            return { ...state.value[accountData.id] };
        } catch (err) {
            error.value = err.userMessage || err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Изменить статус аккаунта (только локально, без сервера)
     */
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

    /**
     * Получить имя аккаунта по ID
     * @param {number|string} id - ID аккаунта
     * @returns {string} Имя аккаунта
     */
    function getAccountName(id) {
        const account = state.value[id];
        return account?.name || `Аккаунт #${id}`;
    }

    /**
     * Получить статус аккаунта по ID
     * @param {number|string} id - ID аккаунта
     * @returns {string} Статус аккаунта
     */
    function getAccountStatus(id) {
        const account = state.value[id];
        return account?.status || 'offline';
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
    const accountIds = computed(() => Object.keys(state.value).map((id) => Number(id)));
    const accounts = computed(() => Object.values(state.value));
    const accountsCount = computed(() => Object.keys(state.value).length);
    const hasAccounts = computed(() => Object.keys(state.value).length > 0);
    const onlineAccounts = computed(() =>
        Object.values(state.value).filter((acc) => acc.status === 'online')
    );
    const offlineAccounts = computed(() =>
        Object.values(state.value).filter((acc) => acc.status === 'offline')
    );
    function isOnline(id) {
        const account = state.value[id];
        return account?.status === 'online';
    }

    return {
        // State
        state,
        isLoading,
        error,

        // Actions
        setAccountsDataFromLocalStore,
        loadAccountsFromServer,
        setAccountData,
        deleteAccountData,
        updateAccountData,
        changeStatus,
        getById,
        getAccountName,
        getAccountStatus,
        clearAccounts,

        // Getters
        accountIds,
        accounts,
        accountsCount,
        hasAccounts,
        onlineAccounts,
        offlineAccounts,
        isOnline,
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
