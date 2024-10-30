<script setup>
import { defineProps, reactive, onBeforeMount } from 'vue';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import useConnectionStore from '@/store/connection.js';
import { Api } from 'telegram';
import { auth } from 'telegram/tl/api.js';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import Confirm from '@/components/modal/Confirm.vue';

const accountStore = useAccountStore();
const toastStore = useToastStore();
const connectionStore = useConnectionStore();
const props = defineProps({
    account: String,
});
const accountData = accountStore.getById(props.account);
const LOC_TOAST_VALID_ERROR = 'Ошибка данных. Проверьте поля аккаунта';
const LOC_TOAST_CONNECT_ERROR = 'Ошибка подключения';
const LOC_TOAST_SUCCESS_CREATE_CLIENT = 'Успех - Клиент создан';

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
let resolveConfirmPromise;

onBeforeMount(async () => {
    await checkClient();
});

async function checkClient() {
    const client = await connectionStore.getClientByAccountId(state.id);

    console.log('checkClient client.connected:', client.connected, client.disconnected);

    try {
        if (client) {
            let status = 'offline';
            // check 1
            if (client.connected && await client.checkAuthorization()) {
                status = 'online';
            }
            // check 2 try to connect and auth
            const connectResult = await client.connect();
            console.log('checkClient connectResult', connectResult);
            const authResult = await client.checkAuthorization();
            console.log('checkClient authResult', authResult);
            if (connectResult && authResult) {
                status = 'online';
            }

            await accountStore.changeStatus(state.id, status);
        } else {
            await accountStore.changeStatus(state.id, 'offline');
        }
    } catch (error) {
        console.error('checkClient catch:', error);
    }
}

accountStore.$onAction(({ name, after }) => {
    after((result) => {
        if (name === 'changeStatus' && result.id === state.id) {
            state.status = result.status;
            state.isConnect = result.status !== 'offline';
            state.modalPopupInfoMessage = result.errorMessage;
        }
    });
});

function onClickSave() {
    state.isEdit = !state.isEdit;
    const newStateAccount = { ...state };
    delete newStateAccount.isEdit;
    delete newStateAccount.isConnect;
    delete newStateAccount.modalPopupInfoMessage;
    delete newStateAccount.isModalPopupInfoVisible;
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
    const client = await connectionStore.getClientByAccountId(state.id);
    const resultLogout = await client.invoke(
        new Api.auth.LogOut(),
    );
    console.log('logout --->', resultLogout);
    await client?.disconnect();
    await client?.session.delete();
    await client?.destroy();
    state.isConnect = !state.isConnect;
    await accountStore.changeStatus(state.id, 'offline');
    connectionStore.setClient(null);
}

async function startConnectAccount() {
    const client = await connectionStore.getClientByAccountId(state.id);
    await client.session.load();
    console.log('startConnectAccount connection', client);


    try {
        if (client.disconnect === true && client.connect === undefined) {
            const resConnect = await client?.connect();
            console.log('try connect:', resConnect);
        }

        const authResult = await client.checkAuthorization();
        console.log('check authorization:', authResult);
        if (authResult) {
            const result = await client.getDialogs();
            console.log('result 1 dialog after auth', result); // prints the result
            await accountStore.changeStatus(state.id, 'online');
        } else {
            console.log('create new connect');
            await client.start({
                phoneNumber: state.phoneNumber,
                password: async () => prompt('password!'),
                phoneCode: async () => {
                    const res  = await showConfirm();
                    if (res)
                    {
                        return res;
                    }

                    if(res === false)
                    {
                        location.reload();
                    }
                },
                onError: async (err) => {
                    console.log('start onError', err)
                    await accountStore.changeStatus(state.id, 'error', prepareErrorMessage(err));
                    state.isConnect = !state.isConnect;
                    toastStore.addToast('error', err.message);
                }
            });

            client.session.save();
            connectionStore.setClient(client);
            toastStore.addToast('ok', LOC_TOAST_SUCCESS_CREATE_CLIENT);
            await accountStore.changeStatus(state.id, 'online');
            const result = await client.getDialogs();
            console.log('result 2 dialog after new connect', result); // prints the result
            await client.sendMessage('me', { message: 'Hello! Comanaso connected.' });
        }
    } catch (error) {
        console.error('start connection catch:', error);
        await client?.session.delete();
        await client?.disconnect();
        await client.destroy();
        connectionStore.setClient(null);
        await accountStore.changeStatus(state.id, 'error', prepareErrorMessage(error));
        state.isConnect = !state.isConnect;
        toastStore.addToast('error', LOC_TOAST_CONNECT_ERROR);
    }
}

function prepareErrorMessage(error) {
    let errorObj = { title: '', desc: '' };
    errorObj.title = `Ошибка подключения - ${error?.errorMessage} ${error.code}`;
    errorObj.desc = `сообщение - ${error.message}`;

    return errorObj;
}

function prepareDetailMessage() {
    let messageObj = { title: '', desc: '' };
    if(state.isConnect)
    {
        messageObj.title = 'Клиент создан и подключен';
        messageObj.desc = 'Можно выполнять запросы. После окончания сессии не забудь отключиться!';
    }
    else {
        messageObj.title = `Клиент создан, но не подключен`;
        messageObj.desc = 'Возможно авторизация уже пройдена, попробуй подключиться снова';
    }

    return messageObj;
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
    if(state.modalPopupInfoMessage === null)
    {
        state.modalPopupInfoMessage = prepareDetailMessage();
    }

    state.isModalPopupInfoVisible = true;

    // const client = await connectionStore.getClientByAccountId(state.id);
    // console.log('check client', client);
    // try {
    //     // await client.sendMessage('me', { message: 'Hello! check' });
    //     // client.session.save();
    //     const result = await client.invoke(
    //         new Api.account.GetAuthorizations(),
    //     );
    //     console.log('result check GetAuthorizations', result);
        // const currentSession = result.authorizations.find((auth) => auth.current)
        // const currentSession = result.authorizations[1]
        // console.log('currentSession', currentSession);
        // console.log('currentSession', currentSession.hash);

        // const resultReset = await client.invoke(
        //     new Api.account.ResetAuthorization({hash: currentSession.hash }),
        // );
        // console.log('result resultReset', resultReset);
        // const resultLogout = await client.invoke(
        //     new Api.auth.LogOut(),
        // );
        // console.log('result resultLogout', resultLogout);

        // const res = await client.checkAuthorization()
        // console.log('result res', res);
        // const result2 = await client.invoke(
        //     new Api.account.GetAuthorizations(),
        // );
        // console.log('result result2', result2)
    //
    // } catch (e) {
    //     console.error(e);
    // }
}

function showConfirm(message) {
    state.modalConfirmMessage = message || 'Введите код для входа в Telegram';
    state.isModalConfirmVisible = true;

    return new Promise((resolve) => {
        resolveConfirmPromise = resolve;
    });
}

function handleConfirm(inputValue) {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(inputValue);
}

function handleCancel() {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(false);
}
</script>

<template>
    <div class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus v-bind="{ status: state.status }" />
            <button @click="check" class="button-detail">
                подробности
            </button>
            <DetailPopup :message="state.modalPopupInfoMessage" :isVisible="state.isModalPopupInfoVisible" @close="state.isModalPopupInfoVisible = false" />
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
                :isVisible="state.isModalConfirmVisible"
                @confirm="handleConfirm"
                @cancel="handleCancel"
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

.button-detail {
    background-color: #b6b3b3;
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
