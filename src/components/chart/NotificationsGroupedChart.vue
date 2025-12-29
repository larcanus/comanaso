<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import ChartInfoButton from '@/components/common/ChartInfoButton.vue';
import { CHART_DESCRIPTIONS } from '@/constants/chartDescriptions.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { notificationsData } = useDialogAnalytics();

const chartData = computed(() => ({
    labels: ['Личные', 'Группы', 'Каналы'],
    datasets: [
        {
            label: 'Включены (со звуком)',
            data: notificationsData.value.enabled,
            backgroundColor: 'rgba(100, 245, 134, 0.7)',
            borderColor: 'rgba(100, 245, 134, 1)',
            borderWidth: 1,
        },
        {
            label: 'Беззвучный режим',
            data: notificationsData.value.silent,
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1,
        },
        {
            label: 'Выключены',
            data: notificationsData.value.muted,
            backgroundColor: 'rgba(236, 96, 96, 0.7)',
            borderColor: 'rgba(236, 96, 96, 1)',
            borderWidth: 1,
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
                    return `${context.dataset.label}: ${context.parsed.y} диалогов`;
                },
            },
        },
    },
    scales: {
        x: {
            stacked: false,
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
            stacked: false,
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
};

const chartInfo = CHART_DESCRIPTIONS.notifications;
</script>

<template>
    <div class="chart-container">
        <div class="chart-header">
            <h2 class="section-title">Настройки уведомлений</h2>
            <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
        </div>
        <div class="chart-wrapper">
            <div class="chart-canvas">
                <Bar :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
}

.section-title {
    color: #e3e2e2;
    font-size: 24px;
    margin: 0;
}

.chart-wrapper {
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid #364fa1;
    border-radius: 3px;
    padding: 30px;
}

.chart-canvas {
    height: 400px;
}

@media (max-width: 768px) {
    .chart-header {
        flex-wrap: wrap;
    }

    .chart-canvas {
        height: 300px;
    }
}
</style>
