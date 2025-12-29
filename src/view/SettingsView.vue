<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Confirm from '@/components/modal/Confirm.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import { authService } from '@/services/auth.service.js';
import { logoutAllStore } from '@/store/storeController.js';
import { useToastStore } from '@/store/toast.js';
import { useAccountStore } from '@/store/account.js';

const router = useRouter();
const toastStore = useToastStore();
const accountStore = useAccountStore();

const showDeleteConfirm = ref(false);
const showActiveAccountsWarning = ref(false);
const isDeleting = ref(false);

// Проверяем наличие активных (подключающихся или подключенных) аккаунтов
const hasActiveAccounts = computed(() => {
    return accountStore.accounts.some(
        (account) => account.status === 'online' || account.status === 'connect'
    );
});

// Получаем список активных аккаунтов для отображения в предупреждении
const activeAccountsList = computed(() => {
    return accountStore.accounts
        .filter((account) => account.status === 'online' || account.status === 'connect')
        .map((account) => {
            const statusText = account.status === 'online' ? 'подключен' : 'подключается';
            return `• ${account.name} (${statusText})`;
        })
        .join('\n');
});

const warningMessage = computed(() => ({
    title: 'Невозможно удалить учетную запись',
    desc: `Перед удалением учетной записи необходимо отключить все активные аккаунты.\n\nАктивные аккаунты:\n${activeAccountsList.value}\n\nПожалуйста, отключите их и повторите попытку.`,
}));

function openDeleteConfirm() {
    // Проверяем наличие активных аккаунтов
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
        closeDeleteConfirm();
        showActiveAccountsWarning.value = true;
        return;
    }

    isDeleting.value = true;

    try {
        const result = await authService.deleteAccount();

        if (result.ok) {
            toastStore.addToast(
                'success',
                `Учетная запись успешно удалена. Удалено аккаунтов: ${result.data.deleted_accounts_count || 0}`
            );

            // Закрываем модальное окно
            closeDeleteConfirm();

            // Выполняем выход из системы
            await logoutAllStore();

            // Перенаправляем на главную страницу
            await router.push({ name: 'home' });
        }
    } catch (error) {
        console.error('Ошибка при удалении учетной записи:', error);
        toastStore.addToast('error', error.userMessage || 'Не удалось удалить учетную запись');
        closeDeleteConfirm();
    } finally {
        isDeleting.value = false;
    }
}
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Настройки</h1>
            <p>Управление учетной записью и параметрами приложения</p>
        </div>

        <div class="settings-container">
            <div class="settings-section">
                <h2 class="section-title">Учетная запись</h2>

                <div class="settings-item danger-zone">
                    <div class="item-info">
                        <h3>Удаление учетной записи</h3>
                        <p class="item-description">
                            Удаление учетной записи приведет к безвозвратному удалению всех ваших
                            данных, включая все связанные аккаунты и историю. Это действие нельзя
                            отменить.
                        </p>
                        <p v-if="hasActiveAccounts" class="warning-text">
                            ⚠️ Перед удалением необходимо отключить все активные аккаунты
                        </p>
                    </div>
                    <button
                        class="btn-delete"
                        :disabled="isDeleting"
                        :class="{ 'btn-warning': hasActiveAccounts }"
                        @click="openDeleteConfirm"
                    >
                        {{ isDeleting ? 'Удаление...' : 'Удалить аккаунт' }}
                    </button>
                </div>
            </div>
        </div>

        <Confirm
            :is-visible="showDeleteConfirm"
            :is-input="false"
            message="Вы уверены, что хотите удалить свою учетную запись?&#10;&#10;Все ваши данные будут безвозвратно удалены."
            @confirm="handleDeleteAccount"
            @cancel="closeDeleteConfirm"
        />

        <DetailPopup
            :is-visible="showActiveAccountsWarning"
            :message="warningMessage"
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
}

.header-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    margin-bottom: 40px;
}

h1 {
    color: var(--color-heading);
    font-size: 32px;
    margin-bottom: 10px;
}

.header-container > p {
    color: var(--color-text);
    font-size: 16px;
    opacity: 0.8;
}

.settings-container {
    width: 100%;
    max-width: 800px;
}

.settings-section {
    background-color: var(--color-background-soft);
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: var(--color-heading);
    font-size: 20px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.danger-zone {
    padding: 20px;
    background-color: rgba(220, 38, 38, 0.05);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 6px;
}

.item-info {
    flex: 1;
}

.item-info h3 {
    color: var(--color-heading);
    font-size: 18px;
    margin-bottom: 8px;
}

.item-description {
    color: var(--color-text);
    font-size: 14px;
    line-height: 1.6;
    opacity: 0.8;
    margin-bottom: 8px;
}

.warning-text {
    color: #f59e0b;
    font-size: 13px;
    font-weight: 500;
    margin-top: 10px;
    line-height: 1.5;
}

.btn-delete {
    cursor: pointer;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    background-color: #dc2626;
    color: white;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 150px;
}

.btn-delete:hover:not(:disabled) {
    background-color: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.btn-delete:active:not(:disabled) {
    transform: translateY(0);
}

.btn-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-delete.btn-warning {
    background-color: #f59e0b;
}

.btn-delete.btn-warning:hover:not(:disabled) {
    background-color: #d97706;
    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

@media (max-width: 768px) {
    .view-container {
        padding: 15px;
    }

    h1 {
        font-size: 28px;
    }

    .settings-section {
        padding: 20px;
    }

    .settings-item {
        flex-direction: column;
        align-items: stretch;
    }

    .btn-delete {
        width: 100%;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 24px;
    }

    .section-title {
        font-size: 18px;
    }

    .item-info h3 {
        font-size: 16px;
    }

    .item-description {
        font-size: 13px;
    }

    .warning-text {
        font-size: 12px;
    }
}
</style>
