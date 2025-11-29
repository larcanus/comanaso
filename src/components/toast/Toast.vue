<script setup>
import { reactive } from 'vue';
import okImagePath from '@/assets/circle-ok.png';
import errorImagePath from '@/assets/circle-error.png';
import useToastStore from '@/store/toast.js';
const toastStore = useToastStore();
const state = reactive({
    toasts: toastStore.state,
});

toastStore.$subscribe((mutation, store) => {
    if (mutation.events.type === 'set') {
        state.toasts = store.state;
    }
});

function getImagePath(type) {
    switch (type) {
        case 'ok':
            return okImagePath;
        case 'error':
            return errorImagePath;
        default:
            return errorImagePath;
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition name="toast">
            <div v-if="state.toasts.length" class="toaster">
                <TransitionGroup name="toast" tag="ul">
                    <li
                        v-for="toast in state.toasts"
                        :key="toast.text"
                        class="toast"
                        :class="`toast-type-${toast.type}`"
                    >
                        <img :src="getImagePath(toast.type)" alt="status-icon" class="icon" />
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

.toast {
    display: flex;
    flex-direction: row;
    list-style-type: none;
    padding: 0.5rem;

    opacity: 0.9;
    border-radius: 2px;
    margin: 10px;
    text-align: center;
    place-items: center;
    max-width: 350px;
    width: 50rem;
    white-space: break-spaces;
}

span {
    color: var(--vt-c-white-soft);
}

.toast-type-error {
    background-color: #d0363e;
}
.toast-type-ok {
    background-color: #42e362;
}
.toast-type-info {
    background-color: #d8a600;
}

.icon {
    width: 1rem;
    height: 1rem;
    margin: 0.5rem;
}
</style>
