<script setup>
import { Pie } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
} from 'chart.js';
import { computed, onMounted, onUnmounted, onUpdated, ref } from 'vue';
import useDialogStore from '@/store/dialogs.js';
import { getStaticAnalyticsByDialogType } from '@/utils/dialogAnalytics.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);
const dialogStore = useDialogStore();
const dialogState = ref(dialogStore.getPreparedDialogs());

dialogStore.$onAction(({ name, after }) => {
    after(() => {
        if (name === 'setDialogs') {
            console.log('$onAction', name, after);
            dialogState.value = dialogStore.getPreparedDialogs();

            state.value.chartData = {
                labels: getLabels(),
                datasets: [
                    {
                        data: chartDatasetsData.value ?? [1, 0, 0, 0, 0],
                        backgroundColor: getColor(),
                    },
                ],
            };
        }
    });
});

const windowWith = computed(() => {
    return window.innerWidth;
});

const analyticsText = computed(() => {
    return getStaticAnalyticsByDialogType(dialogsAgregateType.value);
});

const dialogsAgregateType = computed(() => {
    if (dialogState.value.length === 0) {
        return null;
    }

    const data = {
        channel: 0,
        groupOpen: 0,
        groupClose: 0,
        user: 0,
    };

    dialogState.value.forEach((dialog) => {
        const type = dialog.type.value;

        if (type.isGroup && type.isChannel) {
            data.groupOpen += 1;

            return;
        }

        if (type.isChannel) {
            data.channel += 1;

            return;
        }

        if (type.isGroup) {
            data.groupClose += 1;

            return;
        }

        if (type.isUser) {
            data.user += 1;
        }
    });

    return data;
});
const chartDatasetsData = computed(() => {
    const data = dialogsAgregateType.value;
    if (!data) {
        return null;
    }

    return isMobileWidth(windowWith.value)
        ? [data.groupOpen, data.channel, data.groupClose, data.user]
        : [data.channel, data.groupOpen, data.groupClose, data.user];
});

onMounted(() => {
    subscribeEventListeners();
});

onUnmounted(() => {
    unsubscribeEventListeners();
});

function subscribeEventListeners() {
    window.addEventListener('resize', updateDivWidth);
}

function unsubscribeEventListeners() {
    window.removeEventListener('resize', updateDivWidth);
}

const isMobileWidth = (width) => width <= 750;

function updateDivWidth() {
    state.value.chartOptions.plugins.legend.position = getPositionLegend();
}

function getPositionLegend() {
    return isMobileWidth(windowWith.value) ? 'bottom' : 'left';
}

function getLabels() {
    if (dialogState.value.length === 0) {
        return ['пока нет данных'];
    }

    return isMobileWidth(windowWith.value)
        ? ['групповые открытые', 'каналы', 'групповые закрытые', 'личные']
        : ['каналы', 'групповые открытые', 'групповые закрытые', 'личные'];
}

function getColor() {
    return isMobileWidth(windowWith.value)
        ? ['#cc64f5', '#64adf5', '#64f586', '#ec6060']
        : ['#64adf5', '#cc64f5', '#64f586', '#ec6060'];
}

onUpdated(() => {
    console.log('updated chart');
});

const state = ref({
    chartData: {
        labels: getLabels(),
        datasets: [
            {
                data: chartDatasetsData.value ?? [1, 0, 0, 0, 0],
                backgroundColor: getColor(),
            },
        ],
    },
    chartOptions: {
        responsive: true,
        borderWidth: 1,
        plugins: {
            legend: {
                position: getPositionLegend(),
                labels: {
                    boxWidth: 14,
                    boxHeight: 14,
                },
            },
        },
    },
});

function onClick() {
    console.log('onClick');
}
</script>

<template>
    <div class="dialog-pie-container" @click="onClick">
        <div ref="chart-pie" class="chart-pie-container">
            <Pie id="dialog-pie" :options="state.chartOptions" :data="state.chartData" />
        </div>
        <div class="chart-desc-container">
            <p class="responsive-text">
                {{ analyticsText }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.dialog-pie-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chart-pie-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    justify-items: center;
    justify-self: center;
    flex: 1.5;
    height: 70vh;
    width: 70vw;
    margin-top: 5%;
}

.chart-desc-container {
    display: flex;
    flex: 1;
    background-color: #364fa1;
    width: 90%;
    height: 90%;
}

.chart-desc-container {
    display: grid;
    place-items: center;
    border: 2px solid #333;
    padding: 20px;
    margin: 10px;
    max-width: 100%;
    box-sizing: border-box;
}

.responsive-text {
    font-size: 0.7rem;
    text-align: center;
    margin: 0;
}

@media (min-width: 1100px) {
    .responsive-text {
        font-size: 0.75rem;
    }

    .dialog-pie-container {
        flex-direction: row;
    }

    .chart-pie-container {
        height: 50vh;
        width: 50vw;
        margin: 0;
    }
}

@media (min-width: 1000px) {
    .responsive-text {
        font-size: 0.8rem;
    }

    .chart-pie-container {
        height: 45vh;
        width: 45vw;
        margin: 0;
    }
}

@media (min-width: 700px) {
    .responsive-text {
        font-size: 0.9rem;
    }
}

@media (min-width: 700px) and (orientation: landscape) {
    .chart-pie-container {
        height: 90vh;
        width: 80vw;
        flex: none;
        margin-top: 2%;
    }
}

@media (min-width: 1100px) and (orientation: landscape) {
    .chart-pie-container {
        height: 50vh;
        width: 50vw;
        flex: none;
        margin-top: 0;
    }
}
</style>
