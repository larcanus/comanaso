<script setup>
import { defineProps, reactive, watch } from 'vue';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';

const accountStore = useAccountStore();
const toastStore = useToastStore();
const props = defineProps({
    account: String,
});
const accountData = accountStore.getById(props.account);
const LOC_TOAST_VALID_ERROR = 'Ошибка данных. Проверьте поля аккаунта';
const LOC_TOAST_SUCCESS_CREATE_CLIENT = 'Успех - Клиент создан';

const state = reactive({
    ...{
        isConnect: accountData.status !== 'offline',
        isEdit: false,
        id: 0,
        name: '',
        entity: '',
        apiId: null,
        apiHash: '',
        phoneNumber: '',
    },
    ...accountData,
});

accountStore.$onAction(({ name, after }) => {
    after((result) => {
        if (name === 'changeStatus' && result.id === state.id) {
            state.status = result.status;
        }
    });
});

function onClickSave() {
    state.isEdit = !state.isEdit;
    const newStateAccount = { ...state };
    delete newStateAccount.isEdit;
    delete newStateAccount.isConnect;
    accountStore.updateAccountData(newStateAccount);
}

function onClickEdit() {
    state.isEdit = !state.isEdit;
}

function onClickDelete() {
    accountStore.deleteAccountData(state.id);
}

function onClickStart() {
    if (!isValidConnectData({ apiId: state.apiId, apiHash: state.apiHash })) {
        toastStore.addToast('error', LOC_TOAST_VALID_ERROR);

        return;
    }

    state.isConnect = !state.isConnect;
    accountStore.changeStatus(state.id, 'connect');
    startConnectAccount();
}

function onClickDisconnect() {
    state.isConnect = !state.isConnect;
    accountStore.changeStatus(state.id, 'offline');
}

function startConnectAccount() {
    const apiId = state.apiId || 27151307;
    const apiHash = state.apiHash || 'ff9d24b00baaa16907c31afdbe318fd7';

    const stringSession = new StringSession();

    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 2,
    });

    toastStore.addToast('ok', LOC_TOAST_SUCCESS_CREATE_CLIENT);
}

function isValidConnectData(fields) {
    let result = true;
    Object.keys(fields).forEach((field) => {
        if (!fields[field]) {
            result = false;
        }

        if (typeof fields[field] === 'string' && fields[field].length === 0) {
            result = false;
        }

        if (typeof fields[field] === 'string' && fields[field].length === 0) {
            result = false;
        }
    });

    return result;
}
</script>

<template>
    <div class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus v-bind="{ status: state.status }" />
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
    background-color: #007bff;
    color: white;
    border-radius: 3px;
    cursor: pointer;
}

.buttons button:hover {
    background-color: #0056b3;
}

.buttons .button-cancel {
    background-color: #d34343;
}

.buttons .button-cancel:hover {
    background-color: #6e2424;
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
}
</style>
