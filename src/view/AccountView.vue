<script setup>
import { reactive } from 'vue';
import AddAccount from '@/components/button/AddAccount.vue';
import AccountCard from '@/components/account/AccountCard.vue';
import useAccountStore from '@/store/account.js';

const accStore = useAccountStore();
const accountIds = accStore.getCollectionId();
const state = reactive({
    valueInput: '',
    accounts: accountIds || [],
});

accStore.$onAction(({ name, after }) => {
    after(() => {
        if (name === 'setAccountData' || name === 'deleteAccountData') {
            state.accounts = accStore.getCollectionId();
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

        <div class="accounts-container">
            <div v-for="account of state.accounts" :key="account">
                <AccountCard v-bind="{ account }" />
            </div>
            <AddAccount />
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
</style>
