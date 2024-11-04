<script setup>
import { ref } from 'vue';
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

function confirm() {
    if (props.isInput === true) {
        return emit('confirm', inputValue.value);
    }

    return emit('confirm', true);
}

function cancel() {
    emit('cancel');
}
</script>

<template>
    <teleport to="body">
        <div v-if="isVisible" class="modal-overlay">
            <div class="modal-content">
                <p>{{ message }}</p>
                <input
                    v-if="isInput"
                    v-model="inputValue"
                    type="text"
                    placeholder="*****"
                    maxlength="10"
                    @keyup.enter="confirm"
                />
                <div class="modal-buttons">
                    <button @click="cancel" class="cancel">Отмена</button>
                    <button @click="confirm">Отправить</button>
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
    width: 40%;
    max-width: 500px;
    text-wrap: wrap;
    color: #030101;
}

input {
    justify-self: center;
    align-self: center;
    width: 70%;
    margin: 20px;
    line-height: 2;
    text-align: center;
    font-size: 16px;
    --un-placeholder-opacity: 0.3;
}

input::placeholder {
    font-size: 1em;
    opacity: 0.4;
}

.modal-buttons {
    margin-top: 10px;
    display: flex;
    flex-direction: row;
}

.modal-buttons button {
    margin: 0 5px;
}

button {
    cursor: pointer;
    width: 50%;
    max-width: 70%;
    height: max-content;
    padding: 2px;
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
    border-radius: 2px;
}

button:hover {
    background-color: var(--vt-bt-background-color-hover);
}

.cancel {
    background-color: var(--vt-bt-cancel-background-color);
}
.cancel:hover {
    background-color: var(--vt-bt-cancel-background-color-hover);
}

@media (max-width: 700px) {
    .modal-content {
        width: 70%;
    }
}
</style>
