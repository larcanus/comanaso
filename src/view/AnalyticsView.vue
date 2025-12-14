<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import DialogTable from '@/components/table/DialogTable.vue';
import UpdateButton from '@/components/button/UpdateButton.vue';
import DialogPie from '@/components/chart/DialogPie.vue';
import AccountSelector from '@/components/selector/AccountSelector.vue';
import useAccountStore from '@/store/account.js';
import useDialogStore from '@/store/dialogs.js';
import useToastStore from '@/store/toast.js';
import { analyticsService } from '@/services/analytics.service.js';

const accountStore = useAccountStore();
const dialogStore = useDialogStore();
const toastStore = useToastStore();

const selectedAccountId = ref(null);
const isLoadingAnalytics = ref(false);

// Конфигурация для запроса данных (в будущем можно сделать настройки)
const analyticsConfig = ref({
    includeDialogs: true,
    includeFolders: true,
    includeStats: true,
});

const hasSelectedAccount = computed(() => selectedAccountId.value !== null);
const hasDialogsData = computed(() => dialogStore?.dialogs?.length > 0);

// Автоматически выбираем первый аккаунт при монтировании
onMounted(async () => {
    await accountStore.loadAccountsFromServer();

    if (accountStore.accountIds.length > 0) {
        selectedAccountId.value = accountStore.accountIds[0];
    }
});

// Загружаем данные при изменении выбранного аккаунта
watch(selectedAccountId, async (newAccountId) => {
    if (newAccountId) {
        await loadAnalyticsData(newAccountId);
    }
});

/**
 * Загрузка данных аналитики для выбранного аккаунта
 */
async function loadAnalyticsData(accountId) {
    isLoadingAnalytics.value = true;

    try {
        const data = await analyticsService.getAnalyticsData(accountId, analyticsConfig.value);

        // Сохраняем диалоги в store
        if (data.dialogs?.items) {
            dialogStore.setDialogs(data.dialogs.items);
        }

        // В будущем можно сохранять folders и stats в соответствующие stores

        toastStore.addToast('success', 'Данные аналитики успешно загружены');
    } catch (error) {
        console.error('[AnalyticsView] Error loading analytics:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка загрузки данных аналитики');

        // Очищаем данные при ошибке
        dialogStore.clearDialogs();
    } finally {
        isLoadingAnalytics.value = false;
    }
}

/**
 * Обработчик выбора аккаунта
 */
function handleAccountSelected(accountId) {
    selectedAccountId.value = accountId;
}

/**
 * Обновить данные для текущего аккаунта
 */
async function refreshAnalytics() {
    if (selectedAccountId.value) {
        await loadAnalyticsData(selectedAccountId.value);
    }
}
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Аналитика</h1>
            <p>Здесь отображаются доступные данные и аналитика.</p>
        </div>

        <AccountSelector
            :selected-account-id="selectedAccountId"
            @account-selected="handleAccountSelected"
        />

        <div v-if="!hasSelectedAccount" class="empty-state">
            <p>👆 Выберите аккаунт для просмотра аналитики</p>
        </div>

        <div v-else-if="isLoadingAnalytics" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка данных аналитики...</p>
        </div>

        <div v-else-if="hasDialogsData" class="analytics-content">
            <DialogTable />
            <DialogPie />
            <UpdateButton @refresh="refreshAnalytics" />
        </div>

        <div v-else class="empty-state">
            <p>📊 Нет данных для отображения</p>
            <p class="hint">Нажмите кнопку обновления для загрузки данных</p>
            <UpdateButton @refresh="refreshAnalytics" />
        </div>
    </div>
</template>

<style scoped>
.view-container {
    min-height: 100vh;
    align-items: center;
    justify-content: flex-start;
    display: flex;
    flex-direction: column;
    padding: 0 20px;
}

.header-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    margin: 25px 0;
}

p,
h1 {
    color: #e3e2e2;
}

.analytics-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
}

.empty-state p {
    font-size: 18px;
    margin: 10px 0;
}

.empty-state .hint {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 20px;
}

.loading-state p {
    font-size: 16px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.1);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
