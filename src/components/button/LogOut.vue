<script setup>
import { useRouter } from 'vue-router';
import { logoutAllStore } from '@/store/storeController.js';
import { authService } from '@/services/auth.service.js';

const router = useRouter();

async function onClickContainer() {
    try {
        // Выполняем выход на сервере
        const result = await authService.logout();
        console.log('logout result:', result);

        // Очищаем все stores и localStorage
        await logoutAllStore();

        // Перенаправляем на главную страницу
        await router.replace({ name: 'home' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);

        // Даже при ошибке очищаем локальные данные
        await logoutAllStore();
        await router.replace({ name: 'home' });
    }
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
