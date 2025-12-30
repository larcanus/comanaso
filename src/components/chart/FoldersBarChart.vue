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

const { folderDistribution } = useDialogAnalytics();

const chartData = computed(() => {
    if (!folderDistribution.value || folderDistribution.value.length === 0) {
        return null;
    }

    // Сортируем папки по количеству диалогов (по убыванию)
    const sorted = [...folderDistribution.value].sort((a, b) => b.count - a.count);

    return {
        labels: sorted.map((folder) => folder.name),
        datasets: [
            {
                label: 'Всего диалогов',
                data: sorted.map((folder) => folder.count),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
            },
            {
                label: 'Непрочитанные',
                data: sorted.map((folder) => folder.unread),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
            },
        ],
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#e3e2e2',
                font: {
                    size: 14,
                    weight: '500',
                },
                padding: 15,
            },
        },
        title: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e3e2e2',
            borderColor: 'rgba(54, 162, 235, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
                label: function (context) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y;
                    return `${label}: ${value}`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: 12,
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
                stepSize: 5,
            },
        },
    },
};

const totalDialogs = computed(() => {
    if (!folderDistribution.value) return 0;
    return folderDistribution.value.reduce((sum, folder) => sum + folder.count, 0);
});

const totalUnread = computed(() => {
    if (!folderDistribution.value) return 0;
    return folderDistribution.value.reduce((sum, folder) => sum + folder.unread, 0);
});

const chartInfo = CHART_DESCRIPTIONS.folders;
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <div class="header-top">
                <h2 class="chart-title">Распределение по папкам</h2>
                <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
            </div>
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Папок:</span>
                    <span class="stat-value">{{ folderDistribution?.length || 0 }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Диалогов:</span>
                    <span class="stat-value">{{ totalDialogs }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Непрочитанных:</span>
                    <span class="stat-value unread">{{ totalUnread }}</span>
                </div>
            </div>
        </div>

        <div v-if="chartData" class="chart-canvas">
            <Bar :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="empty-state">
            <p>Данные по папкам отсутствуют</p>
            <p class="hint">Организуйте диалоги в папки для удобства</p>
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

.header-top {
    display: flex;
    justify-content: center;
    align-items: end;
    margin-bottom: 20px;
    gap: 10px;
}

.chart-title {
    font-size: 24px;
    color: #ffffff;
    margin: 0;
    line-height: 1.2;
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
    font-size: 24px;
    font-weight: 700;
    color: #3498db;
}

.stat-value.unread {
    color: #e74c3c;
}

.chart-canvas {
    width: 100%;
    height: 400px;
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
}

.empty-state {
    background: rgba(52, 152, 219, 0.1);
    border: 2px dashed rgba(52, 152, 219, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
}

.empty-state p {
    color: #e3e2e2;
    font-size: 18px;
    margin: 10px 0;
}

.empty-state .hint {
    font-size: 14px;
    color: #999;
}

@media (max-width: 750px) {
    .chart-wrapper {
        padding: 20px;
    }

    .header-top {
        flex-wrap: wrap;
    }

    .stats-summary {
        gap: 15px;
    }

    .stat-value {
        font-size: 20px;
    }

    .chart-canvas {
        height: 350px;
    }
}
</style>
