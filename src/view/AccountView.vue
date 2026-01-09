<script setup>
import { computed, onMounted, ref } from 'vue';
import AddAccount from '@/components/button/AddAccount.vue';
import AccountCard from '@/components/account/AccountCard.vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import Toast from '@/components/toast/Toast.vue';
import { ACCOUNT_GENERAL_INFO } from '@/constants/fieldDescriptions.js';

const accStore = useAccountStore();
const toastStore = useToastStore();

// Используем computed для реактивного отслеживания изменений
const accountIds = computed(() => accStore.accountIds);

const isGeneralInfoVisible = ref(false);

// Загружаем данные при монтировании компонента
onMounted(async () => {
    try {
        await accStore.loadAccountsFromServer();
    } catch (error) {
        console.error('Failed to load accounts on mount:', error);
        toastStore.addToast('error', error.userMessage || 'Не удалось загрузить аккаунты');
    }
});

function showGeneralInfo() {
    isGeneralInfoVisible.value = true;
}
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Аккаунты Telegram</h1>
            <p>Управление вашими аккаунтами для работы с сервисом.</p>
        </div>

        <!-- Общая инструкция -->
        <div class="general-info-section">
            <div class="info-content">
                <div class="info-text-block">
                    <p class="info-title">Как подключить?</p>
                    <p class="info-description">
                        Для работы необходимо получить API-ключи из Telegram и авторизоваться.
                        Заполните все поля в карточке аккаунта и жмите "Старт!".
                    </p>
                </div>
                <button type="button" class="info-link" @click="showGeneralInfo">Инструкция</button>
            </div>
        </div>

        <div v-if="accStore.isLoading" class="loading-container">
            <p>Загрузка аккаунтов...</p>
        </div>

        <div v-else class="accounts-container">
            <div v-for="accountId of accountIds" :key="accountId">
                <AccountCard :account-id="accountId" />
            </div>
            <AddAccount />
        </div>

        <!-- Модальное окно с детальной инструкцией -->
        <DetailPopup
            :message="ACCOUNT_GENERAL_INFO"
            :is-visible="isGeneralInfoVisible"
            :is-html="true"
            align="left"
            @close="isGeneralInfoVisible = false"
        />
    </div>
    <Toast />
</template>

<style scoped>
.view-container {
    min-height: 100vh;
    align-items: center;
    justify-content: flex-start;
    display: flex;
    flex-direction: column;
}

.header-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    margin: 25px 20px 15px 20px;
}

/* Общая инструкция */
.general-info-section {
    background: rgba(52, 152, 219, 0.1);
    border-left: 4px solid #3498db;
    padding: 16px 20px;
    margin: 0 20px 20px 20px;
    border-radius: 4px;
    max-width: 800px;
    width: calc(100% - 40px);
}

.info-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.info-text-block {
    flex: 1;
    min-width: 0;
}

.info-title {
    color: #e3e2e2;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px 0;
}

.info-description {
    color: #cbcad0;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
}

.info-link {
    background: none;
    border: none;
    color: #3498db;
    cursor: pointer;
    text-decoration: underline;
    font-size: 14px;
    padding: 0;
    transition: color 0.3s ease;
    white-space: nowrap;
    flex-shrink: 0;
    align-self: center;
}

.info-link:hover {
    color: #2980b9;
}

.accounts-container {
    margin: 20px;
    width: 100%;
    max-width: 1200px;
}

p,
h1 {
    color: #e3e2e2;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: #e3e2e2;
    font-size: 18px;
}

@media (max-width: 768px) {
    .header-container {
        margin: 20px 15px 10px 15px;
    }

    .general-info-section {
        margin: 0 15px 15px 15px;
        padding: 14px 16px;
        width: calc(100% - 30px);
    }

    .info-content {
        flex-direction: column;
        gap: 10px;
    }

    .info-title {
        font-size: 15px;
    }

    .info-description {
        font-size: 13px;
    }

    .info-link {
        align-self: flex-start;
        font-size: 13px;
    }

    .accounts-container {
        margin: 15px;
    }
}

@media (max-width: 480px) {
    .header-container {
        margin: 15px 10px 10px 10px;
    }

    .header-container h1 {
        font-size: 24px;
    }

    .header-container p {
        font-size: 14px;
    }

    .general-info-section {
        margin: 0 10px 10px 10px;
        padding: 12px 14px;
        width: calc(100% - 20px);
    }

    .info-title {
        font-size: 14px;
    }

    .info-description {
        font-size: 12px;
    }

    .accounts-container {
        margin: 10px;
    }
}
</style>
