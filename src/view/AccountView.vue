<script setup>
import { reactive, ref, watch } from 'vue';
import { getDialogs } from 'telegram/client/dialogs.js';
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

async function onClickConnect() {
    // console.log('onClickConnect');
    // console.log(state.value.valueInput);
    // // console.log(input);
    // const test = '149.154.167.40:443';
    // const prop = '149.154.167.50:443';
    // const apiId = 27151307;
    // const apiHash = "ff9d24b00baaa16907c31afdbe318fd7";
    // const stringSession = new StringSession();
    // console.log('stringSession', stringSession);
    //
    // const client = new TelegramClient(stringSession, apiId, apiHash, {
    //         connectionRetries: 5,
    //     });
    // console.log(Api);
    // console.log(Api.messages);
    //     await client.start({
    //         phoneNumber: "+79056002730",
    //         password: "Master1090",
    //         phoneCode: async () => prompt('nunu!'),
    //         onError: (err) => console.log(err),
    //     });
    //     console.log("You should now be connected.");
    //     console.log(client.session.save()); // Save this string to avoid logging in again
    //     // await client.sendMessage("me", { message: "Hello!" });
    //     // await client.connect();
    //     const result = await client.getDialogs();
    // console.log('result', result); // prints the result
}
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
    margin: 20px;
}

.accounts-container {
    margin: 20px;
}

p,
h1 {
    color: #e3e2e2;
}
</style>
