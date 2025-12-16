<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import DialogTable from '@/components/table/DialogTable.vue';
import UpdateButton from '@/components/button/UpdateButton.vue';
import DialogPie from '@/components/chart/DialogPie.vue';
import AccountSelector from '@/components/selector/AccountSelector.vue';
import LoadingProgress from '@/components/progress/LoadingProgress.vue';
import useAccountStore from '@/store/account.js';
import useDialogStore from '@/store/dialogs.js';
import useUserStore from '@/store/user.js';
import useToastStore from '@/store/toast.js';
import { analyticsService } from '@/services/analytics.service.js';

const accountStore = useAccountStore();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const toastStore = useToastStore();

const selectedAccountId = ref(null);
const isLoadingAnalytics = ref(false);

// Состояние прогресса загрузки
const loadingProgress = ref({
    step: 0,
    total: 0,
    progress: 0,
    label: '',
    status: 'loading',
});

const hasSelectedAccount = computed(() => selectedAccountId.value !== null);
const hasDialogsData = computed(() => dialogStore?.state?.dialogs?.length > 0);
const isLoading = computed(() => isLoadingAnalytics.value);

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
 * Обработчик прогресса загрузки
 */
function handleProgress(progressData) {
    loadingProgress.value = {
        step: progressData.step,
        total: progressData.total,
        progress: progressData.progress,
        label: progressData.label,
        status: progressData.status,
    };

    console.log('[AnalyticsView] Progress:', progressData);
}

async function checkAccountIsOnline(accountId)
{
    return accountStore.isOnline(accountId);
}


/**
 * Загрузка данных аналитики для выбранного аккаунта
 */
async function loadAnalyticsData(accountId) {
    const isOnline = await checkAccountIsOnline(accountId);
    if (!isOnline) {
        return;
    }

    isLoadingAnalytics.value = true;

    // Сбрасываем прогресс
    loadingProgress.value = {
        step: 0,
        total: 3,
        progress: 0,
        label: 'Начало загрузки...',
        status: 'loading',
    };

    try {
        const data = await analyticsService.loadAllData(accountId, handleProgress);

        // Сохраняем данные профиля в user store
        if (data.accountInfo) {
            userStore.setUserData({
                id: data.accountInfo.id,
                fullName:
                    `${data.accountInfo.firstName || ''} ${data.accountInfo.lastName || ''}`.trim(),
                avatar: data.accountInfo.photo?.photoId || '',
            });
        }

        // Сохраняем диалоги в dialog store
        if (data.dialogs?.dialogs) {
            dialogStore.setDialogs(data.dialogs.dialogs);
        }

        // В будущем можно сохранять folders в соответствующий store
        console.log('[AnalyticsView] Folders loaded:', data.folders);

        toastStore.addToast('success', 'Данные аналитики успешно загружены');
    } catch (error) {
        console.error('[AnalyticsView] Error loading analytics:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка загрузки данных аналитики');

        // Очищаем данные при ошибке
        dialogStore.$reset();
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

        <div v-else-if="isLoading" class="loading-state">
            <LoadingProgress
                :progress="loadingProgress.progress"
                :label="loadingProgress.label"
                :status="loadingProgress.status"
                :step="loadingProgress.step"
                :total="loadingProgress.total"
            />
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
    width: 100%;
    max-width: 800px;
}
</style>
