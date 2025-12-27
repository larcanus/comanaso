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
        dataLoadedAt: null, // timestamp последней загрузки данных
        hasAnalyticsData: false, // флаг наличия загруженных данных
    };

    // State
    const state = ref({});
    const isLoading = ref(false);
    const error = ref(null);

    // Константа для TTL кэша
    const CACHE_TTL = 30 * 60 * 1000; // 30 минут

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
                    dataLoadedAt: state.value[account.id]?.dataLoadedAt || null,
                    hasAnalyticsData: state.value[account.id]?.hasAnalyticsData || false,
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

            return createdAccount;
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

    /**
     * Проверить, загружены ли данные аналитики для аккаунта
     * @param {number} accountId - ID аккаунта
     * @param {boolean} checkTTL - Проверять ли актуальность по времени
     * @returns {boolean}
     */
    function hasAnalyticsData(accountId, checkTTL = false) {
        const account = state.value[accountId];

        if (!account || !account.hasAnalyticsData) {
            return false;
        }

        // Если не нужно проверять TTL, возвращаем просто флаг
        if (!checkTTL) {
            return true;
        }

        // Проверяем актуальность данных по времени
        if (!account.dataLoadedAt) {
            return false;
        }

        const now = Date.now();
        const timeSinceLoad = now - account.dataLoadedAt;

        return timeSinceLoad < CACHE_TTL;
    }

    /**
     * Отметить, что данные аналитики загружены для аккаунта
     * @param {number} accountId - ID аккаунта
     */
    async function markAnalyticsDataLoaded(accountId) {
        if (state.value[accountId]) {
            state.value[accountId].hasAnalyticsData = true;
            state.value[accountId].dataLoadedAt = Date.now();
            await updateAccountLocalStore(state.value);
        }
    }

    /**
     * Очистить флаг загруженности данных для аккаунта
     * @param {number} accountId - ID аккаунта
     */
    async function clearAnalyticsData(accountId) {
        if (state.value[accountId]) {
            state.value[accountId].hasAnalyticsData = false;
            state.value[accountId].dataLoadedAt = null;
            await updateAccountLocalStore(state.value);
        }
    }

    /**
     * Получить время последней загрузки данных
     * @param {number} accountId - ID аккаунта
     * @returns {number|null} timestamp или null
     */
    function getDataLoadedAt(accountId) {
        return state.value[accountId]?.dataLoadedAt || null;
    }

    /**
     * Проверить, устарели ли данные
     * @param {number} accountId - ID аккаунта
     * @returns {boolean}
     */
    function isDataStale(accountId) {
        const loadedAt = getDataLoadedAt(accountId);

        if (!loadedAt) {
            return true;
        }

        const now = Date.now();
        const timeSinceLoad = now - loadedAt;

        return timeSinceLoad >= CACHE_TTL;
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

        hasAnalyticsData,
        markAnalyticsDataLoaded,
        clearAnalyticsData,
        getDataLoadedAt,
        isDataStale,
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
