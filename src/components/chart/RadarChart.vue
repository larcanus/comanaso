<script setup>
import { computed } from 'vue';
import { Radar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const { participationProfile } = useDialogAnalytics();

const chartData = computed(() => {
    if (!participationProfile.value || participationProfile.value.data.length === 0) {
        return null;
    }

    return {
        labels: participationProfile.value.labels,
        datasets: [
            {
                label: 'Профиль участия',
                data: participationProfile.value.data,
                backgroundColor: 'rgba(52, 152, 219, 0.3)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(52, 152, 219, 1)',
                pointRadius: 5,
                pointHoverRadius: 7,
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
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e3e2e2',
            borderColor: 'rgba(52, 152, 219, 0.5)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: function (context) {
                    const value = context.parsed.r;
                    const percentage = participationProfile.value.percentages[context.dataIndex];
                    return `${value} диалогов (${percentage}%)`;
                },
            },
        },
    },
    scales: {
        r: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.2)',
            },
            angleLines: {
                color: 'rgba(255, 255, 255, 0.2)',
            },
            pointLabels: {
                color: '#e3e2e2',
                font: {
                    size: 13,
                    weight: '500',
                },
            },
            ticks: {
                color: '#95a5a6',
                backdropColor: 'transparent',
                font: {
                    size: 11,
                },
            },
        },
    },
};

const maxCategory = computed(() => {
    if (!participationProfile.value || participationProfile.value.data.length === 0) return null;
    const maxIndex = participationProfile.value.data.indexOf(
        Math.max(...participationProfile.value.data)
    );
    return {
        name: participationProfile.value.labels[maxIndex],
        value: participationProfile.value.data[maxIndex],
        percentage: participationProfile.value.percentages[maxIndex],
    };
});
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <h2 class="chart-title">Профиль участия</h2>
            <div v-if="maxCategory" class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Максимум:</span>
                    <span class="stat-value">{{ maxCategory.name }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Значение:</span>
                    <span class="stat-value"
                        >{{ maxCategory.value }} ({{ maxCategory.percentage }}%)</span
                    >
                </div>
            </div>
        </div>

        <div v-if="chartData" class="chart-canvas">
            <Radar :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="empty-state">
            <p>Недостаточно данных для профиля</p>
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
    color: #3498db;
}

.chart-canvas {
    width: 100%;
    height: 400px;
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
    padding: 20px;
}

.empty-state {
    background: rgba(52, 152, 219, 0.1);
    border: 2px dashed rgba(52, 152, 219, 0.3);
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
        height: 350px;
    }
}
</style>
