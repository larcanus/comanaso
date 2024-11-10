<script setup>
import { ref, computed, onMounted, onUnmounted, toRaw, shallowRef } from 'vue';
import useDialogStore from '@/store/dialogs.js';

const dialogStore = useDialogStore();

const dialogState = ref(dialogStore.validateDialogs(dialogStore.state));

const allColumns = [
    { key: 'title', label: 'Наименование' },
    { key: 'archived', label: 'В архиве' },
    { key: 'type', label: 'Тип' },
    { key: 'id', label: 'Id' },
    { key: 'folderId', label: 'Папка' },
    { key: 'pinned', label: 'Закреплен' },
    { key: 'unreadCount', label: 'Непрочитанные' },
    { key: 'mute', label: 'Заглушен до' },
    { key: 'date', label: 'Дата обновления' },
    { key: 'creator', label: 'Вы создатель' },
];

const defaultVisibleColumns = allColumns.filter((column) => !['creator'].includes(column.key));

const visibleColumns = ref(defaultVisibleColumns.map((column) => column.key));
const showColumnMenu = ref(false);

const isMobileWidth = (width) => width <= 750;
const mainDivWidth = ref(
    window.innerWidth * (isMobileWidth(window.innerWidth) ? 0.9 : 0.7),
);

function updateDivWidth() {
    mainDivWidth.value =
        window.innerWidth * (isMobileWidth(window.innerWidth) ? 0.9 : 0.7);
}

const appNode = computed(() => document.querySelector('#app'));
onMounted(() => {
    subscribeEventListeners();
});

onUnmounted(() => {
    unsubscribeEventListeners();
});

function subscribeEventListeners() {
    window.addEventListener('resize', updateDivWidth);
    appNode.value.addEventListener('click', hideColumnMenu);
}

function unsubscribeEventListeners() {
    window.removeEventListener('resize', updateDivWidth);
    appNode.value.removeEventListener('click', hideColumnMenu);
}

dialogStore.$onAction(({ name, after }) => {
    after((result) => {
        if (name === 'setDialogs') {
            dialogState.value = dialogStore.validateDialogs(result);
        }
    });
});

function hideColumnMenu(e) {
    if (e.target.id && e.target.id.includes('column')) {
        return;
    }
    showColumnMenu.value = false;
}

onUnmounted(() => {
    window.removeEventListener('resize', updateDivWidth);
});

function toggleColumnMenu() {
    showColumnMenu.value = !showColumnMenu.value;
}

const currentPage = ref(1);
const rowsPerPage = 10;

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const res = dialogState.value.slice(start, end);
    const preparedData = res.map((item) => toRaw(item));
    console.log('paginatedData', res, preparedData);
    return preparedData;
});

const totalPages = computed(() =>
    Math.ceil(dialogState.value.length / rowsPerPage),
);

function toggleColumn(columnKey) {
    if (visibleColumns.value.includes(columnKey)) {
        visibleColumns.value = visibleColumns.value.filter(
            (key) => key !== columnKey,
        );
    } else {
        visibleColumns.value.push(columnKey);
    }
}

function getColumnLabel(columnKey) {
    const column = allColumns.find((col) => col.key === columnKey);
    return column ? column.label : '';
}

const sortState = ref({
    sortDown: true,
});

function sortByColumn(columnKey) {
    const sortDown = sortState.value.sortDown;

    dialogState.value.sort((a, b) => {
        const first = toRaw(a[columnKey]);
        const second = toRaw(b[columnKey]);
        switch (columnKey) {
            case 'type':
            case 'title': {
                if (sortDown) {
                    return first.loc[0] > second.loc[0] ? 1 : -1;
                }
                return first.loc[0] < second.loc[0] ? 1 : -1;
            }
            case 'date':
            case 'mute':
            case 'unreadCount': {
                if (sortDown) {
                    return first.value > second.value ? 1 : -1;
                }
                return first.value < second.value ? 1 : -1;
            }
            /* boolean */
            case 'creator':
            case 'archived':
            case 'pinned': {
                if (sortDown) {
                    return first.value ? 1 : -1;
                }
                return second.value ? 1 : -1;
            }
            default: {
                if (sortDown) {
                    return first.value > second.value ? 1 : -1;
                }
                return first.value < second.value ? 1 : -1;
            }
        }
    });
    sortState.value.sortDown = !sortState.value.sortDown;
}

function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
}

function prevPageToStart() {
    if (currentPage.value > 1) {
        currentPage.value = 1;
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
}

function nextPageToEnd() {
    if (currentPage.value < totalPages.value) {
        currentPage.value = totalPages.value;
    }
}

const showInput = ref(false);
const searchQuery = ref('');

function toggleSearch() {
    showInput.value = !showInput.value;
    if (showInput.value === false) {
        searchQuery.value = '';
    }
}

function handleInput() {
    console.log('Текущий текст поиска:', searchQuery.value);
}
</script>

<template>
    <div>
        <div class="header-table-wrapper">
            <div class="header">
                <h3>Ваши диалоги</h3>
            </div>
            <div class="search-container">
                <button @click="toggleSearch" class="search-button">
                    🔍
                </button>
                <Transition name="fade">
                    <input
                        v-if="showInput"
                        type="text"
                        class="search-input"
                        v-model="searchQuery"
                        @input="handleInput"
                        placeholder="Введите текст для поиска..."
                    />
                </Transition>
            </div>
        </div>
        <div class="table-controls" id="table-controls">
            <button
                @click="toggleColumnMenu"
                id="edit-columns-button"
                class="edit-columns-button"
            >
                ✏️
            </button>
            <div v-if="showColumnMenu" id="column-menu" class="column-menu">
                <div
                    v-for="column in allColumns"
                    :key="column.key"
                    class="column-menu-item"
                >
                    <input
                        :id="`column-menu-input-${column.key}`"
                        type="checkbox"
                        :checked="visibleColumns.includes(column.key)"
                        @change="toggleColumn(column.key)"
                    />
                    <label
                        :id="`column-menu-input-${column.key}`"
                        :for="`column-menu-input-${column.key}`"
                    >
                        {{ column.label }}
                    </label>
                </div>
            </div>
        </div>
        <div class="main-container" :style="{ width: mainDivWidth + 'px' }">
            <div class="table-container">
                <table class="styled-table">
                    <thead>
                    <tr>
                        <th
                            v-for="column in visibleColumns"
                            :key="column"
                            @click="sortByColumn(column)"
                            :id="column"
                        >
                            {{ getColumnLabel(column) }}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="row in paginatedData" :key="row.id.value">
                        <td
                            v-for="column in visibleColumns"
                            :key="column"
                            :id="column"
                        >
                            {{ row[column].loc }}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="pagination">
            <button @click="prevPageToStart" :disabled="currentPage === 1">
                <<
            </button>
            <button @click="prevPage" :disabled="currentPage === 1"><</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button
                @click="nextPage"
                :disabled="currentPage === totalPages || totalPages === 0"
            >
                >
            </button>
            <button
                @click="nextPageToEnd"
                :disabled="currentPage === totalPages || totalPages === 0"
            >
                >>
            </button>
        </div>
    </div>
</template>

<style scoped>
.header-table-wrapper {
    display: flex;
    flex-direction: column;
}

.header {
    align-items: center;
    align-content: center;
    text-align: center;
    justify-self: center;
    color: var(--vt-c-white-mute_x2);
    margin: 10px 0 5px 0;
}

.main-container {
    max-width: 1000px;
    min-width: 100px;
    box-sizing: border-box;
    overflow-x: auto;
}

.table-container {
    display: flex;
    flex-direction: column;
}

.styled-table {
    border-collapse: collapse;
}

.styled-table thead {
    background-color: #ada1af;
    color: #333;
}

.styled-table th,
.styled-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
    color: var(--vt-c-black-soft);
}

#date,
#mute {
    text-wrap: nowrap;
    white-space: nowrap;
}

.styled-table th {
    cursor: pointer;
    font-weight: bold;
    white-space: nowrap;
}

.styled-table tbody tr {
    background-color: #e7e5e8;
}

.table-controls {
    align-self: end;
    position: relative;
}

.edit-columns-button {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    z-index: 901;
}

.column-menu {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: white;
    color: var(--vt-c-black-soft);
    border: 1px solid #ddd;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 900;
}

.column-menu-item {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    margin: 2px 0 5px 0;
}

.column-menu-item input {
    margin: 0 12px 0 3px;
    cursor: pointer;
}

.column-menu-item label {
    cursor: pointer;
}

.pagination {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.pagination button {
    margin: 0 5px;
}

.search-container {
    display: flex;
    align-items: center;
    position: relative;
}

.search-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
}

.search-input {
    margin-left: 10px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 2px;
    width: 200px;
    overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
    transition: width 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    width: 0;
}

.fade-enter-to,
.fade-leave-from {
    width: 200px;
}

</style>
