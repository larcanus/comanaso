<script setup>
import { defineProps, reactive } from 'vue';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import Confirm from '@/components/modal/Confirm.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import {
    fullDisconnectClient,
    getCommonData,
} from '@/utils/connection.js';
import useDialogStore from '@/store/dialogs.js';

const accountStore = useAccountStore();
const toastStore = useToastStore();
const props = defineProps({
    account: String,
});
const accountData = accountStore.getById(props.account);

const LOC_TOAST_VALID_ERROR = 'Ошибка данных. Проверьте поля аккаунта';
const LOC_TOAST_CONNECT_ERROR = 'Ошибка подключения';
const LOC_TOAST_SUCCESS_CREATE_CLIENT = 'Успех - Клиент подключен к аккаунту!';
const LOC_TOAST_SUCCESS_CONNECT = 'Аккаунт успешно подключен!';
const LOC_TOAST_SUCCESS_DISCONNECT = 'Аккаунт отключен';

const state = reactive({
    ...{
        isConnect: accountData.status !== 'offline',
        isEdit: false,
        isModalPopupInfoVisible: false,
        isModalConfirmVisible: false,
        modalConfirmMessage: null,
        modalPopupInfoMessage: null,
        id: 0,
        name: '',
        entity: '',
        apiId: '',
        apiHash: '',
        phoneNumber: '',
    },
    ...accountData,
});

onBeforeMount(async () => {
    await checkClient();
});

async function checkClient() {
    console.log('checkClient client.connected:',);
}

accountStore.$onAction(({ name, after }) => {
    after((result) => {
        if (name === 'changeStatus' && result.id === state.id) {
            state.status = result.status;
            state.isConnect = result.status !== 'offline';
            state.modalPopupInfoMessage = result.errorMessage;
        }

        if (name === 'updateAccountData' && result.id === state.id) {
            Object.assign(state, result);
        }
    });
});

function onClickSave() {
    state.isEdit = !state.isEdit;
    const newStateAccount = { ...state };
    accountStore.updateAccountData(newStateAccount);
}

function onClickEdit() {
    state.isEdit = !state.isEdit;
}

function onClickDelete() {
    accountStore.deleteAccountData(state.id);
}

async function onClickStart() {
    if (!isValidConnectData({ apiId: state.apiId, apiHash: state.apiHash, phoneNumber: state.phoneNumber })) {
        toastStore.addToast('error', LOC_TOAST_VALID_ERROR);
        return;
    }

    accountStore.changeStatus(state.id, 'connect');

    // TODO: Здесь будет запрос на сервер для подключения аккаунта
    try {
        // Заглушка - имитация успешного подключения
        await new Promise(resolve => setTimeout(resolve, 1000));
        await accountStore.changeStatus(state.id, 'online');
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_CONNECT);
    } catch (error) {
        console.error('Connection error:', error);
        await accountStore.changeStatus(state.id, 'error', {
            title: 'Ошибка подключения',
            desc: error.message
        });
    }
}

async function onClickDisconnect() {
    // TODO: Здесь будет запрос на сервер для отключения аккаунта
    try {
        await accountStore.changeStatus(state.id, 'offline');
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_DISCONNECT);
    } catch (error) {
        console.error('Disconnect error:', error);
    }
}

async function startConnectAccount() {
    console.log('startConnectAccount connection');
}

function prepareErrorMessage(error) {
    let errorObj = { title: '', desc: '' };
    errorObj.title = `Ошибка подключения - ${error?.errorMessage} ${error.code}`;
    errorObj.desc = `сообщение - ${error.message}`;

    return errorObj;
}

function prepareDetailMessage() {
    let messageObj = { title: '', desc: '' };
    if (state.isConnect) {
        messageObj.title = 'Аккаунт подключен';
        messageObj.desc = 'Можно выполнять операции с аккаунтом';
    } else {
        messageObj.title = 'Аккаунт не подключен';
        messageObj.desc = 'Для работы необходимо подключить аккаунт';
    }
    return messageObj;
}

function isValidConnectData(fields) {
    return Object.values(fields).every(value =>
        value && (typeof value !== 'string' || value.length > 0)
    );
}

async function showDetail() {
    if (state.modalPopupInfoMessage === null) {
        state.modalPopupInfoMessage = prepareDetailMessage();
    }

    state.isModalPopupInfoVisible = true;
}

let resolveConfirmPromise;
function showConfirm(message) {
    state.modalConfirmMessage = message || 'Введите код для входа в Telegram';
    state.isModalConfirmVisible = true;

    return new Promise((resolve) => {
        resolveConfirmPromise = resolve;
    });
}

function handleConfirmOk(inputValue) {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(inputValue);
}

function handleConfirmCancel() {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(false);
}
</script>

<template>
    <div class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus v-bind="{ status: state.status }" />
            <button @click="showDetail" class="button-detail">
                подробности
            </button>
            <DetailPopup
                :message="state.modalPopupInfoMessage"
                :isVisible="state.isModalPopupInfoVisible"
                @close="state.isModalPopupInfoVisible = false"
            />
        </div>
        <div class="product-details">
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="Название"
                v-model="state.name"
            />
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="App api_id"
                v-model="state.apiId"
            />
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="App api_hash"
                v-model="state.apiHash"
            />
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="Номер телефона"
                v-model="state.phoneNumber"
            />
            <div class="buttons">
                <button v-if="state.isEdit" @click="onClickSave">
                    Сохранить
                </button>
                <button
                    v-if="!state.isEdit"
                    :disabled="state.isConnect"
                    @click="onClickEdit"
                >
                    Редактировать
                </button>
                <button
                    v-if="state.isEdit"
                    :disabled="state.isConnect"
                    @click="onClickDelete"
                    class="button-cancel"
                >
                    Удалить аккаунт
                </button>
                <button
                    v-if="!state.isEdit && !state.isConnect"
                    :disabled="state.isConnect"
                    @click="onClickStart"
                >
                    Старт!
                </button>
                <button
                    v-if="!state.isEdit && state.isConnect"
                    :disabled="!state.isConnect"
                    @click="onClickDisconnect"
                    class="button-cancel"
                >
                    Отключить
                </button>
            </div>
            <Confirm
                :message="state.modalConfirmMessage"
                :is-visible="state.isModalConfirmVisible"
                @confirm="handleConfirmOk"
                @cancel="handleConfirmCancel"
            />
        </div>
    </div>
</template>

<style scoped>
.product-card {
    display: flex;
    flex-direction: row;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 2px;
    margin: 10px;
    box-sizing: border-box;
}

.product-icon {
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    place-items: center;
}

.product-icon img {
    width: 100px;
    height: 100px;
    border-radius: 2px;
}

.product-details {
    flex-grow: 1;
    padding-left: 10px;
    display: flex;
    flex-direction: column;
}

.product-details input {
    margin-bottom: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

input:disabled {
    background-color: #0c0c23;
    color: #cbcad0;
    border: 1px solid #ababab;
    cursor: not-allowed;
}

.buttons {
    display: flex;
    justify-content: space-between;
}

.buttons button:disabled {
    background-color: #2c3e50;
    color: #a6a5a5;
    cursor: not-allowed;
}

.buttons button:disabled:hover {
    background-color: #2c3e50;
}

.buttons button {
    padding: 5px 10px;
    border: none;
    background-color: var(--vt-bt-background-color);
    color: white;
    border-radius: 3px;
    cursor: pointer;
}

.buttons button:hover {
    background-color: var(--vt-bt-background-color-hover);
}

.buttons .button-cancel {
    background-color: var(--vt-bt-cancel-background-color);
}

.buttons .button-cancel:hover {
    background-color: var(--vt-bt-cancel-background-color-hover);
}

.button-detail {
    border: none;
    border-radius: 2px;
    color: var(--vt-c-white-soft);
    cursor: pointer;
    background-color: var(--vt-bt-info-background-color);
}
.button-detail:hover {
    background-color: var(--vt-bt-info-background-color-hover);
}

@media (max-width: 700px) {
    .product-card {
        flex-direction: column;
        align-items: center;
    }

    .product-details {
        padding-left: 0;
        width: 100%;
    }

    .button-detail {
        margin-bottom: 10px;
    }
}
</style>
