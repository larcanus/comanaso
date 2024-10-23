<script setup>
import { defineProps, reactive, onBeforeMount } from 'vue';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import useConnectionStore from '@/store/connection.js';

const accountStore = useAccountStore();
const toastStore = useToastStore();
const connectionStore = useConnectionStore();
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
    const client = await connectionStore.getClientById(state.id);

    console.log('checkClient client.connected:', client.connected);

    if (client) {
        const status = client.connected ? 'online' : 'offline';
        await accountStore.changeStatus(state.id, status);
    } else {
        await accountStore.changeStatus(state.id, 'offline');
    }
}


accountStore.$onAction(({ name, after }) => {
    after((result) => {
        if (name === 'changeStatus' && result.id === state.id) {
            state.status = result.status;
            state.isConnect = result.status !== 'offline';
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
    try {
        startConnectAccount();
    } catch (error) {
        console.error(error);
        state.isConnect = !state.isConnect;
        accountStore.changeStatus(state.id, 'error');
    }
}

async function onClickDisconnect() {
    const client = await connectionStore.getClientById(state.id);
    await client?.disconnect();
    await client?.destroy();
    client.session.save();
    state.isConnect = !state.isConnect;
    await accountStore.changeStatus(state.id, 'offline');
    connectionStore.setConnection(state.id, {
        client: null,
        account: state.id,
    });
}

async function startConnectAccount() {
    const client = await connectionStore.getClientById(state.id);
    console.log('startConnectAccount connection', client);
    await client?.connect();

    try {
        if (client && await client.checkAuthorization()) {
            const result = await client.getDialogs();
            console.log('result 1', result); // prints the result
            await accountStore.changeStatus(state.id, 'online');
            await client.sendMessage('me', { message: 'Hello! if 1' });
        } else {
            // client = await createClient(state.apiId, state.apiHash);
            console.log('new client', client);
            await client.start({
                phoneNumber: state.phoneNumber,
                password: async () => prompt('password!'),
                phoneCode: async () => {
                    const res = prompt('code!');
                    console.log(res);
                    if (res === null) {
                        await client.destroy();
                    }
                    return res;
                },
                onError: (err) => console.log(err),
            });
            client.session.save();
            // storeSession.save();
            // await storeSession.load();
            // console.log('storeSession', storeSession);
            // console.log('storeSession authKey', storeSession.authKey);
            connectionStore.setConnection(state.id, {
                client,
                account: state.id,
            });
            toastStore.addToast('ok', LOC_TOAST_SUCCESS_CREATE_CLIENT);
            await accountStore.changeStatus(state.id, 'online');
            console.log(client.disconnected);
            console.log(client.connected);
            const result = await client.getDialogs();
            console.log('result 2', result); // prints the result
            await client.sendMessage('me', { message: 'Hello!' });
            console.log(client.connected);
        }
    } catch (error) {
        console.error(error);
        await client.destroy();
        await accountStore.changeStatus(state.id, 'error');
    }
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

async function check() {
    const client = await connectionStore.getClientById(state.id);
    console.log('check client', client);
    try {
        await client.sendMessage('me', { message: 'Hello! check' });
        client.session.save();
    } catch (e) {
        console.error(e);
    }
}
</script>

<template>
    <div class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus v-bind="{ status: state.status }" />
            <button @click="check" class="button">
                >
                check
            </button>
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
