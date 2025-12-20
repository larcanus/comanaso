<script setup>
import okImagePath from '@/assets/circle-ok.png';
import errorImagePath from '@/assets/circle-error.png';
import useToastStore from '@/store/toast.js';

const toastStore = useToastStore();

function getImagePath(type) {
    switch (type) {
        case 'success':
            return okImagePath;
        case 'error':
            return errorImagePath;
        case 'warning':
            return okImagePath;
        case 'info':
            return okImagePath;
        default:
            return errorImagePath;
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition name="toast">
            <div v-if="toastStore.state.length" class="toaster">
                <TransitionGroup name="toast" tag="ul">
                    <li
                        v-for="toast in toastStore.state"
                        :key="toast.id"
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
    border-radius: 8px;
    margin: 10px;
    text-align: center;
    place-items: center;
    max-width: 350px;
    width: 50rem;
    white-space: break-spaces;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    /* Default стили если тип не распознан */
    background-color: #424242;
    border: 2px solid #303030;
}

span {
    color: var(--vt-c-white-soft);
    font-weight: 500;
}

.toast-type-error {
    background-color: #d0363e;
    border: 2px solid #a02830;
}

.toast-type-success {
    background-color: #42e362;
    border: 2px solid #35b34f;
}

.toast-type-warning {
    background-color: #ff9800;
    border: 2px solid #e68900;
}

.toast-type-info {
    background-color: #2196f3;
    border: 2px solid #1976d2;
}

.icon {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0.5rem;
    flex-shrink: 0;
}
</style>
