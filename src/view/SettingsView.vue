<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Confirm from '@/components/modal/Confirm.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import { authService } from '@/services/auth.service.js';
import { logoutAllStore } from '@/store/storeController.js';
import { useToastStore } from '@/store/toast.js';
import { useAccountStore } from '@/store/account.js';
import { useAuthStore } from '@/store/auth.js';
import { validateUsername, validateEmail, validatePassword } from '@/utils/validators.js';

const router = useRouter();
const toastStore = useToastStore();
const accountStore = useAccountStore();
const authStore = useAuthStore();

const showDeleteConfirm = ref(false);
const showActiveAccountsWarning = ref(false);
const isDeleting = ref(false);
const isSavingPrivacy = ref(false);
const isSavingAccount = ref(false);
const isLoadingSettings = ref(true);

// Локальные копии настроек приватности для редактирования
const localPrivacySettings = ref({
    shareUserName: true,
    shareNickname: true,
    shareMessageText: true,
    shareDialogTitles: true,
});

// Локальные копии основных данных учетной записи
const originalAccountData = ref({
    username: '',
    email: '',
});

const localAccountData = ref({
    username: '',
    email: '',
    password: '', // Новый пароль (опционально)
});

// Ошибки валидации для полей учетной записи
const validationErrors = ref({
    username: '',
    email: '',
    password: '',
});

// Загрузка данных пользователя с сервера
const loadUserSettings = async () => {
    isLoadingSettings.value = true;
    try {
        const userData = await authService.getCurrentUser();

        // Сохраняем данные пользователя в store
        authStore.setUser(userData);

        // Обновляем локальные настройки приватности
        if (userData.settings) {
            localPrivacySettings.value = { ...userData.settings };
        }

        // Обновляем основные данные учетной записи
        originalAccountData.value = {
            username: userData.username || '',
            email: userData.email || '',
        };

        localAccountData.value = {
            username: userData.username || '',
            email: userData.email || '',
            password: '',
        };
    } catch (error) {
        console.error('Load user settings error:', error);
        toastStore.addToast('error', error.userMessage || 'Не удалось загрузить настройки');
    } finally {
        isLoadingSettings.value = false;
    }
};

// Инициализация настроек приватности из store (запасной вариант)
const initPrivacySettings = () => {
    const settings = authStore.aiPrivacySettings;
    if (settings) {
        localPrivacySettings.value = { ...settings };
    }
};

// Инициализация основных данных учетной записи (отмена изменений)
const initAccountData = () => {
    localAccountData.value = {
        username: originalAccountData.value.username,
        email: originalAccountData.value.email,
        password: '',
    };
};

// Загружаем актуальные данные при монтировании компонента
onMounted(() => {
    loadUserSettings();
});

// Проверка наличия активных аккаунтов
const hasActiveAccounts = computed(() => {
    return accountStore.accounts.some(
        (account) => account.status === 'online' || account.status === 'connect'
    );
});

// Список активных аккаунтов для отображения
const activeAccountsList = computed(() => {
    return accountStore.accounts
        .filter((account) => account.status === 'online' || account.status === 'connect')
        .map((account) => `• ${account.name || account.phoneNumber}`)
        .join('\n');
});

// Проверка изменений в настройках приватности
const hasPrivacyChanges = computed(() => {
    const current = authStore.aiPrivacySettings;
    if (!current) return false;

    return (
        localPrivacySettings.value.shareUserName !== current.shareUserName ||
        localPrivacySettings.value.shareNickname !== current.shareNickname ||
        localPrivacySettings.value.shareMessageText !== current.shareMessageText ||
        localPrivacySettings.value.shareDialogTitles !== current.shareDialogTitles
    );
});

// Проверка изменений в основных данных учетной записи
const hasAccountChanges = computed(() => {
    return (
        localAccountData.value.username !== originalAccountData.value.username ||
        localAccountData.value.email !== originalAccountData.value.email ||
        localAccountData.value.password.length > 0
    );
});

// Сообщение для предупреждения об активных аккаунтах
const warningMessage = computed(() => ({
    title: 'Невозможно удалить учетную запись',
    desc: `Перед удалением учетной записи необходимо отключить все активные аккаунты.\n\nАктивные аккаунты:\n${activeAccountsList.value}\n\nПожалуйста, отключите их и повторите попытку.`,
}));

function openDeleteConfirm() {
    if (hasActiveAccounts.value) {
        showActiveAccountsWarning.value = true;
        return;
    }
    showDeleteConfirm.value = true;
}

function closeDeleteConfirm() {
    showDeleteConfirm.value = false;
}

function closeActiveAccountsWarning() {
    showActiveAccountsWarning.value = false;
}

async function handleDeleteAccount() {
    if (isDeleting.value) return;

    // Дополнительная проверка перед удалением
    if (hasActiveAccounts.value) {
        showDeleteConfirm.value = false;
        showActiveAccountsWarning.value = true;
        return;
    }

    isDeleting.value = true;

    try {
        await authService.deleteAccount();
        toastStore.addToast('ok', 'Учетная запись успешно удалена');

        // Очищаем все store и перенаправляем на страницу входа
        logoutAllStore();
        await router.push('/login');
    } catch (error) {
        console.error('Delete account error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка удаления учетной записи');
    } finally {
        isDeleting.value = false;
        showDeleteConfirm.value = false;
    }
}

async function savePrivacySettings() {
    if (isSavingPrivacy.value) return;

    isSavingPrivacy.value = true;

    try {
        // Отправляем только настройки приватности
        const updatedUser = await authService.updateAiPrivacySettings(localPrivacySettings.value);

        // Обновляем store с актуальными настройками
        if (updatedUser.settings) {
            authStore.setAiPrivacySettings(updatedUser.settings);
        }

        toastStore.addToast('ok', 'Настройки приватности сохранены');
    } catch (error) {
        console.error('Save privacy settings error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка сохранения настроек');
    } finally {
        isSavingPrivacy.value = false;
    }
}

function cancelPrivacyChanges() {
    initPrivacySettings();
}

async function saveAccountSettings() {
    if (isSavingAccount.value) return;

    // Сбрасываем предыдущие ошибки валидации
    validationErrors.value = {
        username: '',
        email: '',
        password: '',
    };

    // Валидация полей
    let hasValidationError = false;

    // Валидируем username, если он изменился
    if (localAccountData.value.username !== originalAccountData.value.username) {
        const usernameValidation = validateUsername(localAccountData.value.username);
        if (!usernameValidation.isValid) {
            validationErrors.value.username = usernameValidation.error;
            hasValidationError = true;
        }
    }

    // Валидируем email, если он изменился
    if (localAccountData.value.email !== originalAccountData.value.email) {
        const emailValidation = validateEmail(localAccountData.value.email);
        if (!emailValidation.isValid) {
            validationErrors.value.email = emailValidation.error;
            hasValidationError = true;
        }
    }

    // Валидируем пароль, если он заполнен (опциональная валидация)
    if (localAccountData.value.password.length > 0) {
        const passwordValidation = validatePassword(localAccountData.value.password, true);
        if (!passwordValidation.isValid) {
            validationErrors.value.password = passwordValidation.error;
            hasValidationError = true;
        }
    }

    // Если есть ошибки валидации, не отправляем запрос
    if (hasValidationError) {
        toastStore.addToast('error', 'Пожалуйста, исправьте ошибки в форме');
        return;
    }

    isSavingAccount.value = true;

    try {
        // Формируем объект с обновлениями (только измененные поля)
        const updates = {};

        if (localAccountData.value.username !== originalAccountData.value.username) {
            updates.username = localAccountData.value.username;
        }

        if (localAccountData.value.email !== originalAccountData.value.email) {
            updates.email = localAccountData.value.email;
        }

        if (localAccountData.value.password.length > 0) {
            updates.password = localAccountData.value.password;
        }

        // Проверяем, есть ли изменения
        if (Object.keys(updates).length === 0) {
            toastStore.addToast('info', 'Нет изменений для сохранения');
            return;
        }

        // Отправляем запрос на обновление
        const updatedUser = await authService.updateUserSettings(updates);

        // Обновляем исходные данные
        originalAccountData.value = {
            username: updatedUser.username || '',
            email: updatedUser.email || '',
        };

        // Обновляем данные пользователя в auth store
        authStore.setUser(updatedUser);

        // Очищаем поле пароля
        localAccountData.value.password = '';

        toastStore.addToast('ok', 'Данные учетной записи обновлены');
    } catch (error) {
        console.error('Save account settings error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка сохранения данных');
    } finally {
        isSavingAccount.value = false;
    }
}

function cancelAccountChanges() {
    initAccountData();
    // Сбрасываем ошибки валидации
    validationErrors.value = {
        username: '',
        email: '',
        password: '',
    };
}
</script>

<template>
    <div class="view-container">
        <h1>Настройки</h1>

        <!-- Индикатор загрузки -->
        <div v-if="isLoadingSettings" class="loading-container">
            <p>Загрузка настроек...</p>
        </div>

        <template v-else>
            <!-- Раздел: Настройки AI-анализа -->
            <section class="settings-section">
                <h2 class="section-title">Настройки AI-анализа</h2>
                <p class="section-description">
                    Управляйте данными, которые передаются для AI-анализа. Отключение некоторых
                    опций может снизить качество аналитики.
                </p>

                <div class="settings-list">
                    <!-- Имя профиля -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Имя профиля</h3>
                            <p class="setting-description">
                                Передавать имя и фамилию из профиля Telegram для персонализации
                                анализа
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input
                                v-model="localPrivacySettings.shareUserName"
                                type="checkbox"
                                :disabled="isSavingPrivacy"
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <!-- Username -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Username (@никнейм)</h3>
                            <p class="setting-description">
                                Передавать ваш @username для идентификации в анализе
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input
                                v-model="localPrivacySettings.shareNickname"
                                type="checkbox"
                                :disabled="isSavingPrivacy"
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <!-- Содержимое сообщений -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Содержимое сообщений</h3>
                            <p class="setting-description">
                                Передавать текст последних сообщений из диалогов для глубокого
                                анализа контекста
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input
                                v-model="localPrivacySettings.shareMessageText"
                                type="checkbox"
                                :disabled="isSavingPrivacy"
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <!-- Названия диалогов -->
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Названия диалогов</h3>
                            <p class="setting-description">
                                Передавать названия чатов и групп для анализа структуры общения
                            </p>
                        </div>
                        <label class="toggle-switch">
                            <input
                                v-model="localPrivacySettings.shareDialogTitles"
                                type="checkbox"
                                :disabled="isSavingPrivacy"
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Кнопки сохранения/отмены -->
                <div v-if="hasPrivacyChanges" class="privacy-actions">
                    <button
                        class="btn-cancel"
                        :disabled="isSavingPrivacy"
                        @click="cancelPrivacyChanges"
                    >
                        Отменить
                    </button>
                    <button
                        class="btn-save"
                        :disabled="isSavingPrivacy"
                        @click="savePrivacySettings"
                    >
                        {{ isSavingPrivacy ? 'Сохранение...' : 'Сохранить изменения' }}
                    </button>
                </div>
            </section>

            <!-- Раздел: Учетная запись -->
            <section class="settings-section">
                <h2 class="section-title">Учетная запись</h2>
                <p class="section-description">Управление основными данными вашей учетной записи</p>

                <!-- Форма редактирования данных учетной записи -->
                <div class="account-form">
                    <!-- Поле Username -->
                    <div class="form-group">
                        <label for="username" class="form-label">Имя пользователя</label>
                        <input
                            id="username"
                            v-model="localAccountData.username"
                            type="text"
                            class="form-input"
                            :class="{ 'input-error': validationErrors.username }"
                            placeholder="Введите имя пользователя"
                            :disabled="isSavingAccount"
                        />
                        <p v-if="validationErrors.username" class="form-error">
                            {{ validationErrors.username }}
                        </p>
                        <p v-else class="form-hint">3-100 символов</p>
                    </div>

                    <!-- Поле Email -->
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input
                            id="email"
                            v-model="localAccountData.email"
                            type="email"
                            class="form-input"
                            :class="{ 'input-error': validationErrors.email }"
                            placeholder="Введите email"
                            :disabled="isSavingAccount"
                        />
                        <p v-if="validationErrors.email" class="form-error">
                            {{ validationErrors.email }}
                        </p>
                        <p v-else class="form-hint">
                            Будет использоваться для восстановления доступа
                        </p>
                    </div>

                    <!-- Поле Password -->
                    <div class="form-group">
                        <label for="password" class="form-label">Новый пароль</label>
                        <input
                            id="password"
                            v-model="localAccountData.password"
                            type="password"
                            class="form-input"
                            :class="{ 'input-error': validationErrors.password }"
                            placeholder="Оставьте пустым, если не хотите менять"
                            :disabled="isSavingAccount"
                            autocomplete="new-password"
                        />
                        <p v-if="validationErrors.password" class="form-error">
                            {{ validationErrors.password }}
                        </p>
                        <p v-else class="form-hint">Заполните только если хотите изменить пароль</p>
                    </div>
                </div>

                <!-- Кнопки сохранения/отмены для основных данных -->
                <div v-if="hasAccountChanges" class="account-actions">
                    <button
                        class="btn-cancel"
                        :disabled="isSavingAccount"
                        @click="cancelAccountChanges"
                    >
                        Отменить
                    </button>
                    <button
                        class="btn-save"
                        :disabled="isSavingAccount"
                        @click="saveAccountSettings"
                    >
                        {{ isSavingAccount ? 'Сохранение...' : 'Сохранить изменения' }}
                    </button>
                </div>

                <!-- Зона удаления учетной записи -->
                <div class="danger-zone">
                    <h3 class="danger-title">Опасная зона</h3>
                    <div class="item-info">
                        <p class="item-description">
                            Безвозвратное удаление вашей учетной записи и всех связанных данных. Это
                            действие нельзя отменить.
                        </p>
                        <p v-if="hasActiveAccounts" class="warning-text">
                            ⚠️ Перед удалением необходимо отключить все активные аккаунты
                        </p>
                    </div>
                    <button class="btn-delete" :disabled="isDeleting" @click="openDeleteConfirm">
                        {{ isDeleting ? 'Удаление...' : 'Удалить учетную запись' }}
                    </button>
                </div>
            </section>
        </template>

        <!-- Модальное окно подтверждения удаления -->
        <Confirm
            :message="'Вы уверены, что хотите удалить свою учетную запись?\n\nВсе ваши данные будут безвозвратно удалены.'"
            :is-visible="showDeleteConfirm"
            :is-input="false"
            @confirm="handleDeleteAccount"
            @cancel="closeDeleteConfirm"
        />

        <!-- Модальное окно предупреждения об активных аккаунтах -->
        <DetailPopup
            :message="warningMessage"
            :is-visible="showActiveAccountsWarning"
            align="left"
            @close="closeActiveAccountsWarning"
        />
    </div>
</template>

<style scoped>
.view-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: var(--color-background);
}

.loading-container {
    width: 100%;
    max-width: 800px;
    padding: 40px;
    text-align: center;
    color: var(--color-text);
}

h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--color-heading);
    margin-bottom: 30px;
    text-align: center;
}

.settings-section {
    width: 100%;
    max-width: 800px;
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 25px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-heading);
    margin: 0 0 10px 0;
}

.section-description {
    font-size: 14px;
    color: var(--color-text);
    margin: 0 0 20px 0;
    line-height: 1.5;
}

.settings-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    gap: 20px;
}

.setting-info {
    flex: 1;
}

.setting-info h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-heading);
    margin: 0 0 5px 0;
}

.setting-description {
    font-size: 13px;
    color: var(--color-text);
    margin: 0;
    line-height: 1.4;
}

/* Toggle Switch */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
    flex-shrink: 0;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-border);
    transition: 0.3s;
    border-radius: 26px;
}

.toggle-slider:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: var(--color-background);
    transition: 0.3s;
    border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
    background-color: var(--vt-bt-background-color);
}

.toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(24px);
}

.toggle-switch input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Privacy Actions */
.privacy-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
}

/* Account Form */
.account-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-heading);
}

.form-input {
    padding: 12px 15px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 14px;
    color: var(--color-text);
    background-color: var(--color-background);
    transition: border-color 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--vt-bt-background-color);
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-hint {
    font-size: 13px;
    color: var(--color-text-muted);
    margin: 0;
}

.form-error {
    font-size: 13px;
    color: #ff4444;
    margin: 0;
    margin-top: 4px;
}

.input-error {
    border-color: #ff4444 !important;
}

.input-error:focus {
    outline: 2px solid rgba(255, 68, 68, 0.3);
}

/* Account Actions */
.account-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
}

.btn-save,
.btn-cancel {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.btn-save {
    background-color: var(--vt-bt-background-color);
    color: var(--vt-c-white);
}

.btn-save:hover:not(:disabled) {
    background-color: var(--vt-bt-background-color-hover);
}

.btn-cancel {
    background-color: var(--color-background);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.btn-cancel:hover:not(:disabled) {
    background-color: var(--color-background-mute);
}

.btn-save:disabled,
.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Danger Zone */
.danger-zone {
    padding: 20px;
    background-color: var(--color-background);
    border: 1px solid #dc3545;
    border-radius: 6px;
}

.danger-title {
    font-size: 16px;
    font-weight: 600;
    color: #dc3545;
    margin: 0 0 15px 0;
}

.item-info h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-heading);
    margin: 0 0 8px 0;
}

.item-description {
    font-size: 14px;
    color: var(--color-text);
    margin: 0 0 15px 0;
    line-height: 1.5;
}

.warning-text {
    font-size: 13px;
    color: #ffc107;
    margin: 10px 0 0 0;
    font-weight: 500;
}

.btn-delete {
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    background-color: var(--vt-bt-cancel-background-color);
    color: var(--vt-c-white);
    transition: background-color 0.2s ease;
}

.btn-delete:hover:not(:disabled) {
    background-color: var(--vt-bt-cancel-background-color-hover);
}

.btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 700px) {
    .view-container {
        padding: 15px;
    }

    h1 {
        font-size: 24px;
        margin-bottom: 20px;
    }

    .settings-section {
        padding: 20px;
    }

    .section-title {
        font-size: 18px;
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .toggle-switch {
        align-self: flex-end;
    }

    .privacy-actions,
    .account-actions {
        flex-direction: column;
    }

    .btn-save,
    .btn-cancel {
        width: 100%;
    }

    .btn-delete {
        width: 100%;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 22px;
    }

    .section-title {
        font-size: 17px;
    }

    .setting-info h3 {
        font-size: 15px;
    }

    .setting-description {
        font-size: 12px;
    }

    .warning-text {
        font-size: 12px;
    }

    .form-label {
        font-size: 13px;
    }

    .form-input {
        font-size: 13px;
        padding: 10px 12px;
    }

    .form-hint {
        font-size: 11px;
    }
}
</style>
