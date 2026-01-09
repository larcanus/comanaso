<script setup>
import imagePlusPath from '@/assets/plus.png';
import useAccountStore from '@/store/account.js';
import useToastStore from '@/store/toast.js';
import logger from '../../utils/logger.js';

const accStore = useAccountStore();
const toastStore = useToastStore();

const LIMIT_ACCOUNT_TEXT = 'Сейчас доступно создание только одного аккаунта';

async function onClickDiv() {
    const ids = accStore.accountIds;
    if (ids.length >= 1) {
        toastStore.addToast('error', LIMIT_ACCOUNT_TEXT);
        return;
    }

    try {
        // Создаем аккаунт с базовыми данными
        await accStore.setAccountData();

        toastStore.addToast('ok', 'Аккаунт создан. Заполните данные для подключения');
    } catch (error) {
        logger.error('Create account error:', error);
        toastStore.addToast('error', error.userMessage || 'Ошибка создания аккаунта');
    }
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
