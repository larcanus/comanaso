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

const { draftsTimeline } = useDialogAnalytics();

const chartData = computed(() => {
    if (!draftsTimeline.value || draftsTimeline.value.data.length === 0) {
        return null;
    }

    return {
        labels: draftsTimeline.value.labels,
        datasets: [
            {
                label: 'Черновики',
                data: draftsTimeline.value.data,
                borderColor: 'rgba(155, 89, 182, 1)',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(155, 89, 182, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e3e2e2',
            borderColor: 'rgba(155, 89, 182, 0.5)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: function (context) {
                    return `Черновиков: ${context.parsed.y}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: 11,
                },
                maxRotation: 45,
                minRotation: 45,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: 12,
                },
                stepSize: 1,
            },
        },
    },
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

const avgDraftsPerDay = computed(() => {
    if (!draftsTimeline.value || draftsTimeline.value.data.length === 0) return 0;
    const sum = draftsTimeline.value.data.reduce((a, b) => a + b, 0);
    return (sum / draftsTimeline.value.data.length).toFixed(1);
});
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <h2 class="chart-title">Таймлайн черновиков</h2>
            <div v-if="draftsTimeline && draftsTimeline.total > 0" class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Всего:</span>
                    <span class="stat-value">{{ draftsTimeline.total }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Среднее/день:</span>
                    <span class="stat-value">{{ avgDraftsPerDay }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Старейший:</span>
                    <span class="stat-value">{{ formatDate(draftsTimeline.oldest) }}</span>
                </div>
            </div>
        </div>

        <div v-if="chartData" class="chart-canvas">
            <Line :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="empty-state">
            <p>Нет черновиков для отображения</p>
        </div>
    </div>
</template>

<style scoped>
.chart-wrapper {
    padding: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.chart-header {
    margin-bottom: 25px;
}

.chart-title {
    font-size: 24px;
    color: #ffffff;
    margin: 0 0 20px 0;
    text-align: center;
}

.stats-summary {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.stat-label {
    font-size: 12px;
    color: #95a5a6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #9b59b6;
}

.chart-canvas {
    width: 100%;
    height: 350px;
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
    padding: 20px;
}

.empty-state {
    background: rgba(155, 89, 182, 0.1);
    border: 2px dashed rgba(155, 89, 182, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    color: #e3e2e2;
}

@media (max-width: 750px) {
    .chart-wrapper {
        padding: 20px;
    }

    .chart-canvas {
        height: 300px;
    }

    .stats-summary {
        gap: 15px;
    }
}
</style>