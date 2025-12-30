<script setup>
import { ref } from 'vue';
import DetailPopup from '@/components/modal/DetailPopup.vue';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const isModalVisible = ref(false);

const modalMessage = {
    title: props.title,
    desc: props.description,
};

function openModal() {
    isModalVisible.value = true;
}

function closeModal() {
    isModalVisible.value = false;
}
</script>

<template>
    <div class="chart-info-wrapper">
        <button class="info-icon" title="Информация о диаграмме" @click="openModal">?</button>

        <DetailPopup
            :message="modalMessage"
            :is-visible="isModalVisible"
            align="left"
            @close="closeModal"
        />
    </div>
</template>

<style scoped>
.chart-info-wrapper {
    display: inline-block;
    padding-bottom: 1.5px;
}

.info-icon {
    width: 19px;
    height: 19px;
    border-radius: 50%;
    border: 1.5px solid var(--color-text);
    background-color: transparent;
    color: var(--color-text);
    font-size: 11px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    flex-shrink: 0;
    user-select: none;
}

.info-icon:hover {
    background-color: var(--vt-bt-background-color);
    color: var(--vt-c-white);
    border-color: var(--vt-bt-background-color);
}

@media (max-width: 768px) {
    .info-icon {
        width: 18px;
        height: 18px;
        font-size: 10px;
    }
}
</style>
