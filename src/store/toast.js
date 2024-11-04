import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOAST_TIME = 3000;

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

    function hiddenToastHandler(id, state) {
        setTimeout(() => {
            state.value = state.value.filter((item) => {
                return item.id !== id;
            });
        }, TOAST_TIME);
    }

    return { state, addToast };
});

export default useToastStore;
