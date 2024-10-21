<script setup>
import { reactive } from 'vue';
import useToastStore from '@/store/toast.js';
const toastStore = useToastStore();
const state = reactive({
    toasts: toastStore.state,
});

toastStore.$subscribe((mutation, store) => {
    if(mutation.events.type === 'set') {
        state.toasts = store.state;
    }
})

</script>

<template>
    <Teleport to="body">
        <Transition name="toast">
            <div v-if="state.toasts.length" class="toaster">
                <TransitionGroup name="toast" tag="ul">
                    <li
                        v-for="toast in state.toasts"
                        :key="toast.text"
                    >
                        <span>
                            {{ toast.text }}
                        </span>
                    </li>
                </TransitionGroup>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.toast-enter-from,
.toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
    transition: 0.25s ease all;
}

.toaster {
    position: fixed;
    bottom: 3%;
    right: 5%;

    z-index: 100;

    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
