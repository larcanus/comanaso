<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
const isMobileWidth = (width) => width <= 750;
const mainDivWidth = ref(window.innerWidth * (isMobileWidth(window.innerWidth) ? 0.90 : 0.7));

function updateDivWidth() {
    mainDivWidth.value = window.innerWidth * (isMobileWidth(window.innerWidth) ? 0.9 : 0.7);
}

onMounted(() => {
    window.addEventListener('resize', updateDivWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateDivWidth);
});

// Данные таблицы
const data = ref([
    { id: 1, name: 'Item 1', status: 'Loading...', value: 10 },
    { id: 2, name: 'Item 2', status: 'Loading...', value: 20 },
// Добавьте больше данных по мере необходимости
]);

// Все возможные колонки
const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Value' },
    { key: 'value', label: 'Value' },
    { key: 'value', label: 'Value' },
    { key: 'value', label: 'Value' },
    { key: 'value', label: 'Value' },
    { key: 'value', label: 'Value' },
    { key: 'value', label: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
    { key: 'value', lllabel: 'Value' },
];

// Видимые колонки по умолчанию
const visibleColumns = ref(allColumns.map(column => column.key));

// Управление меню колонок
const showColumnMenu = ref(false);

function toggleColumnMenu() {
    showColumnMenu.value = !showColumnMenu.value;
}

// Текущая страница и количество строк на странице
const currentPage = ref(1);
const rowsPerPage = 10;

// Вычисляемые данные для отображения на текущей странице
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.value.slice(start, end);
});

// Общее количество страниц
const totalPages = computed(() => Math.ceil(data.value.length / rowsPerPage));

// Функция для переключения видимости колонок
function toggleColumn(columnKey) {
    if (visibleColumns.value.includes(columnKey)) {
        visibleColumns.value = visibleColumns.value.filter(key => key !== columnKey);
    } else {
        visibleColumns.value.push(columnKey);
    }
}

// Функция для получения метки колонки
function getColumnLabel(columnKey) {
    const column = allColumns.find(col => col.key === columnKey);
    return column ? column.label : '';
}

// Функция для сортировки данных по колонке
function sortByColumn(columnKey) {
    data.value.sort((a, b) => (a[columnKey] > b[columnKey] ? 1 : -1));
}

// Функции для переключения страниц
function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
}

// Пример обновления данных в ячейках
setTimeout(() => {
    data.value = data.value.map(item => ({
        ...item,
        status: 'Loaded',
    }));
}, 2000);
</script>

<template>
    <div class="table-controls">
        <button @click="toggleColumnMenu" class="edit-columns-button">✏️</button>
        <div v-if="showColumnMenu" class="column-menu">
            <div v-for="column in allColumns" :key="column.key" class="column-menu-item">
                <input
                    type="checkbox"
                    :checked="visibleColumns.includes(column.key)"
                    @change="toggleColumn(column.key)"
                />
                <label @click="toggleColumn(column.key)">
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
                    >
                        {{ getColumnLabel(column) }}
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="row in paginatedData" :key="row.id">
                    <td v-for="column in visibleColumns" :key="column">
                        {{ row[column] }}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
</template>

<style scoped>

.main-container {
    background-color: #246279;
    max-width: 1000px;
    min-width: 100px;
    border: 1px solid #d8000c;
    box-sizing: border-box;
    overflow-x: auto;
}

.table-container {
    display: flex;
}

.styled-table {
    border-collapse: collapse;
}

.styled-table thead {
    background-color: #f4f4f4;
    color: #333;
}

.styled-table th, .styled-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.styled-table th {
    cursor: pointer;
    font-weight: bold;
}

.styled-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
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

.column-menu-item input{
    margin: 0 12px 0 3px;
    cursor: pointer;
}
.column-menu-item label{
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

@media (max-width: 500px) {
    .table-controls {
        margin-right: 10px;
    }
}
</style>
