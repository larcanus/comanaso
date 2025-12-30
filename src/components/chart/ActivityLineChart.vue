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

const { activityTimeline } = useDialogAnalytics();

const chartData = computed(() => ({
    labels: activityTimeline.value.labels,
    datasets: [
        {
            label: 'Входящие',
            data: activityTimeline.value.incoming,
            borderColor: '#64f586',
            backgroundColor: 'rgba(100, 245, 134, 0.1)',
            tension: 0.4,
            fill: true,
        },
        {
            label: 'Исходящие',
            data: activityTimeline.value.outgoing,
            borderColor: '#64adf5',
            backgroundColor: 'rgba(100, 173, 245, 0.1)',
            tension: 0.4,
            fill: true,
        },
    ],
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    scales: {
        x: {
            ticks: {
                color: '#e3e2e2',
                maxRotation: 45,
                minRotation: 45,
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: '#e3e2e2',
                stepSize: 1,
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
        },
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#e3e2e2',
                padding: 15,
                usePointStyle: true,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
                footer: function (tooltipItems) {
                    const incoming = tooltipItems[0]?.parsed.y || 0;
                    const outgoing = tooltipItems[1]?.parsed.y || 0;
                    const total = incoming + outgoing;
                    return `Всего: ${total}`;
                },
            },
        },
    },
};

const totalMessages = computed(() => {
    const incoming = activityTimeline.value.incoming.reduce((sum, val) => sum + val, 0);
    const outgoing = activityTimeline.value.outgoing.reduce((sum, val) => sum + val, 0);
    return { incoming, outgoing, total: incoming + outgoing };
});

const chartInfo = CHART_DESCRIPTIONS.activity;
</script>

<template>
    <div class="chart-container">
        <div class="chart-header">
            <h2 class="section-title">Активность за 30 дней</h2>
            <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
        </div>

        <div class="stats-summary">
            <div class="stat-item">
                <span class="stat-label">Входящие:</span>
                <span class="stat-value incoming">{{ totalMessages.incoming }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Исходящие:</span>
                <span class="stat-value outgoing">{{ totalMessages.outgoing }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Всего:</span>
                <span class="stat-value total">{{ totalMessages.total }}</span>
            </div>
        </div>

        <div class="chart-wrapper">
            <div class="chart-canvas">
                <Line :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    margin: 30px 0;
}

.chart-header {
    display: flex;
    justify-content: center;
    align-items: end;
    margin-bottom: 20px;
    gap: 10px;
}

.section-title {
    color: #e3e2e2;
    font-size: 24px;
    text-align: center;
    line-height: 1.2;
}

.stats-summary {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.stat-label {
    color: #999;
    font-size: 14px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
}

.stat-value.incoming {
    color: #64f586;
}

.stat-value.outgoing {
    color: #64adf5;
}

.stat-value.total {
    color: #ff9800;
}

.chart-wrapper {
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid #364fa1;
    border-radius: 3px;
    padding: 30px;
}

.chart-canvas {
    width: 100%;
    height: 400px;
}

@media (max-width: 750px) {
    .stats-summary {
        gap: 15px;
    }

    .stat-value {
        font-size: 20px;
    }

    .chart-wrapper {
        padding: 20px;
    }

    .chart-canvas {
        height: 300px;
    }
}
</style>
