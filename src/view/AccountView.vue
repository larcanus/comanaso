<script setup>
import { reactive, onMounted } from 'vue';
import AddAccount from '@/components/button/AddAccount.vue';
import AccountCard from '@/components/account/AccountCard.vue';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import Toast from '@/components/toast/Toast.vue';

const accStore = useAccountStore();
const toastStore = useToastStore();
const accountIds = accStore.accountIds;
const state = reactive({
    valueInput: '',
    accounts: accountIds || [],
    isInitialLoad: true,
});

// Загружаем данные при монтировании компонента
onMounted(async () => {
    if (state.isInitialLoad) {
        state.isInitialLoad = false;
        try {
            console.log('account onMounted');
            await accStore.loadAccountsFromServer();
            state.accounts = accStore.accountIds;
        } catch (error) {
            console.error('Failed to load accounts on mount:', error);
            toastStore.addToast('error', error.userMessage || 'Не удалось загрузить аккаунты');
        }
    }
});

accStore.$onAction(({ name, after }) => {
    after(() => {
        if (name === 'setAccountData' || name === 'deleteAccountData' || name === 'loadAccountsFromServer') {
            state.accounts = accStore.accountIds;
        }
    });
});
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Аккаунты</h1>
            <p>Здесь отображается основная информация ваших аккаунтов и их состоянии.</p>
        </div>

        <div v-if="accStore.isLoading" class="loading-container">
            <p>Загрузка аккаунтов...</p>
        </div>

        <div v-else class="accounts-container">
            <div v-for="account of state.accounts" :key="account">
                <AccountCard v-bind="{ account }" />
            </div>
            <AddAccount />
        </div>
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
    margin: 25px;
}

.accounts-container {
    margin: 20px;
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
</style>
