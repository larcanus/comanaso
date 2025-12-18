<script setup>
import { computed, ref } from 'vue';
import useAccountStore from '@/store/account.js';

const props = defineProps({
    selectedAccountId: {
        type: Number,
        default: null,
    },
});

const emit = defineEmits(['account-selected']);

const accountStore = useAccountStore();

const accounts = computed(() => {
    return accountStore.accountIds.map((id) => ({
        id: Number(id),
        name: accountStore.getAccountName(id),
        status: accountStore.getAccountStatus(id),
    }));
});

const selectedAccount = computed(() => {
    if (!props.selectedAccountId) return null;
    return accounts.value.find((acc) => acc.id === props.selectedAccountId);
});

const isDropdownOpen = ref(false);

function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
}

function selectAccount(accountId) {
    emit('account-selected', Number(accountId));
    isDropdownOpen.value = false;
}

function getStatusColor(status) {
    switch (status) {
        case 'online':
            return '#4caf50';
        case 'offline':
            return '#9e9e9e';
        case 'error':
            return '#f44336';
        default:
            return '#ff9800';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'online':
            return 'Онлайн';
        case 'offline':
            return 'Оффлайн';
        case 'error':
            return 'Ошибка';
        default:
            return 'Неизвестно';
    }
}
</script>

<template>
    <div class="account-selector">
        <div class="selector-label">Аккаунт:</div>
        <div class="dropdown-container">
            <button class="dropdown-button" @click="toggleDropdown">
                <span v-if="selectedAccount" class="selected-account">
                    <span
                        class="status-indicator"
                        :style="{ backgroundColor: getStatusColor(selectedAccount.status) }"
                    ></span>
                    {{ selectedAccount.name || `Аккаунт #${selectedAccount.id}` }}
                </span>
                <span v-else class="placeholder">Выберите аккаунт</span>
                <span class="arrow" :class="{ open: isDropdownOpen }">▼</span>
            </button>

            <Transition name="dropdown">
                <div v-if="isDropdownOpen" class="dropdown-menu">
                    <div
                        v-for="account in accounts"
                        :key="account.id"
                        class="dropdown-item"
                        :class="{ active: account.id === selectedAccountId }"
                        @click="selectAccount(account.id)"
                    >
                        <span
                            class="status-indicator"
                            :style="{ backgroundColor: getStatusColor(account.status) }"
                            :title="getStatusText(account.status)"
                        ></span>
                        <span class="account-name">
                            {{ account.name || `Аккаунт #${account.id}` }}
                        </span>
                        <span class="account-status">{{ getStatusText(account.status) }}</span>
                    </div>
                    <div v-if="accounts.length === 0" class="dropdown-empty">
                        Нет доступных аккаунтов
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.account-selector {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0;
    width: 100%;
    max-width: 400px;
    min-width: 300px;
}

.selector-label {
    color: #e3e2e2;
    font-size: 14px;
    font-weight: 500;
}

.dropdown-container {
    position: relative;
}

.dropdown-button {
    width: 100%;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s ease;
}

.dropdown-button:hover {
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.dropdown-button:active {
    transform: translateY(0);
}

.selected-account {
    display: flex;
    align-items: center;
    gap: 10px;
}

.placeholder {
    color: rgba(255, 255, 255, 0.7);
}

.arrow {
    transition: transform 0.3s ease;
    font-size: 12px;
    margin-left: 30px;
}

.arrow.open {
    transform: rotate(180deg);
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: white;
    border-radius: 2px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ccc;
}

.dropdown-item {
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.2s ease;
    color: #333;
}

.dropdown-item:hover {
    background-color: #f5f5f5;
}

.dropdown-item.active {
    background-color: #e3f2fd;
}

.account-name {
    flex: 1;
    font-weight: 500;
}

.account-status {
    font-size: 12px;
    color: #666;
}

.dropdown-empty {
    padding: 20px;
    text-align: center;
    color: #999;
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s ease;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@media (max-width: 750px) {
    .account-selector {
        max-width: 100%;
    }

    .dropdown-button {
        font-size: 14px;
        padding: 10px 14px;
    }

    .account-status {
        display: none;
    }
}
</style>
