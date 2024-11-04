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
});

async function onClickContainer() {
    const resultConfirm = await showConfirm();
    if(resultConfirm)
    {
        const connection = useConnectionStore();
        const dialogStore = useDialogStore();
        const toastStore = useToastStore();
        const client = await connection.getClientByAccountId(null);

        const res = await getCommonData(client, dialogStore, toastStore)
        console.log('res',res);
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
        <img src="@/assets/refresh.png" alt="update" class="button-img" />
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

.button-img:active {
    transform: scale(1.2);
}
</style>
