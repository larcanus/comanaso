<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
    message: {
        type: [String, null],
        required: true,
    },
    isVisible: {
        type: Boolean,
        required: true,
        default: false,
    },
    isInput: {
        type: Boolean,
        required: false,
        default: true,
    },
});

const emit = defineEmits(['confirm', 'cancel']);

const inputValue = ref('');
const inputRef = ref(null);

// Автофокус и очистка при открытии/закрытии модального окна
watch(
    () => props.isVisible,
    async (isVisible) => {
        if (isVisible) {
            inputValue.value = '';
            if (props.isInput) {
                await nextTick();
                inputRef.value?.focus();
            }
        } else {
            // Очищаем input при закрытии
            inputValue.value = '';
        }
    }
);

function confirm() {
    if (props.isInput === true) {
        return emit('confirm', inputValue.value);
    }

    return emit('confirm', true);
}

function cancel() {
    emit('cancel');
}

// Обработка клавиши Escape
function handleKeyDown(event) {
    if (event.key === 'Escape') {
        cancel();
    }
}
</script>

<template>
    <teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="cancel" @keydown="handleKeyDown">
            <div class="modal-content">
                <p class="modal-message">{{ message }}</p>
                <input
                    v-if="isInput"
                    ref="inputRef"
                    v-model="inputValue"
                    type="text"
                    placeholder="*****"
                    maxlength="10"
                    @keyup.enter="confirm"
                    @keydown.esc="cancel"
                />
                <div class="modal-buttons">
                    <button class="btn-cancel" @click="cancel">Отмена</button>
                    <button class="btn-confirm" @click="confirm">
                        {{ isInput ? 'Отправить' : 'Подтвердить' }}
                    </button>
                </div>
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

.modal-message {
    color: var(--color-heading);
    font-size: 16px;
    margin-bottom: 15px;
    line-height: 1.5;
    white-space: pre-line;
}

input {
    width: 100%;
    max-width: 350px;
    margin: 15px auto;
    padding: 10px 15px;
    line-height: 1.5;
    text-align: center;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 2px;
    background-color: var(--color-background);
    color: var(--color-text);
    outline: none;
    transition: border-color 0.2s ease;
}

input:focus {
    border-color: var(--vt-bt-background-color);
}

input::placeholder {
    font-size: 14px;
    opacity: 0.5;
    color: var(--color-text);
}

.modal-buttons {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: center;
}

.modal-buttons button {
    cursor: pointer;
    flex: 1;
    max-width: 170px;
    height: 40px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 2px;
    transition: background-color 0.2s ease;
}

.btn-confirm {
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
}

.btn-confirm:hover {
    background-color: var(--vt-bt-background-color-hover);
}

.btn-cancel {
    background-color: var(--vt-bt-cancel-background-color);
    color: var(--vt-bt-text-color);
}

.btn-cancel:hover {
    background-color: var(--vt-bt-cancel-background-color-hover);
}

@media (max-width: 700px) {
    .modal-content {
        width: 85%;
        padding: 20px;
    }

    .modal-message {
        font-size: 15px;
    }

    input {
        font-size: 15px;
    }

    .modal-buttons button {
        font-size: 13px;
        height: 38px;
    }
}

@media (max-width: 480px) {
    .modal-buttons {
        flex-direction: column;
        gap: 8px;
    }

    .modal-buttons button {
        max-width: 100%;
    }
}
</style>
