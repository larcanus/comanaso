<script setup>
import { ref, defineProps } from 'vue';
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

const isPopupVisible = ref(false);

const popupMessage = {
    get title() {
        return props.title;
    },
    get description() {
        return props.description;
    },
};

function showPopup() {
    isPopupVisible.value = true;
}

function closePopup() {
    isPopupVisible.value = false;
}
</script>

<template>
    <button type="button" class="info-button" title="Подробная информация" @click="showPopup">
        ?
    </button>
    <DetailPopup
        :message="popupMessage"
        :is-visible="isPopupVisible"
        :is-html="true"
        align="left"
        @close="closePopup"
    />
</template>

<style scoped>
.info-button {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #3498db;
    background-color: transparent;
    color: #3498db;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.info-button:hover {
    background-color: #3498db;
    color: white;
    transform: scale(1.1);
}

.info-button:active {
    transform: scale(0.95);
}
</style>
