<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import DialogTable from '@/components/table/DialogTable.vue';
import UpdateButton from '@/components/button/UpdateButton.vue';
import DialogPie from '@/components/chart/DialogPie.vue';
import AccountSelector from '@/components/selector/AccountSelector.vue';
import LoadingProgress from '@/components/progress/LoadingProgress.vue';
import UserInfoCard from '@/components/card/UserInfoCard.vue';
import FolderCards from '@/components/card/FolderCards.vue';
import useAccountStore from '@/store/account.js';
import useDialogStore from '@/store/dialogs.js';
import useUserStore from '@/store/user.js';
import useToastStore from '@/store/toast.js';
import { analyticsService } from '@/services/analytics.service.js';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth.js';

const accountStore = useAccountStore();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const toastStore = useToastStore();

const selectedAccountId = ref(null);
const isLoadingAnalytics = ref(false);

// Динамический расчет ширины контента
const { width: contentWidth } = useResponsiveWidth({
    mobileBreakpoint: 750,
    desktopWidthRatio: 0.7,
    mobileWidthRatio: 0.9,
});

// Состояние прогресса загрузки
const loadingProgress = ref({
    step: 0,
    total: 0,
    progress: 0,
    label: '',
    status: 'loading',
});

const hasSelectedAccount = computed(() => selectedAccountId.value !== null);
const hasDialogsData = computed(() => dialogStore?.state?.length > 0);
const hasUserData = computed(() => userStore.hasUser);
const isLoading = computed(() => isLoadingAnalytics.value);

// Проверка статуса выбранного аккаунта
const isAccountOnline = computed(() => {
    if (!selectedAccountId.value) return false;
    return accountStore.isOnline(selectedAccountId.value);
});

const accountStatus = computed(() => {
    if (!selectedAccountId.value) return 'offline';
    return accountStore.getAccountStatus(selectedAccountId.value);
});

// Автоматически выбираем первый аккаунт при монтировании
onMounted(async () => {
    if (accountStore.accountIds.length > 0) {
        selectedAccountId.value = accountStore.accountIds[0];
    }
});

// Загружаем данные при изменении выбранного аккаунта
watch(selectedAccountId, async (newAccountId) => {
    if (newAccountId && accountStore.isOnline(newAccountId)) {
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

/**
 * Загрузка данных аналитики для выбранного аккаунта
 */
async function loadAnalyticsData(accountId) {
    if (!accountStore.isOnline(accountId)) {
        toastStore.addToast(
            'warning',
            'Аккаунт не подключен. Подключите аккаунт для загрузки данных.'
        );
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
        console.log('loadAllData: ', data);
        // Сохраняем данные профиля в user store
        if (data.accountInfo) {
            userStore.setUserData(data.accountInfo);
        }

        if (data.profilePhoto) {
            userStore.setAvatar(data.profilePhoto);
        }

        // Сохраняем папки в dialog store
        if (data.folders) {
            dialogStore.setFolders(data.folders);
        }

        // Сохраняем диалоги в dialog store
        if (data.dialogs?.dialogs) {
            dialogStore.setDialogs(data.dialogs.dialogs);
        }

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
        </div>

        <AccountSelector
            :selected-account-id="selectedAccountId"
            @account-selected="handleAccountSelected"
        />

        <div v-if="!hasSelectedAccount" class="empty-state"></div>

        <div v-else-if="!isAccountOnline" class="offline-state">
            <p>🔌 Аккаунт не подключен</p>
            <p class="hint">
                Статус: <span class="status-badge">{{ accountStatus }}</span>
            </p>
            <p class="hint">
                Подключите аккаунт в разделе "Аккаунты" для загрузки данных аналитики
            </p>
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

        <div
            v-else-if="hasUserData || hasDialogsData"
            class="analytics-content"
            :style="{ width: contentWidth + 'px' }"
        >
            <!-- Информация о пользователе -->
            <UserInfoCard v-if="hasUserData" />

            <!-- Блок папок -->
            <FolderCards />

            <!-- Блок диалогов -->
            <DialogTable v-if="hasDialogsData" />
            <DialogPie v-if="hasDialogsData" />

            <!-- TODO: Блок AI анализа -->

            <UpdateButton :is-disabled="!isAccountOnline" @refresh="refreshAnalytics" />
        </div>

        <div v-else class="empty-state">
            <p>📊 Нет данных для отображения</p>
            <p class="hint">Нажмите кнопку обновления для загрузки данных</p>
            <UpdateButton :is-disabled="!isAccountOnline" @refresh="refreshAnalytics" />
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

.empty-state,
.offline-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
}

.empty-state p,
.offline-state p {
    font-size: 18px;
    margin: 10px 0;
}

.empty-state .hint,
.offline-state .hint {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
}

.offline-state {
    background: rgba(255, 152, 0, 0.1);
    border: 2px dashed rgba(255, 152, 0, 0.3);
    border-radius: 12px;
    padding: 40px;
    max-width: 600px;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(255, 152, 0, 0.2);
    border-radius: 12px;
    color: #ff9800;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
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
