<script setup>
import { useRouter } from 'vue-router';
import { logoutAllStore } from '@/store/storeController.js';
import { fullDisconnectClient, logOut } from '@/utils/connection.js';
import useConnectionStore from '@/store/connection.js';
const router = useRouter();

async function onClickContainer() {
    const connectionStore = useConnectionStore();
    const client = await connectionStore.getClientByAccountId(null);
    const resultLogout = await logOut(client);
    console.log('logout --->', resultLogout);
    await fullDisconnectClient(client)
    logoutAllStore();
    await router.replace({ name: 'home' });
}
</script>

<template>
    <div class="container" @click="onClickContainer">
        <img src="@/assets/log-out.png" alt="logout" class="button-img" />
    </div>
</template>

<style scoped>
.container {
    margin: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.button-img {
    width: 70px;
    height: 70px;
}
.container:hover {
    opacity: 0.9;
    transform: scale(1.1);
    transition: transform 0.3s;
}
</style>
