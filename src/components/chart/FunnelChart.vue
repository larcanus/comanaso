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

const { readingFunnel } = useDialogAnalytics();

const chartData = computed(() => {
    if (!readingFunnel.value || readingFunnel.value.data.length === 0) {
        return null;
    }

    return {
        labels: readingFunnel.value.labels,
        datasets: [
            {
                label: 'Количество диалогов',
                data: readingFunnel.value.data,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(231, 76, 60, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };
});

const isMobile = window.innerWidth <= 410;

const chartOptions = {
    indexAxis: 'y', // Горизонтальная воронка
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
            titleColor: '#ffffff',
            bodyColor: '#e3e2e2',
            borderColor: '#364fa1',
            borderWidth: 1,
            padding: isMobile ? 8 : 12,
            displayColors: false,
            bodyFont: {
                size: isMobile ? 11 : 13,
            },
            titleFont: {
                size: isMobile ? 12 : 14,
            },
            callbacks: {
                label: function (context) {
                    const value = context.parsed.x;
                    const index = context.dataIndex;
                    const fromTotal = readingFunnel.value.percentagesFromTotal[index];
                    const conversion = readingFunnel.value.conversionRates[index];

                    if (index === 0) {
                        return `${value} диалогов (100%)`;
                    }

                    return [
                        `Количество: ${value} диалогов`,
                        `От всех: ${fromTotal}%`,
                        `Конверсия с пред. этапа: ${conversion}%`,
                    ];
                },
            },
        },
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: isMobile ? 10 : 12,
                },
            },
        },
        y: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: isMobile ? 11 : 13,
                    weight: 'bold',
                },
                autoSkip: false,
                callback: function (value) {
                    const label = this.getLabelForValue(value);
                    if (isMobile && label.length > 15) {
                        return label.substring(0, 12) + '...';
                    }
                    return label;
                },
            },
        },
    },
};

const conversionRate = computed(() => {
    return readingFunnel.value?.totalConversion || 0;
});

const dropoffStats = computed(() => {
    if (!readingFunnel.value || readingFunnel.value.data.length < 4) return [];

    const data = readingFunnel.value.data;
    return [
        {
            stage: 'Всего → Непрочитанные',
            kept: data[1],
            lost: data[0] - data[1],
            rate: readingFunnel.value.conversionRates[1],
        },
        {
            stage: 'Непрочитанные → Упоминания',
            kept: data[2],
            lost: data[1] - data[2],
            rate: readingFunnel.value.conversionRates[2],
        },
        {
            stage: 'Упоминания → Реакции',
            kept: data[3],
            lost: data[2] - data[3],
            rate: readingFunnel.value.conversionRates[3],
        },
    ];
});
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <h2 class="chart-title">Воронка прочтения</h2>
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Общая конверсия:</span>
                    <span class="stat-value">{{ conversionRate }}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Всего диалогов:</span>
                    <span class="stat-value">{{ readingFunnel.data[0] }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Дошли до реакций:</span>
                    <span class="stat-value">{{ readingFunnel.data[3] }}</span>
                </div>
            </div>
        </div>

        <div v-if="chartData" class="chart-canvas">
            <Bar :data="chartData" :options="chartOptions" />
        </div>

        <!-- Детальная статистика по этапам -->
        <div v-if="dropoffStats.length > 0" class="dropoff-details">
            <h3 class="details-title">Детализация по этапам:</h3>
            <div class="dropoff-list">
                <div v-for="(stat, index) in dropoffStats" :key="index" class="dropoff-item">
                    <div class="dropoff-stage">{{ stat.stage }}</div>
                    <div class="dropoff-stats">
                        <span class="kept">✓ Сохранено: {{ stat.kept }}</span>
                        <span class="lost">✗ Потеряно: {{ stat.lost }}</span>
                        <span class="rate">Конверсия: {{ stat.rate }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="empty-state">
            <p>Недостаточно данных для воронки</p>
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
    font-size: 16px;
    font-weight: 700;
    color: #3498db;
}

/* Адаптивность для мобильных */
@media (max-width: 410px) {
    .chart-wrapper {
        padding: 15px;
    }

    .chart-title {
        font-size: 18px;
        margin-bottom: 15px;
    }

    .stats-summary {
        flex-direction: column;
        gap: 15px;
    }

    .stat-item {
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
    }

    .stat-label {
        font-size: 11px;
    }

    .stat-value {
        font-size: 14px;
    }
}

.chart-canvas {
    width: 100%;
    height: 400px;
    margin-bottom: 30px;
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
    padding: 20px;
}

.dropoff-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-top: 30px;
}

.details-title {
    font-size: 18px;
    color: #ffffff;
    margin: 0 0 15px 0;
}

.dropoff-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.dropoff-item {
    padding: 15px;
    background: rgba(52, 152, 219, 0.1);
    border-left: 3px solid #3498db;
    border-radius: 4px;
}

.dropoff-stage {
    font-size: 14px;
    color: #ffffff;
    font-weight: 600;
    margin-bottom: 8px;
}

.dropoff-stats {
    display: flex;
    gap: 20px;
    font-size: 13px;
}

.dropoff-stats .kept {
    color: #2ecc71;
}

.dropoff-stats .lost {
    color: #e74c3c;
}

.dropoff-stats .rate {
    color: #f39c12;
    font-weight: 600;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #95a5a6;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
}

@media (max-width: 410px) {
    .dropoff-details {
        padding: 12px;
        gap: 10px;
        margin-top: 20px;
    }

    .dropoff-item {
        padding: 10px;
    }

    .dropoff-stage {
        font-size: 12px;
        margin-bottom: 6px;
    }

    .dropoff-stats {
        flex-direction: column;
        gap: 6px;
        font-size: 11px;
    }
}

@media (max-width: 750px) {
    .chart-wrapper {
        padding: 20px;
    }

    .chart-canvas {
        height: 300px;
    }
}
</style>
