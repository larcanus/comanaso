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
    align: {
        type: String,
        default: 'center',
        validator: (value) => ['center', 'left'].includes(value),
    },
    isHtml: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

// Обработка клавиши Escape
function handleKeyDown(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}
</script>

<template>
    <teleport to="body">
        <div
            v-if="isVisible"
            class="modal-overlay"
            @click.self="closeModal"
            @keydown="handleKeyDown"
        >
            <div class="modal-content">
                <div class="content" :class="`content-${align}`">
                    <h3 class="modal-title">{{ message?.title }}</h3>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div
                        v-if="isHtml"
                        class="modal-description"
                        v-html="message?.description || message?.desc"
                    ></div>
                    <p v-else class="modal-description">{{ message?.desc }}</p>
                </div>
                <button class="btn-close" @click="closeModal">OK</button>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal-content {
    background-color: var(--color-background-soft);
    border: 1px solid #ccc;
    padding: 25px;
    border-radius: 2px;
    text-align: center;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    text-wrap: wrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.content {
    margin-bottom: 20px;
}

.content-left {
    text-align: left;
}

.content-left .modal-title {
    text-align: center;
}

.content-left .modal-description {
    text-align: left;
}

.modal-title {
    color: var(--color-heading);
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px 0;
    line-height: 1.4;
}

.modal-description {
    color: var(--color-text);
    font-size: 15px;
    margin: 0;
    line-height: 1.6;
}

/* Стили для HTML-контента */
.modal-description :deep(p) {
    margin: 0 0 8px 0;
}

.modal-description :deep(p:last-child) {
    margin-bottom: 0;
}

.modal-description :deep(strong) {
    color: var(--color-heading);
    font-weight: 600;
}

.modal-description :deep(em) {
    font-style: italic;
    color: #95949a;
}

.modal-description :deep(ul),
.modal-description :deep(ol) {
    margin: 4px 0 8px 0;
    padding-left: 20px;
}

.modal-description :deep(li) {
    margin-bottom: 4px;
    line-height: 1.5;
}

.modal-description :deep(a) {
    color: #3498db;
    text-decoration: none;
    transition: color 0.2s ease;
}

.modal-description :deep(a:hover) {
    color: #2980b9;
    text-decoration: underline;
}

.btn-close {
    cursor: pointer;
    width: 100%;
    max-width: 200px;
    height: 40px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 2px;
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
    transition: background-color 0.2s ease;
}

.btn-close:hover {
    background-color: var(--vt-bt-background-color-hover);
}

@media (max-width: 700px) {
    .modal-content {
        width: 85%;
        padding: 20px;
        max-height: 85vh;
    }

    .modal-title {
        font-size: 18px;
    }

    .modal-description {
        font-size: 14px;
    }

    .btn-close {
        font-size: 13px;
        height: 38px;
    }
}

@media (max-width: 480px) {
    .modal-content {
        width: 90%;
        padding: 18px;
    }

    .modal-title {
        font-size: 16px;
        margin-bottom: 10px;
    }

    .modal-description {
        font-size: 13px;
    }

    .btn-close {
        max-width: 100%;
    }
}
</style>
