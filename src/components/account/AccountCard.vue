<script setup>
import { defineProps, reactive, computed, watch } from 'vue';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import Confirm from '@/components/modal/Confirm.vue';
import FieldInfoButton from '@/components/common/FieldInfoButton.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import { accountService } from '@/services/account.service.js';
import { ACCOUNT_FIELD_DESCRIPTIONS } from '@/constants/fieldDescriptions.js';

const accountStore = useAccountStore();
const toastStore = useToastStore();

const props = defineProps({
    accountId: {
        type: Number,
        required: true,
    },
});

const LOC_TOAST_VALID_ERROR = 'Ошибка данных. Проверьте поля аккаунта';
const LOC_TOAST_CONNECT_ERROR = 'Ошибка подключения';
const LOC_TOAST_SUCCESS_CONNECT = 'Аккаунт успешно подключен!';
const LOC_TOAST_SUCCESS_DISCONNECT = 'Аккаунт отключен';
const LOC_TOAST_SUCCESS_UPDATE = 'Данные аккаунта обновлены';
const LOC_TOAST_SUCCESS_DELETE = 'Аккаунт удален';
const LOC_TOAST_SUCCESS_CLOSE_SESSION = 'Сессия закрыта';

// Используем computed для получения актуальных данных аккаунта из store
const accountData = computed(() => accountStore.getById(props.accountId));

// Проверка существования аккаунта
const accountExists = computed(() => accountData.value !== null);

// Computed свойства из store
const isConnect = computed(() => accountData.value?.status === 'online');
const isError = computed(() => accountData.value?.status === 'error');

// Локальное состояние только для UI
const uiState = reactive({
    isEdit: false,
    isModalPopupInfoVisible: false,
    isModalConfirmVisible: false,
    isModalConfirmDeleteVisible: false,
    isConnecting: false, // Флаг процесса подключения
    isDisconnecting: false, // Флаг процесса отключения
    isSaving: false, // Флаг процесса сохранения
    isDeleting: false, // Флаг процесса удаления
    modalConfirmMessage: null,
    modalConfirmDeleteMessage: null,
    modalPopupInfoMessage: null,
});

// Общий флаг загрузки для блокировки всех действий
const isLoading = computed(
    () =>
        uiState.isConnecting ||
        uiState.isDisconnecting ||
        uiState.isSaving ||
        uiState.isDeleting
);

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
    if (isLoading.value) return;

    uiState.isSaving = true;
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
        uiState.isSaving = false;
    }
}

function onClickEdit() {
    uiState.isEdit = !uiState.isEdit;
}

async function onClickDelete() {
    if (isLoading.value) return;

    // Показываем окно подтверждения
    const confirmed = await showDeleteConfirm();
    if (!confirmed) return;

    uiState.isDeleting = true;
    try {
        await accountStore.deleteAccountData(accountData.value.id);
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_DELETE);
    } catch (error) {
        console.error('Delete account error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка удаления аккаунта');
    } finally {
        uiState.isDeleting = false;
    }
}

/**
 * Вспомогательная функция для безопасного отключения аккаунта
 * Используется при отмене подключения или ошибках
 */
async function safeDisconnect(accountId) {
    try {
        await accountService.disconnectAccount(accountId);
        console.log(`Account ${accountId} disconnected successfully`);
    } catch (disconnectError) {
        console.warn('Disconnect error (non-critical):', disconnectError);
    }
}

async function onClickStart() {
    if (isLoading.value) return;

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

    uiState.isConnecting = true;

    try {
        // Шаг 1: Начать подключение
        const connectResult = await accountService.connectAccount(accountData.value.id);
        if (connectResult.status === 'code_required') {
            // Шаг 2: Запросить код у пользователя
            const code = await showConfirm('Введите код из Telegram');
            if (!code) {
                await safeDisconnect(accountData.value.id);
                await accountStore.changeStatus(accountData.value.id, 'offline');
                return;
            }

            // Шаг 3: Отправить код
            const verifyResult = await accountService.verifyCode(
                accountData.value.id,
                code,
                connectResult.phoneCodeHash
            );

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
                    // Ошибка при вводе пароля 2FA - отключаем и устанавливаем статус error
                    await safeDisconnect(accountData.value.id);

                    await accountStore.changeStatus(accountData.value.id, 'error', {
                        title: 'Ошибка 2FA',
                        desc: err.userMessage || err.message,
                    });
                    toastStore.addToast('error', err.userMessage || 'Ошибка 2FA');
                }
            } else {
                // Пользователь отменил ввод пароля 2FA - отключаем
                await safeDisconnect(accountData.value.id);
                await accountStore.changeStatus(accountData.value.id, 'offline');
            }
        } else {
            // Любая другая ошибка при подключении - отключаем и устанавливаем статус error
            await safeDisconnect(accountData.value.id);

            await accountStore.changeStatus(accountData.value.id, 'error', {
                title: 'Ошибка подключения',
                desc: error.userMessage || error.message,
            });
            toastStore.addToast('error', error.userMessage || LOC_TOAST_CONNECT_ERROR);
        }
    } finally {
        uiState.isConnecting = false;
    }
}

async function onClickDisconnect() {
    if (isLoading.value) return;

    uiState.isDisconnecting = true;
    try {
        await accountService.logoutAccount(accountData.value.id);
        await accountStore.changeStatus(accountData.value.id, 'offline');
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_DISCONNECT);
    } catch (error) {
        console.error('Disconnect error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка отключения');
    } finally {
        uiState.isDisconnecting = false;
    }
}

async function onClickCloseSession() {
    if (isLoading.value) return;

    uiState.isDisconnecting = true;
    try {
        await safeDisconnect(accountData.value.id);
        await accountStore.changeStatus(accountData.value.id, 'offline');
        toastStore.addToast('ok', LOC_TOAST_SUCCESS_CLOSE_SESSION);
    } catch (error) {
        console.error('Close session error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка закрытия сессии');
    } finally {
        uiState.isDisconnecting = false;
    }
}

function prepareDetailMessage() {
    const status = accountData.value?.status || 'offline';
    let messageObj = { title: '', desc: '' };

    switch (status) {
        case 'online':
            messageObj.title = 'Аккаунт подключен';
            messageObj.desc =
                'Telegram-сессия активна. Данные аккаунта (диалоги, информация о пользователе, папки) загружены и доступны для аналитики.';
            break;

        case 'offline':
            messageObj.title = 'Аккаунт отключен';
            messageObj.desc =
                'Telegram-сессия не установлена. Нажмите "Старт!" для подключения и загрузки данных аккаунта для аналитики.';
            break;

        case 'error':
            messageObj.title = 'Ошибка подключения';
            messageObj.desc =
                'Не удалось установить соединение с Telegram. Проверьте корректность данных аккаунта (API ID, API Hash, номер телефона) и попробуйте снова.';
            break;

        case 'disconnect':
            messageObj.title = 'Отключение...';
            messageObj.desc =
                'Выполняется безопасное завершение Telegram-сессии. Пожалуйста, подождите.';
            break;

        default:
            messageObj.title = 'Неизвестный статус';
            messageObj.desc = 'Статус аккаунта не определен. Обратитесь к администратору.';
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

// Хранилище для активного промиса (для ввода кода)
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

// Хранилище для промиса подтверждения удаления
const deleteConfirmPromiseStore = { resolve: null };

function showDeleteConfirm() {
    const accountName = accountData.value?.name || 'этот аккаунт';
    uiState.modalConfirmDeleteMessage = `Вы уверены, что хотите удалить "${accountName}"?\n\nЭто действие необратимо.`;
    uiState.isModalConfirmDeleteVisible = true;

    return new Promise((resolve) => {
        deleteConfirmPromiseStore.resolve = resolve;
    });
}

function handleDeleteConfirmOk() {
    uiState.isModalConfirmDeleteVisible = false;
    if (deleteConfirmPromiseStore.resolve) {
        deleteConfirmPromiseStore.resolve(true);
        deleteConfirmPromiseStore.resolve = null;
    }
}

function handleDeleteConfirmCancel() {
    uiState.isModalConfirmDeleteVisible = false;
    if (deleteConfirmPromiseStore.resolve) {
        deleteConfirmPromiseStore.resolve(false);
        deleteConfirmPromiseStore.resolve = null;
    }
}
</script>

<template>
    <!-- Не рендерим компонент если аккаунт не существует -->
    <div v-if="accountExists" class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus v-bind="{ status: accountData?.status || 'offline' }" />
            <button class="button-detail" :disabled="isLoading" @click="showDetail">
                подробности
            </button>
            <DetailPopup
                :message="uiState.modalPopupInfoMessage"
                :is-visible="uiState.isModalPopupInfoVisible"
                @close="uiState.isModalPopupInfoVisible = false"
            />
        </div>
        <div class="product-details">
            <!-- Поля ввода с подсказками -->
            <div class="input-group">
                <div class="input-wrapper">
                    <input
                        :value="uiState.isEdit ? editableData.name : accountData.name"
                        type="text"
                        :disabled="!uiState.isEdit || isLoading"
                        placeholder="Название"
                        @input="uiState.isEdit && (editableData.name = $event.target.value)"
                    />
                    <FieldInfoButton
                        :title="ACCOUNT_FIELD_DESCRIPTIONS.name.title"
                        :description="ACCOUNT_FIELD_DESCRIPTIONS.name.description"
                    />
                </div>
            </div>

            <div class="input-group">
                <div class="input-wrapper">
                    <input
                        :value="uiState.isEdit ? editableData.apiId : accountData.apiId"
                        placeholder="App api_id"
                        :disabled="!uiState.isEdit || isLoading"
                        type="text"
                        @input="uiState.isEdit && (editableData.apiId = $event.target.value)"
                    />
                    <FieldInfoButton
                        :title="ACCOUNT_FIELD_DESCRIPTIONS.apiId.title"
                        :description="ACCOUNT_FIELD_DESCRIPTIONS.apiId.description"
                    />
                </div>
            </div>

            <div class="input-group">
                <div class="input-wrapper">
                    <input
                        :value="uiState.isEdit ? editableData.apiHash : accountData.apiHash"
                        type="text"
                        :disabled="!uiState.isEdit || isLoading"
                        placeholder="App api_hash"
                        @input="uiState.isEdit && (editableData.apiHash = $event.target.value)"
                    />
                    <FieldInfoButton
                        :title="ACCOUNT_FIELD_DESCRIPTIONS.apiHash.title"
                        :description="ACCOUNT_FIELD_DESCRIPTIONS.apiHash.description"
                    />
                </div>
            </div>

            <div class="input-group">
                <div class="input-wrapper">
                    <input
                        :value="uiState.isEdit ? editableData.phoneNumber : accountData.phoneNumber"
                        type="text"
                        :disabled="!uiState.isEdit || isLoading"
                        placeholder="Номер телефона"
                        @input="uiState.isEdit && (editableData.phoneNumber = $event.target.value)"
                    />
                    <FieldInfoButton
                        :title="ACCOUNT_FIELD_DESCRIPTIONS.phoneNumber.title"
                        :description="ACCOUNT_FIELD_DESCRIPTIONS.phoneNumber.description"
                    />
                </div>
            </div>

            <div class="buttons">
                <button v-if="uiState.isEdit" :disabled="isLoading" @click="onClickSave">
                    {{ uiState.isSaving ? 'Сохранение...' : 'Сохранить' }}
                </button>
                <button
                    v-if="!uiState.isEdit"
                    :disabled="isConnect || isError || isLoading"
                    @click="onClickEdit"
                >
                    Редактировать
                </button>
                <button
                    v-if="uiState.isEdit"
                    :disabled="isConnect || isLoading"
                    class="button-cancel"
                    @click="onClickDelete"
                >
                    {{ uiState.isDeleting ? 'Удаление...' : 'Удалить аккаунт' }}
                </button>
                <button
                    v-if="!uiState.isEdit && !isConnect && !isError"
                    :disabled="isLoading"
                    @click="onClickStart"
                >
                    {{ uiState.isConnecting ? 'Подключение...' : 'Старт!' }}
                </button>
                <button
                    v-if="!uiState.isEdit && isConnect"
                    :disabled="isLoading"
                    class="button-cancel"
                    @click="onClickDisconnect"
                >
                    {{ uiState.isDisconnecting ? 'Отключение...' : 'Отключить' }}
                </button>
                <button
                    v-if="!uiState.isEdit && isError"
                    :disabled="isLoading"
                    class="button-cancel"
                    @click="onClickCloseSession"
                >
                    {{ uiState.isDisconnecting ? 'Закрытие...' : 'Закрыть сессию' }}
                </button>
            </div>

            <!-- Модальное окно для ввода кода Telegram -->
            <Confirm
                :message="uiState.modalConfirmMessage"
                :is-visible="uiState.isModalConfirmVisible"
                :is-input="true"
                @confirm="handleConfirmOk"
                @cancel="handleConfirmCancel"
            />

            <!-- Модальное окно для подтверждения удаления -->
            <Confirm
                :message="uiState.modalConfirmDeleteMessage"
                :is-visible="uiState.isModalConfirmDeleteVisible"
                :is-input="false"
                @confirm="handleDeleteConfirmOk"
                @cancel="handleDeleteConfirmCancel"
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

/* Группы полей ввода */
.input-group {
    margin-bottom: 10px;
}

.input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.input-wrapper input {
    flex: 1;
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
    margin-top: 10px;
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
