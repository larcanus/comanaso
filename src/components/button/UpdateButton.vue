<script setup>
import Confirm from '@/components/modal/Confirm.vue';
import { reactive } from 'vue';
import { getCommonData } from '@/utils/connection.js';
import useConnectionStore from '@/store/connection.js';
import useDialogStore from '@/store/dialogs.js';
import useToastStore from '@/store/toast.js';
const state = reactive({
        isModalConfirmVisible: false,
        modalConfirmMessage: '',
        isGettingData: false,
});

async function onClickContainer() {
    if(state.isGettingData)
    {
        return;
    }

    const resultConfirm = await showConfirm();
    if(resultConfirm)
    {
        state.isGettingData = true;

        const connection = useConnectionStore();
        const dialogStore = useDialogStore();
        const toastStore = useToastStore();
        const client = await connection.getClientByAccountId(null);
        await getCommonData(client, dialogStore, toastStore)

        state.isGettingData = false;
    }
}

let resolveConfirmPromise;
function showConfirm() {
    state.modalConfirmMessage = 'Вы действительно хотите сделать повторный запрос данных? Текущие будут удалены.';
    state.isModalConfirmVisible = true;

    return new Promise((resolve) => {
        resolveConfirmPromise = resolve;
    });
}

function handleConfirmOk(inputValue) {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(inputValue);
}

function handleConfirmCancel() {
    state.isModalConfirmVisible = false;
    resolveConfirmPromise(false);
}
</script>

<template>
    <div class="container" @click="onClickContainer">
        <img src="@/assets/refresh.png" alt="update" class="button-img" :class="{getting: state.isGettingData}"/>
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
}
.button-img {
    width: 50px;
    height: 50px;

}
@keyframes rotate360 {
    to { transform: rotate(360deg); }
}

.getting {
    animation: 2s rotate360 infinite linear;
}

.button-img:active {
    transform: scale(1.2);
}
</style>
