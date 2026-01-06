import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOAST_TIME = 4000;
const VALID_TOAST_TYPES = ['ok', 'success', 'error', 'warning', 'info'];

export const useToastStore = defineStore('toast', () => {
    const state = ref([]);

    function addToast(type, text) {
        // Валидация типа
        if (!VALID_TOAST_TYPES.includes(type)) {
            console.warn(`[Toast] Invalid toast type: "${type}". Using "info" as fallback.`);
            type = 'info';
        }

        // Валидация текста
        if (!text || typeof text !== 'string') {
            console.warn('[Toast] Invalid toast text. Toast not added.');
            return;
        }

        const toast = preparedToast(type, text);
        state.value.push(toast);
    }

    function preparedToast(type, text) {
        const toastId = Date.now() + Math.random();
        hiddenToastHandler(toastId);
        return { type, text, id: toastId };
    }

    function removeToast(toastId) {
        state.value = state.value.filter((item) => item.id !== toastId);
    }

    function hiddenToastHandler(id) {
        setTimeout(() => {
            removeToast(id);
        }, TOAST_TIME);
    }

    function clear() {
        state.value = [];
    }

    return { state, addToast, removeToast, clear };
});

export default useToastStore;
