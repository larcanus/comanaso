<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    message: {
        type: [Object, null],
        required: true,
    },
    isVisible: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}
</script>

<template>
    <teleport to="body">
        <div v-if="isVisible" class="modal-overlay">
            <div class="modal-content">
                <div class="content">
                    <h3>{{ message.title }}</h3>
                    <p>{{ message.desc }}</p>
                </div>
                <button @click="closeModal">OK</button>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 2px;
    text-align: center;
    width: 50%;
    max-width: 500px;
    text-wrap: wrap;
}
.content {
    margin: 1% 0 4% 0;
    color: #030101;
}

button {
    cursor: pointer;
    width: 50%;
    max-width: 70%;
    padding: 2px;
    height: max-content;
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
    border-radius: 2px;
}
button:hover {
    background-color: var(--vt-bt-background-color-hover);
}
</style>
