<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import DialogTable from '@/components/table/DialogTable.vue';
import UpdateButton from '@/components/button/UpdateButton.vue';
import AccountSelector from '@/components/selector/AccountSelector.vue';
import LoadingProgress from '@/components/progress/LoadingProgress.vue';
import UserInfoCard from '@/components/card/UserInfoCard.vue';
import FolderCards from '@/components/card/FolderCards.vue';
import AnalyticsCharts from '@/components/chart/AnalyticsCharts.vue';
import AiAnalyticsButton from '@/components/button/AiAnalyticsButton.vue'; // Добавлен новый компонент
import useAccountStore from '@/store/account.js';
import useDialogStore from '@/store/dialogs.js';
import useUserStore from '@/store/user.js';
import useToastStore from '@/store/toast.js';
import { analyticsService } from '@/services/analytics.service.js';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth.js';
import { accountService } from '@/services/account.service.js';
import logger from '../utils/logger.js';

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

// Информация о времени последней загрузки
const lastLoadedTime = computed(() => {
    if (!selectedAccountId.value) return null;
    const timestamp = accountStore.getDataLoadedAt(selectedAccountId.value);
    if (!timestamp) return null;

    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
});

// Автоматически выбираем первый аккаунт при монтировании
onMounted(async () => {
    if (accountStore.accountIds.length > 0) {
        selectedAccountId.value = accountStore.accountIds[0];
    }
});

// Загружаем данные при изменении выбранного аккаунта
watch(selectedAccountId, async (newAccountId) => {
    if (!newAccountId || !accountStore.isOnline(newAccountId)) {
        return;
    }

    // Проверяем, есть ли уже загруженные данные
    const hasData = accountStore.hasAnalyticsData(newAccountId);

    if (hasData) {
        logger.log(`[AnalyticsView] Data already loaded for account ${newAccountId}`);
        toastStore.addToast('info', 'Используются ранее загруженные данные');
        return;
    }

    // Если данных нет - загружаем
    logger.log(`[AnalyticsView] Loading data for account ${newAccountId}`);
    await loadAnalyticsData(newAccountId, false);
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
 * @param {number} accountId - ID аккаунта
 * @param {boolean} force - Принудительная загрузка (игнорировать кэш)
 */
async function loadAnalyticsData(accountId, force = false) {
    if (!accountStore.isOnline(accountId)) {
        toastStore.addToast(
            'warning',
            'Аккаунт не подключен. Подключите аккаунт для загрузки данных.'
        );
        return;
    }

    // Если не принудительная загрузка и данные уже есть - пропускаем
    if (!force && accountStore.hasAnalyticsData(accountId)) {
        console.log(`[AnalyticsView] Data already exists for account ${accountId}, skipping load`);
        return;
    }

    isLoadingAnalytics.value = true;

    // Сбрасываем прогресс
    loadingProgress.value = {
        step: 0,
        total: 4,
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

        // Отмечаем, что данные загружены
        await accountStore.markAnalyticsDataLoaded(accountId);

        const message = force
            ? 'Данные аналитики успешно обновлены'
            : 'Данные аналитики успешно загружены';

        toastStore.addToast('success', message);
    } catch (error) {
        console.error('[AnalyticsView] Error loading analytics:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка загрузки данных аналитики');

        // Очищаем данные при ошибке
        dialogStore.clear();
        userStore.clearUser();

        // Очищаем флаг загруженности
        await accountStore.clearAnalyticsData(accountId);
        propagateError(accountId, error);
    } finally {
        isLoadingAnalytics.value = false;
    }
}

function propagateError(accountId, error) {
    if (error.code === 'ACCOUNT_NOT_CONNECTED') {
        accountService.logoutAccount(accountId);
    }
}

/**
 * Обработчик выбора аккаунта
 */
function handleAccountSelected(accountId) {
    selectedAccountId.value = accountId;
}

/**
 * Обновить данные для текущего аккаунта (принудительно)
 */
async function refreshAnalytics() {
    if (selectedAccountId.value) {
        // Очищаем существующие данные
        dialogStore.clear();
        userStore.clearUser();

        // Загружаем с флагом force=true
        await loadAnalyticsData(selectedAccountId.value, true);
    }
}
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Аналитика</h1>
            <p v-if="lastLoadedTime" class="last-update">
                Последнее обновление: {{ lastLoadedTime }}
            </p>
        </div>

        <AccountSelector
            :selected-account-id="selectedAccountId"
            @account-selected="handleAccountSelected"
        />

        <div v-if="!hasSelectedAccount" class="empty-state">
            <p>Выберите аккаунт для просмотра аналитики</p>
        </div>

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

            <!-- Графики и диаграммы -->
            <AnalyticsCharts v-if="hasDialogsData" />

            <!-- AI аналитика -->
            <AiAnalyticsButton v-if="hasDialogsData" />

            <!-- Кнопка обновления -->
            <UpdateButton :is-disabled="!isAccountOnline" @refresh="refreshAnalytics" />
        </div>

        <div v-else class="empty-state">
            <p>Нет данных для отображения</p>
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

.last-update {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
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
