<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import ChartInfoButton from '@/components/common/ChartInfoButton.vue';
import { CHART_DESCRIPTIONS } from '@/constants/chartDescriptions.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const { groupsAgeTimeline } = useDialogAnalytics();

const chartData = computed(() => ({
    labels: groupsAgeTimeline.value.labels,
    datasets: [
        {
            label: 'Группы',
            data: groupsAgeTimeline.value.groups,
            borderColor: 'rgba(204, 100, 245, 1)',
            backgroundColor: 'rgba(204, 100, 245, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(204, 100, 245, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
        },
        {
            label: 'Каналы',
            data: groupsAgeTimeline.value.channels,
            borderColor: 'rgba(100, 245, 134, 1)',
            backgroundColor: 'rgba(100, 245, 134, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(100, 245, 134, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
        },
    ],
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#ecf0f1',
                font: { size: 13 },
                padding: 15,
                usePointStyle: true,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            titleColor: '#ecf0f1',
            bodyColor: '#bdc3c7',
            borderColor: 'rgba(52, 152, 219, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
                label: (context) => {
                    return `${context.dataset.label}: ${context.parsed.y} шт.`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false,
            },
            ticks: {
                color: '#bdc3c7',
                font: { size: 12 },
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false,
            },
            ticks: {
                color: '#bdc3c7',
                font: { size: 12 },
                stepSize: 1,
            },
        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
};

const chartInfo = CHART_DESCRIPTIONS.groupsAge;
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <div class="title-row">
                <h3 class="chart-title">Активность сообществ по годам</h3>
                <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
            </div>
        </div>
        <div v-if="groupsAgeTimeline.total > 0" class="chart-container">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
            <p>Нет данных о датах создания сообществ</p>
        </div>
        <div class="chart-info">
            <div class="info-row">
                <span>Всего сообществ:</span>
                <strong>{{ groupsAgeTimeline.total }}</strong>
            </div>
            <div class="info-row">
                <span>Групп:</span>
                <strong class="groups-color">{{ groupsAgeTimeline.totalGroups }}</strong>
            </div>
            <div class="info-row">
                <span>Каналов:</span>
                <strong class="channels-color">{{ groupsAgeTimeline.totalChannels }}</strong>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-wrapper {
    width: 100%;
}

.chart-header {
    margin-bottom: 20px;
}

.title-row {
    display: flex;
    justify-content: center;
    align-items: end;
    gap: 10px;
}

.chart-title {
    color: #e3e2e2;
    font-size: 24px;
    text-align: center;
    line-height: 1.2;
    margin: 0;
}

.chart-container {
    width: 100%;
    height: 350px;
    position: relative;
}

.no-data {
    text-align: center;
    padding: 60px 20px;
    color: #7f8c8d;
}

.no-data p {
    font-size: 16px;
}

.chart-info {
    margin-top: 20px;
    display: flex;
    gap: 30px;
    padding: 15px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 3px;
    border-left: 3px solid #3498db;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #bdc3c7;
    font-size: 14px;
}

.info-row strong {
    color: #3498db;
    font-size: 16px;
}

.groups-color {
    color: rgba(204, 100, 245, 1) !important;
}

.channels-color {
    color: rgba(100, 245, 134, 1) !important;
}

@media (max-width: 768px) {
    .chart-container {
        height: 300px;
    }

    .chart-title {
        font-size: 18px;
        line-height: 1.4;
    }

    .title-row {
        flex-wrap: wrap;
    }

    .chart-info {
        flex-direction: column;
        gap: 10px;
    }
}
</style>
