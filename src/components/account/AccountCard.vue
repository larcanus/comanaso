<script setup>
import { ref, defineProps, reactive } from 'vue';
import AccountStatus from '@/components/account/elements/AccountStatus.vue';
const props = defineProps({
    account: Object,
});
const state = reactive({
    isConnect: false,
    isEdit: false,
    id: 0,
    name: '',
    entity: '',
    apiId: null,
    apiHash: '',
    phoneNumber: '',
});

function onClickSave() {
    console.log('onClickSave');
    console.log(state.isEdit);
    state.isEdit = !state.isEdit;
}

function onClickEdit() {
    console.log('onClickEdit');
    console.log(state.isEdit);
    state.isEdit = !state.isEdit;
}
function onClickStart() {
    console.log('onClickStart');
    console.log(state.isConnect);
    state.isConnect = !state.isConnect;
}
</script>

<template>
    <div class="product-card">
        <div class="product-icon">
            <img src="@/assets/telegram.png" alt="account" />
            <AccountStatus />
        </div>
        <div class="product-details">
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="Название"
                v-model="state.name"
            />
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="App api_id"
                v-model="state.apiId"
            />
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="App api_hash"
                v-model="state.apiHash"
            />
            <input
                type="text"
                :disabled="!state.isEdit"
                placeholder="Номер телефона"
                v-model="state.phoneNumber"
            />
            <div class="buttons">
                <button v-if="state.isEdit" @click="onClickSave">
                    Сохранить
                </button>
                <button
                    v-if="!state.isEdit"
                    :disabled="state.isConnect"
                    @click="onClickEdit"
                >
                    Редактировать
                </button>
                <button
                    v-if="!state.isEdit"
                    :disabled="state.isConnect"
                    @click="onClickStart"
                >
                    Старт!
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    display: flex;
    flex-direction: row;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 2px;
    margin: 10px;
    box-sizing: border-box;
}

.product-icon {
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    place-items: center;
}

.product-icon img {
    width: 100px;
    height: 100px;
    border-radius: 2px;
}

.product-details {
    flex-grow: 1;
    padding-left: 10px;
    display: flex;
    flex-direction: column;
}

.product-details input {
    margin-bottom: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

input:disabled {
    background-color: #0c0c23;
    color: #cbcad0;
    border: 1px solid #ababab;
    cursor: not-allowed;
}

.buttons {
    display: flex;
    justify-content: space-between;
}

.buttons button:disabled {
    background-color: #2c3e50;
    color: #a6a5a5;
    cursor: not-allowed;
}
.buttons button:disabled:hover {
    background-color: #2c3e50;
}

.buttons button {
    padding: 5px 10px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 3px;
    cursor: pointer;
}

.buttons button:hover {
    background-color: #0056b3;
}

@media (max-width: 700px) {
    .product-card {
        flex-direction: column;
        align-items: center;
    }

    .product-details {
        padding-left: 0;
        width: 100%;
    }
}
</style>
