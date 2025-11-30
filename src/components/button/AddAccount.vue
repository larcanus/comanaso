<script setup>
import imagePlusPath from '@/assets/plus.png';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
const accStore = useAccountStore();
const toastStore = useToastStore();
const LIMIT_ACCOUNT_TEXT = 'Сейчас доступно создание только одного аккаунта';

function onClickDiv() {
    const ids = accStore.getCollectionId();
    if (ids.length >= 1) {
        toastStore.addToast('error', LIMIT_ACCOUNT_TEXT);
        return;
    }

    let id = 1;
    if (ids.length > 0) {
        id = ++ids.sort()[ids.length - 1];
    }

    accStore.setAccountData({ id });
}
</script>

<template>
    <div class="div-image">
        <img :src="imagePlusPath" alt="acc" @click="onClickDiv" />
    </div>
</template>

<style scoped>
.div-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px 0 40px 0;
}

img {
    width: 30%;
    height: 30%;
    align-self: center;
    position: relative;
    z-index: 1;
    opacity: 0.4;
    transition: transform 0.3s;
}
@media (min-width: 1000px) {
    img:hover {
        transform: scale(1.05);
    }
}
img:active {
    transform: scale(1.2);
}
</style>
