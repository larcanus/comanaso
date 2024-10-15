<script setup>
import imagePlusPath from '@/assets/plus.png';
import useAccountStore from '@/store/account.js';
const accStore = useAccountStore();
function onClickDiv() {
    const ids = accStore.getCollectionId();
    if (ids.length > 5) {
        console.log('to match acc'); // TODO notify
        alert('куда тебе столько?');
        return;
    }

    let id = 0;
    if (ids.length > 0) {
        id = ++ids.sort()[ids.length - 1];
    }

    accStore.setAccountData({ id });
}
</script>

<template>
    <div class="div-image" @click="onClickDiv">
        <img :src="imagePlusPath" alt="acc" />
    </div>
</template>

<style scoped>
.div-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
