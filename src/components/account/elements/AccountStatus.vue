<script setup>
import circleOffImagePath from '@/assets/circle-off.png';
import circleOkImagePath from '@/assets/circle-ok.png';
import circleArrowsImagePath from '@/assets/circle-arrows.png';
import circleErrorImagePath from '@/assets/circle-error.png';
import { computed, reactive } from 'vue';

const state = reactive({
    status: 'offline',
});

const statusData = computed(() => {
    switch (state.status) {
        case 'offline':
            return { imagePath: circleOffImagePath, textStatus: 'отключен' };
        case 'online':
            return { imagePath: circleOkImagePath, textStatus: 'онлайн' };
        case 'connect':
            return {
                imagePath: circleArrowsImagePath,
                textStatus: 'соединение...',
            };
        case 'error':
            return { imagePath: circleErrorImagePath, textStatus: 'ошибка' };
    }
});
</script>

<template>
    <div class="container">
        <img :src="statusData.imagePath" alt="status" />
        <p>{{ statusData.textStatus }}</p>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    text-align: center;
    place-items: center;
    margin: 10px 5px 10px 5px;
}
img {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    margin: 5px;
}
</style>
