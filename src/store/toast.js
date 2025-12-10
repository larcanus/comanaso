import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOAST_TIME = 4000;

export const useToastStore = defineStore('toast', () => {
    const state = ref([]);

    function addToast(type, text) {
        this.state.push(preparedToast(type, text));
    }

    function preparedToast(type, text) {
        const toastId = Math.floor(Math.random() * 1000);
        hiddenToastHandler(toastId, state);
        return { type, text, id: toastId };
    }

    function removeToast(toast) {
        state.value = state.value.filter((item) => item.id !== toast.id);
    }

    function hiddenToastHandler(id, state) {
        setTimeout(() => {
            state.value = state.value.filter((item) => {
                return item.id !== id;
            });
        }, TOAST_TIME);
    }

    return { state, addToast, removeToast };
});

export default useToastStore;
