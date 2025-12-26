<script setup>
import { computed } from 'vue';
import { Bubble } from 'vue-chartjs';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const { communitiesData } = useDialogAnalytics();

const chartData = computed(() => {
    const groups = communitiesData.value.filter((d) => d.type === 'group');
    const supergroups = communitiesData.value.filter((d) => d.type === 'supergroup');
    const channels = communitiesData.value.filter((d) => d.type === 'channel');

    return {
        datasets: [
            {
                label: 'Группы',
                data: groups,
                backgroundColor: 'rgba(204, 100, 245, 0.6)',
                borderColor: 'rgba(204, 100, 245, 1)',
                borderWidth: 1,
            },
            {
                label: 'Супергруппы',
                data: supergroups,
                backgroundColor: 'rgb(165,112,42)',
                borderColor: 'rgb(245,167,66)',
                borderWidth: 1,
            },
            {
                label: 'Каналы',
                data: channels,
                backgroundColor: 'rgba(100, 245, 134, 0.6)',
                borderColor: 'rgba(100, 245, 134, 1)',
                borderWidth: 1,
            },
        ],
    };
});

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#ecf0f1',
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            titleColor: '#ecf0f1',
            bodyColor: '#bdc3c7',
            borderColor: 'rgba(52, 152, 219, 0.5)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: (context) => {
                    const point = context.raw;
                    return [
                        `${point.name}`,
                        `Участников: ${point.x.toLocaleString()}`,
                        `Неактивен: ${point.y} дн.`,
                        `Непрочитанных: ${point.unreadCount}`,
                    ];
                },
            },
        },
    },
    scales: {
        x: {
            type: 'linear',
            position: 'bottom',
            title: {
                display: true,
                text: 'Количество участников',
                color: '#ecf0f1',
                font: {
                    size: 13,
                    weight: 'bold',
                },
            },
            ticks: {
                color: '#bdc3c7',
                callback: (value) => {
                    if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}K`;
                    }
                    return value;
                },
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
            },
        },
        y: {
            title: {
                display: true,
                text: 'Дней с последнего сообщения',
                color: '#ecf0f1',
                font: {
                    size: 13,
                    weight: 'bold',
                },
            },
            ticks: {
                color: '#bdc3c7',
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
            },
        },
    },
}));

const summary = computed(() => {
    const total = communitiesData.value.length;
    if (total === 0) return 'Нет данных о сообществах';

    const avgParticipants = communitiesData.value.reduce((sum, d) => sum + d.x, 0) / total;
    const avgInactive = communitiesData.value.reduce((sum, d) => sum + d.y, 0) / total;

    return `${total} сообществ. Средний размер: ${Math.round(avgParticipants)} участников. Средняя неактивность: ${Math.round(avgInactive)} дней`;
});

// Функция getPointColor больше не используется, цвета заданы в datasets
</script>

<template>
    <div class="communities-bubble-chart">
        <div class="chart-header">
            <h3 class="chart-title">Сообщества: Размер vs Активность</h3>
            <p class="chart-description">{{ summary }}</p>
        </div>

        <div class="chart-container">
            <Bubble v-if="communitiesData.length > 0" :data="chartData" :options="chartOptions" />
            <div v-else class="no-data">
                <p>Нет данных о сообществах</p>
            </div>
        </div>

        <div class="chart-legend-info">
            <div class="legend-item">
                <span class="legend-marker" style="background: rgba(204, 100, 245, 0.6)"></span>
                <span>Группы (до 200 чел.)</span>
            </div>
            <div class="legend-item">
                <span class="legend-marker" style="background: rgb(245,167,66)"></span>
                <span>Супергруппы (до 200K)</span>
            </div>
            <div class="legend-item">
                <span class="legend-marker" style="background: rgba(100, 245, 134, 0.6)"></span>
                <span>Каналы</span>
            </div>
            <div class="legend-note">
                * Размер пузырька = количество непрочитанных сообщений
            </div>
        </div>
    </div>
</template>

<style scoped>
.communities-bubble-chart {
    width: 100%;
}

.chart-header {
    margin-bottom: 20px;
}

.chart-title {
    color: #ecf0f1;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.icon {
    font-size: 24px;
}

.chart-description {
    color: #95a5a6;
    font-size: 14px;
    margin: 0;
}

.chart-container {
    height: 400px;
    position: relative;
}

.no-data {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    gap: 15px;
}

.no-data .icon {
    font-size: 48px;
    opacity: 0.5;
}

.chart-legend-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #bdc3c7;
    font-size: 13px;
}

.legend-marker {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.legend-note {
    color: #7f8c8d;
    font-size: 12px;
    font-style: italic;
    margin-left: auto;
}

@media (max-width: 768px) {
    .chart-container {
        height: 300px;
    }

    .chart-title {
        font-size: 18px;
    }

    .legend-note {
        margin-left: 0;
        width: 100%;
    }
}
</style>
