<script setup>
import Confirm from '@/components/modal/Confirm.vue';
import { reactive, computed } from 'vue';

const props = defineProps({
    isDisabled: {
        type: Boolean,
        default: false,
    },
});

const state = reactive({
    isModalConfirmVisible: false,
    modalConfirmMessage: '',
    isGettingData: false,
});

const emit = defineEmits(['refresh']);

const isButtonDisabled = computed(() => props.isDisabled || state.isGettingData);

async function onClickContainer() {
    // Если кнопка отключена - ничего не делаем
    if (isButtonDisabled.value) {
        return;
    }

    const resultConfirm = await showConfirm();
    if (resultConfirm) {
        state.isGettingData = true;

        try {
            // Эмитим событие только после подтверждения
            emit('refresh');

            // Ждем завершения операции (можно настроить таймаут)
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } finally {
            state.isGettingData = false;
        }
    }
}

let resolveConfirmPromise;
function showConfirm() {
    state.modalConfirmMessage =
        'Вы действительно хотите обновить данные? Это может занять некоторое время.';
    state.isModalConfirmVisible = true;

    return new Promise((resolve) => {
        resolveConfirmPromise = resolve;
    });
}

function handleConfirmOk() {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(true);
}

function handleConfirmCancel() {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(false);
}
</script>

<template>
    <div class="container" :class="{ disabled: isButtonDisabled }" @click="onClickContainer">
        <img
            src="@/assets/refresh.png"
            alt="update"
            class="button-img"
            :class="{ getting: state.isGettingData, disabled: isButtonDisabled }"
        />
    </div>
    <Confirm
        :message="state.modalConfirmMessage"
        :is-visible="state.isModalConfirmVisible"
        :is-input="false"
        @confirm="handleConfirmOk"
        @cancel="handleConfirmCancel"
    />
</template>

<style scoped>
.container {
    margin: 55px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.container.disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.button-img {
    width: 50px;
    height: 50px;
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}

.button-img.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@keyframes rotate360 {
    to {
        transform: rotate(360deg);
    }
}

.getting {
    animation: 2s rotate360 infinite linear;
}

.button-img:not(.disabled):active {
    transform: scale(1.2);
}
</style>
