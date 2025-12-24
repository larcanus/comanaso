<script setup>
import { ref, computed, onMounted, onUnmounted, toRaw } from 'vue';
import useDialogStore from '@/store/dialogs.js';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth.js';

const dialogStore = useDialogStore();

const dialogState = ref(dialogStore.getPreparedDialogs());
const dialogsFiltered = ref(dialogState.value);
const tableHeaderLoc = computed(() => {
    if (dialogState.value.length === 0) {
        return 'Ваши диалоги';
    }

    return `Ваши диалоги: ${dialogState.value.length}`;
});
const allColumns = [
    { key: 'title', label: 'Наименование' },
    { key: 'type', label: 'Тип' },
    { key: 'id', label: 'Id' },
    { key: 'folderId', label: 'Папка' },
    { key: 'pinned', label: 'Закреплен' },
    { key: 'unreadCount', label: 'Непрочитанные' },
    { key: 'mute', label: 'Заглушен до' },
    { key: 'date', label: 'Дата обновления' },
    { key: 'creator', label: 'Вы создатель' },
    { key: 'archived', label: 'В архиве' },
];

const defaultVisibleColumns = allColumns.filter(
    (column) => !['creator', 'archived'].includes(column.key)
);

const visibleColumns = ref(defaultVisibleColumns.map((column) => column.key));
const showColumnMenu = ref(false);

// Динамический расчет ширины таблицы
const { width: tableWidth } = useResponsiveWidth({
    mobileBreakpoint: 750,
    desktopWidthRatio: 0.7,
    mobileWidthRatio: 0.9,
});

const appNode = computed(() => document.querySelector('#app'));

onMounted(() => {
    appNode.value?.addEventListener('click', hideColumnMenu);
});

onUnmounted(() => {
    appNode.value?.removeEventListener('click', hideColumnMenu);
});

function hideColumnMenu(e) {
    if (e.target.id && e.target.id.includes('column')) {
        return;
    }
    showColumnMenu.value = false;
}

function toggleColumnMenu() {
    showColumnMenu.value = !showColumnMenu.value;
}

const currentPage = ref(1);
const rowsPerPage = 10;

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const res = dialogsFiltered.value.slice(start, end);
    const preparedData = res.map((item) => toRaw(item));
    console.log('paginatedData', res, preparedData);
    return preparedData;
});

const totalPages = computed(() => Math.ceil(dialogsFiltered.value.length / rowsPerPage));

function toggleColumn(columnKey) {
    if (visibleColumns.value.includes(columnKey)) {
        visibleColumns.value = visibleColumns.value.filter((key) => key !== columnKey);
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

    dialogsFiltered.value.sort((a, b) => {
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
            case 'folderId': {
                if (sortDown) {
                    return first.value?.length > second.value?.length ? 1 : -1;
                }
                return first.value?.length < second.value?.length ? 1 : -1;
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

function handleSearchInput() {
    const query = searchQuery.value.toLowerCase().trim();

    if (!query) {
        dialogsFiltered.value = dialogState.value;
        return;
    }

    dialogsFiltered.value = dialogState.value.filter((item) => {
        const itemTitleValue = toRaw(item.title);
        return itemTitleValue.loc.toLowerCase().includes(query);
    });

    // Сбрасываем на первую страницу после поиска
    currentPage.value = 1;
}
</script>

<template>
    <div>
        <div class="header">
            <h3>{{ tableHeaderLoc }}</h3>
            <div class="search-container">
                <button class="search-button" @click="toggleSearch">🔍</button>
                <Transition name="fade">
                    <div v-if="showInput" class="search-input-wrapper">
                        <input
                            v-model="searchQuery"
                            type="text"
                            class="search-input"
                            placeholder="Поиск..."
                            @input="handleSearchInput"
                        />
                    </div>
                </Transition>
            </div>
        </div>
        <div id="table-controls" class="table-controls">
            <button id="edit-columns-button" class="edit-columns-button" @click="toggleColumnMenu">
                ✏️
            </button>
            <div v-if="showColumnMenu" id="column-menu" class="column-menu">
                <div v-for="column in allColumns" :key="column.key" class="column-menu-item">
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
        <div class="main-container" :style="{ width: tableWidth + 'px' }">
            <div class="table-container">
                <table class="styled-table">
                    <thead>
                        <tr>
                            <th
                                v-for="column in visibleColumns"
                                :id="column"
                                :key="column"
                                @click="sortByColumn(column)"
                            >
                                {{ getColumnLabel(column) }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in paginatedData" :key="row.id.value">
                            <td v-for="column in visibleColumns" :id="column" :key="column">
                                {{ row[column].loc }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="pagination">
            <button :disabled="currentPage === 1" @click="prevPageToStart">&laquo;</button>
            <button :disabled="currentPage === 1" @click="prevPage">&lt;</button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages || totalPages === 0" @click="nextPage">
                &gt;
            </button>
            <button
                :disabled="currentPage === totalPages || totalPages === 0"
                @click="nextPageToEnd"
            >
                &raquo;
            </button>
        </div>
    </div>
</template>

<style scoped>
.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1px;
    padding: 12px 20px;
    margin: 10px 0 5px 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h3 {
    color: #ffffff;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
}

.search-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-button {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 1px;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 6px 10px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.search-button:hover {
    background: rgba(255, 255, 255, 0.35);
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
}

.search-input-wrapper {
    overflow: hidden;
    white-space: nowrap;
}

.search-input {
    width: 200px;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.9);
    color: #2c3e50;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
}

.search-input::placeholder {
    color: rgba(44, 62, 80, 0.6);
}

.search-input:focus {
    background: #ffffff;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.main-container {
    box-sizing: border-box;
    overflow-x: auto;
    border-radius: 1px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.styled-table {
    border-collapse: collapse;
}

.styled-table thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.styled-table thead th {
    color: #ffffff;
    font-weight: 600;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.styled-table th,
.styled-table td {
    border: 1px solid rgba(102, 126, 234, 0.2);
    padding: 12px;
    text-align: center;
}

.styled-table tbody td {
    color: #2c3e50;
    font-weight: 500;
}

.styled-table th {
    cursor: pointer;
}

.styled-table tbody tr {
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
}

.styled-table tbody tr:nth-child(even) {
    background-color: #ffffff;
}

.styled-table tbody tr:hover {
    background-color: #e3e7ff;
}

.table-controls {
    align-self: end;
    position: relative;
}

.edit-columns-button {
    position: absolute;
    top: -10px;
    right: -10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    font-size: 16px;
    z-index: 901;
    transition: all 0.3s ease;
}

.edit-columns-button:hover {
    background: linear-gradient(135deg, #7c8ef5 0%, #8a5bb3 100%);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.column-menu {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: white;
    color: var(--vt-c-black-soft);
    border: 1px solid #ddd;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 1px;
    z-index: 900;
}

.column-menu-item {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    margin: 4px 0 6px 0;
}

.column-menu-item input {
    margin: 0 12px 0 3px;
    cursor: pointer;
}

.column-menu-item label {
    cursor: pointer;
}

.pagination {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.pagination button {
    padding: 10px 16px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 1px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    min-width: 44px;
    min-height: 44px;
}

.pagination button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pagination button:disabled {
    background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
    box-shadow: none;
}

.pagination .page-info {
    padding: 0 12px;
    font-weight: 500;
    color: var(--color-heading);
    font-size: 15px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    .header {
        flex-wrap: wrap;
        padding: 10px 15px;
    }

    .header h3 {
        font-size: 18px;
        flex: 1 1 auto;
    }

    .search-container {
        flex: 0 1 auto;
    }

    .search-input {
        width: 150px;
    }

    .pagination {
        gap: 6px;
    }

    .pagination button {
        padding: 12px 18px;
        font-size: 18px;
        min-width: 50px;
        min-height: 50px;
    }

    .pagination .page-info {
        font-size: 14px;
        padding: 0 8px;
    }

    .styled-table th,
    .styled-table td {
        padding: 10px 8px;
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .header {
        padding: 10px;
        gap: 8px;
    }

    .header h3 {
        font-size: 16px;
        flex: 1 1 100%;
        text-align: center;
    }

    .search-container {
        flex: 1 1 100%;
        justify-content: center;
    }

    .search-input {
        width: 120px;
    }

    .search-input {
        font-size: 13px;
    }

    .pagination button {
        padding: 14px 20px;
        font-size: 20px;
        min-width: 54px;
        min-height: 54px;
    }

    .pagination .page-info {
        font-size: 13px;
    }

    .styled-table th,
    .styled-table td {
        padding: 8px 6px;
        font-size: 13px;
    }
}
</style>
