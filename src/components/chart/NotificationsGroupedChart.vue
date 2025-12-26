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
</script>

<template>
    <div class="chart-wrapper">
        <h3 class="chart-title">
            <i class="fas fa-bell"></i>
            Настройки уведомлений
        </h3>
        <div v-if="notificationsData.total > 0" class="chart-container">
            <Bar :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
            <i class="fas fa-bell-slash"></i>
            <p>Нет данных о настройках уведомлений</p>
        </div>
        <div class="chart-summary">
            <p>
                Всего: <strong>{{ notificationsData.total }}</strong> диалогов с настройками
                уведомлений
            </p>
        </div>
    </div>
</template>

<style scoped>
.chart-wrapper {
    width: 100%;
}

.chart-title {
    color: #ecf0f1;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.chart-title i {
    color: #3498db;
}

.chart-container {
    width: 100%;
    height: 400px;
    position: relative;
}

.no-data {
    text-align: center;
    padding: 60px 20px;
    color: #7f8c8d;
}

.no-data i {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
}

.no-data p {
    font-size: 16px;
}

.chart-summary {
    margin-top: 15px;
    padding: 15px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 3px;
    border-left: 3px solid #3498db;
}

.chart-summary p {
    color: #bdc3c7;
    font-size: 14px;
    margin: 0;
}

.chart-summary strong {
    color: #3498db;
}

@media (max-width: 768px) {
    .chart-container {
        height: 300px;
    }

    .chart-title {
        font-size: 18px;
    }
}
</style>
