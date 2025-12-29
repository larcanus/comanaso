<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Confirm from '@/components/modal/Confirm.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import { authService } from '@/services/auth.service.js';
import { logoutAllStore } from '@/store/storeController.js';
import { useToastStore } from '@/store/toast.js';
import { useAccountStore } from '@/store/account.js';
import { useAuthStore } from '@/store/auth.js';

const router = useRouter();
const toastStore = useToastStore();
const accountStore = useAccountStore();
const authStore = useAuthStore();

const showDeleteConfirm = ref(false);
const showActiveAccountsWarning = ref(false);
const isDeleting = ref(false);
const isSavingPrivacy = ref(false);

// Локальные копии настроек приватности для редактирования
const localPrivacySettings = ref({
    shareUserName: true,
    shareNickname: true,
    shareMessageText: true,
    shareDialogTitles: true,
});

// Инициализация настроек из store
const initPrivacySettings = () => {
    const settings = authStore.aiPrivacySettings;
    if (settings) {
        localPrivacySettings.value = { ...settings };
    }
};

// Инициализируем при загрузке
initPrivacySettings();

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
        await authService.updateAiPrivacySettings(localPrivacySettings.value);
        authStore.updateAiPrivacySetting(localPrivacySettings.value);
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
</script>

<template>
    <div class="view-container">
        <h1>Настройки</h1>

        <!-- Раздел: Настройки AI-анализа -->
        <section class="settings-section">
            <h2 class="section-title">Настройки AI-анализа</h2>
            <p class="section-description">
                Управляйте данными, которые передаются для AI-анализа. Отключение некоторых опций
                может снизить качество аналитики.
            </p>

            <div class="settings-list">
                <!-- Имя профиля -->
                <div class="setting-item">
                    <div class="setting-info">
                        <h3>Имя профиля</h3>
                        <p class="setting-description">
                            Передавать имя и фамилию из профиля Telegram для персонализации анализа
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
                            Передавать текст последних сообщений из диалогов для глубокого анализа
                            контекста
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
                <button class="btn-save" :disabled="isSavingPrivacy" @click="savePrivacySettings">
                    {{ isSavingPrivacy ? 'Сохранение...' : 'Сохранить изменения' }}
                </button>
            </div>
        </section>

        <!-- Раздел: Учетная запись -->
        <section class="settings-section">
            <h2 class="section-title">Учетная запись</h2>

            <div class="danger-zone">
                <div class="item-info">
                    <p class="item-description">
                        Безвозвратное удаление вашей учетной записи и всех связанных данных. Это
                        действие нельзя отменить.
                    </p>
                    <p v-if="hasActiveAccounts" class="warning-text">
                        ⚠️ Перед удалением необходимо отключить все активные аккаунты
                    </p>
                </div>
                <button
                    class="btn-delete"
                    :disabled="isDeleting"
                    @click="openDeleteConfirm"
                >
                    {{ isDeleting ? 'Удаление...' : 'Удалить учетную запись' }}
                </button>
            </div>
        </section>

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

    .privacy-actions {
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
}
</style>
