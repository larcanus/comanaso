<script setup>
import { ref } from 'vue';
import imageLoginPath from '@/assets/login-card.png';
import imageTgPath from '@/assets/telegram.png';
import imageDataPath from '@/assets/data-card.png';

const steps = ref([
    {
        imagePath: imageLoginPath,
        text: 'Зарегистрируйтесь на сайте.',
    },
    {
        imagePath: imageTgPath,
        text: 'Подключите ваши аккаунты.',
    },
    {
        imagePath: imageDataPath,
        text: 'Начните анализировать данные.',
    },
]);
</script>

<template>
    <section class="section second">
        <div v-for="(step, index) in steps" :key="index" class="card-container">
            <div class="card-image">
                <img :src="step.imagePath" alt="Step Image" class="image" />
                <p class="card-text">{{ step.text }}</p>
            </div>
            <div v-if="index < 2" class="arrow">→</div>
        </div>
    </section>
</template>

<style scoped>
.second {
    padding: 10% 0 10% 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #050000;
}

.card-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    align-self: center;
}

.card-image {
    max-width: 300px;
    min-height: 300px;
    min-width: 300px;
    max-height: 300px;
    width: 300px;
    height: 300px;
    border-radius: 1px;
    border: 1px solid #f1f5f0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image {
    width: 140px;
    height: 145px;
    margin: 40px 30px 20px 30px;
}

.card-text {
    text-align: center;
    margin: 0 20px 20px 20px;
    font-size: 20px;
    font-weight: 500;
    color: #f6f2f2;
}

.arrow {
    font-size: 24px;
    margin: 20px;
    align-self: center;
    color: white;
}

@media (max-width: 1200px) {
    .section {
        height: 100%;
    }

    .second {
        flex-direction: column;
    }

    .card-container {
        flex-direction: column;
    }

    .arrow {
        transform: rotate(90deg); /* Поворачиваем стрелку для вертикального направления */
    }
}
</style>
