<script setup>
import { defineProps, reactive, computed, watch } from 'vue';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import Confirm from '@/components/modal/Confirm.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import { accountService } from '@/services/account.service.js';

const accountStore = useAccountStore();
const toastStore = useToastStore();

const props = defineProps({
    accountId: {
        type: String,
        required: true,
    },
});

const LOC_TOAST_VALID_ERROR = 'Ошибка данных. Проверьте поля аккаунта';
const LOC_TOAST_CONNECT_ERROR = 'Ошибка подключения';
const LOC_TOAST_SUCCESS_CREATE_CLIENT = 'Успех - Клиент подключен к аккаунту!';
const LOC_TOAST_SUCCESS_CONNECT = 'Аккаунт успешно подключен!';
const LOC_TOAST_SUCCESS_DISCONNECT = 'Аккаунт отключен';
const LOC_TOAST_SUCCESS_UPDATE = 'Данные аккаунта обновлены';
const LOC_TOAST_SUCCESS_DELETE = 'Аккаунт удален';

// Используем computed для получения актуальных данных аккаунта из store
const accountData = computed(() => accountStore.getById(props.accountId));

// Проверка существования аккаунта
const accountExists = computed(() => accountData.value !== null);

// Computed свойства из store
const isConnect = computed(() => accountData.value?.status !== 'offline');

// Локальное состояние только для UI
const uiState = reactive({
    isEdit: false,
    isModalPopupInfoVisible: false,
    isModalConfirmVisible: false,
    isLoading: false,
    modalConfirmMessage: null,
    modalPopupInfoMessage: null,
});

// Редактируемые поля (только для режима редактирования)
const editableData = reactive({
    name: '',
    apiId: '',
    apiHash: '',
    phoneNumber: '',
});

// Инициализация редактируемых полей при открытии режима редактирования
watch(
    () => uiState.isEdit,
    (isEdit) => {
        if (isEdit && accountData.value) {
            Object.assign(editableData, {
                name: accountData.value.name,
                apiId: accountData.value.apiId,
                apiHash: accountData.value.apiHash,
                phoneNumber: accountData.value.phoneNumber,
            });
        }
    }
);

async function onClickSave() {
    if (uiState.isLoading) return;

    uiState.isLoading = true;
    try {
        await accountStore.updateAccountData({
            id: accountData.value.id,
            name: editableData.name,
            apiId: editableData.apiId,
            apiHash: editableData.apiHash,
            phoneNumber: editableData.phoneNumber,
        });

        uiState.isEdit = false;
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_UPDATE);
    } catch (error) {
        console.error('Update account error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка обновления аккаунта');
    } finally {
        uiState.isLoading = false;
    }
}

function onClickEdit() {
    uiState.isEdit = !uiState.isEdit;
}

async function onClickDelete() {
    if (uiState.isLoading) return;

    uiState.isLoading = true;
    try {
        await accountStore.deleteAccountData(accountData.value.id);
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_DELETE);
    } catch (error) {
        console.error('Delete account error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка удаления аккаунта');
    } finally {
        uiState.isLoading = false;
    }
}

async function onClickStart() {
    console.log('onClickStart', uiState);
    if (uiState.isLoading) return;

    if (
        !isValidConnectData({
            apiId: accountData.value.apiId,
            apiHash: accountData.value.apiHash,
            phoneNumber: accountData.value.phoneNumber,
        })
    ) {
        toastStore.addToast('error', LOC_TOAST_VALID_ERROR);
        return;
    }

    uiState.isLoading = true;
    await accountStore.changeStatus(accountData.value.id, 'connect');

    try {
        // Шаг 1: Начать подключение
        const connectResult = await accountService.connectAccount(accountData.value.id);
        console.log('connectResult',connectResult);
        if (connectResult.status === 'code_required') {
            // Шаг 2: Запросить код у пользователя
            const code = await showConfirm('Введите код из Telegram');
            console.log('code',code);
            if (!code) {
                await accountStore.changeStatus(accountData.value.id, 'offline');
                return;
            }

            // Шаг 3: Отправить код
            const verifyResult = await accountService.verifyCode(
                accountData.value.id,
                code,
                connectResult.phoneCodeHash
            );
            console.log('verifyResult',verifyResult);
            if (verifyResult.status === 'connected') {
                await accountStore.changeStatus(accountData.value.id, 'online');
                toastStore.addToast('ok', LOC_TOAST_SUCCESS_CONNECT);
            }
        }
    } catch (error) {
        console.error('Connection error:', error);

        // Если требуется 2FA
        if (error.error === 'PASSWORD_REQUIRED') {
            const passwordHint = error.passwordHint ? `Подсказка: ${error.passwordHint}` : '';
            const password = await showConfirm(`Введите пароль 2FA\n${passwordHint}`);

            if (password) {
                try {
                    await accountService.verifyPassword(accountData.value.id, password);
                    await accountStore.changeStatus(accountData.value.id, 'online');
                    toastStore.addToast('ok', LOC_TOAST_SUCCESS_CONNECT);
                } catch (err) {
                    await accountStore.changeStatus(accountData.value.id, 'error', {
                        title: 'Ошибка 2FA',
                        desc: err.userMessage || err.message,
                    });
                    toastStore.addToast('error', err.userMessage || 'Ошибка 2FA');
                }
            } else {
                await accountStore.changeStatus(accountData.value.id, 'offline');
            }
        } else {
            await accountStore.changeStatus(accountData.value.id, 'error', {
                title: 'Ошибка подключения',
                desc: error.userMessage || error.message,
            });
            toastStore.addToast('error', error.userMessage || LOC_TOAST_CONNECT_ERROR);
        }
    } finally {
        uiState.isLoading = false;
    }
}

async function onClickDisconnect() {
    console.log('onClickDisconnect', uiState);
    if (uiState.isLoading) return;

    uiState.isLoading = true;
    try {
        await accountService.logoutAccount(accountData.value.id);
        await accountStore.changeStatus(accountData.value.id, 'offline');
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_DISCONNECT);
    } catch (error) {
        console.error('Disconnect error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка отключения');
    } finally {
        uiState.isLoading = false;
    }
}

function prepareDetailMessage() {
    console.log('prepareDetailMessage', accountData.value);
    const status = accountData.value?.status || 'offline';
    let messageObj = { title: '', desc: '' };

    switch (status) {
        case 'online':
            messageObj.title = 'Аккаунт активен';
            messageObj.desc =
                'Telegram-сессия установлена. Можете отправлять сообщения, приглашать пользователей в группы, выполнять массовые рассылки.';
            break;

        case 'connect':
            messageObj.title = 'Идет подключение';
            messageObj.desc =
                'Выполняется авторизация в Telegram. Дождитесь завершения процесса или введите код подтверждения.';
            break;

        case 'error': {
            const errorInfo = accountData.value?.errorMessage;
            messageObj.title = errorInfo?.title || 'Ошибка подключения';
            messageObj.desc =
                errorInfo?.desc ||
                'Не удалось установить соединение. Проверьте API-ключи и номер телефона, затем попробуйте снова.';
            break;
        }

        case 'offline':
        default:
            messageObj.title = 'Требуется подключение';
            messageObj.desc =
                'Для работы с Telegram необходимо авторизоваться. Нажмите "Старт!" и следуйте инструкциям. Вам потребуется код из SMS или Telegram-приложения.';
            break;
    }

    return messageObj;
}

function isValidConnectData(fields) {
    return Object.values(fields).every(
        (value) => value && (typeof value !== 'string' || value.length > 0)
    );
}

async function showDetail() {
    uiState.modalPopupInfoMessage = prepareDetailMessage();

    uiState.isModalPopupInfoVisible = true;
}

// Хранилище для активного промиса
const confirmPromiseStore = { resolve: null };

function showConfirm(message) {
    uiState.modalConfirmMessage = message || 'Введите код для входа в Telegram';
    uiState.isModalConfirmVisible = true;

    return new Promise((resolve) => {
        confirmPromiseStore.resolve = resolve;
    });
}

function handleConfirmOk(inputValue) {
    uiState.isModalConfirmVisible = false;
    if (confirmPromiseStore.resolve) {
        confirmPromiseStore.resolve(inputValue);
        confirmPromiseStore.resolve = null;
    }
}

function handleConfirmCancel() {
    uiState.isModalConfirmVisible = false;
    if (confirmPromiseStore.resolve) {
        confirmPromiseStore.resolve(false);
        confirmPromiseStore.resolve = null;
    }
}
</script>

<template>
    <!-- Не рендерим компонент если аккаунт не существует -->
    <div v-if="accountExists" class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus v-bind="{ status: accountData?.status || 'offline' }" />
            <button class="button-detail" :disabled="uiState.isLoading" @click="showDetail">
                подробности
            </button>
            <DetailPopup
                :message="uiState.modalPopupInfoMessage"
                :is-visible="uiState.isModalPopupInfoVisible"
                @close="uiState.isModalPopupInfoVisible = false"
            />
        </div>
        <div class="product-details">
            <input
                :value="uiState.isEdit ? editableData.name : accountData.name"
                type="text"
                :disabled="!uiState.isEdit || uiState.isLoading"
                placeholder="Название"
                @input="uiState.isEdit && (editableData.name = $event.target.value)"
            />
            <input
                :value="uiState.isEdit ? editableData.apiId : accountData.apiId"
                placeholder="App api_id"
                :disabled="!uiState.isEdit || uiState.isLoading"
                type="text"
                @input="uiState.isEdit && (editableData.apiId = $event.target.value)"
            />
            <input
                :value="uiState.isEdit ? editableData.apiHash : accountData.apiHash"
                type="text"
                :disabled="!uiState.isEdit || uiState.isLoading"
                placeholder="App api_hash"
                @input="uiState.isEdit && (editableData.apiHash = $event.target.value)"
            />
            <input
                :value="uiState.isEdit ? editableData.phoneNumber : accountData.phoneNumber"
                type="text"
                :disabled="!uiState.isEdit || uiState.isLoading"
                placeholder="Номер телефона"
                @input="uiState.isEdit && (editableData.phoneNumber = $event.target.value)"
            />
            <div class="buttons">
                <button v-if="uiState.isEdit" :disabled="uiState.isLoading" @click="onClickSave">
                    {{ uiState.isLoading ? 'Сохранение...' : 'Сохранить' }}
                </button>
                <button
                    v-if="!uiState.isEdit"
                    :disabled="isConnect || uiState.isLoading"
                    @click="onClickEdit"
                >
                    Редактировать
                </button>
                <button
                    v-if="uiState.isEdit"
                    :disabled="isConnect || uiState.isLoading"
                    class="button-cancel"
                    @click="onClickDelete"
                >
                    {{ uiState.isLoading ? 'Удаление...' : 'Удалить аккаунт' }}
                </button>
                <button
                    v-if="!uiState.isEdit && !isConnect"
                    :disabled="isConnect || uiState.isLoading"
                    @click="onClickStart"
                >
                    {{ uiState.isLoading ? 'Подключение...' : 'Старт!' }}
                </button>
                <button
                    v-if="!uiState.isEdit && isConnect"
                    :disabled="!isConnect || uiState.isLoading"
                    class="button-cancel"
                    @click="onClickDisconnect"
                >
                    {{ uiState.isLoading ? 'Отключение...' : 'Отключить' }}
                </button>
            </div>
            <Confirm
                :message="uiState.modalConfirmMessage"
                :is-visible="uiState.isModalConfirmVisible"
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
