<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const { dialogTypes, getDialogTypesDescription } = useDialogAnalytics();

const chartData = computed(() => ({
    labels: dialogTypes.value.labels,
    datasets: [
        {
            data: dialogTypes.value.data,
            backgroundColor: dialogTypes.value.colors,
            borderWidth: 2,
            borderColor: '#1e1e1e',
        },
    ],
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#e3e2e2',
                padding: 15,
                font: {
                    size: 13,
                },
            },
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data?.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                },
            },
        },
    },
};

const description = computed(() => getDialogTypesDescription());
</script>

<template>
    <div class="chart-container">
        <h2 class="section-title">Типы диалогов</h2>
        <div class="chart-wrapper">
            <div class="chart-canvas">
                <Pie :data="chartData" :options="chartOptions" />
            </div>
        </div>
        <div class="chart-description">
            <p>{{ description }}</p>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    margin: 30px 0;
}

.section-title {
    color: #e3e2e2;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}

.chart-wrapper {
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid #364fa1;
    border-radius: 3px;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart-canvas {
    width: 100%;
    max-width: 500px;
    height: 400px;
}

.chart-description {
    margin-top: 20px;
    padding: 20px;
    background: rgba(54, 79, 161, 0.1);
    border-radius: 3px;
    text-align: center;
}

.chart-description p {
    color: #e3e2e2;
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
}

@media (max-width: 750px) {
    .chart-wrapper {
        padding: 20px;
    }

    .chart-canvas {
        height: 300px;
    }

    .chart-description p {
        font-size: 14px;
    }
}
</style>
