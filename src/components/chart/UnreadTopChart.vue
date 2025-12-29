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

const { topUnread } = useDialogAnalytics();

const hasData = computed(() => topUnread.value.length > 0);

const chartData = computed(() => ({
    labels: topUnread.value.map((d) => d.name),
    datasets: [
        {
            label: 'Обычные',
            data: topUnread.value.map((d) => d.unreadCount - d.unreadMentions - d.unreadReactions),
            backgroundColor: '#64adf5',
        },
        {
            label: 'Упоминания',
            data: topUnread.value.map((d) => d.unreadMentions),
            backgroundColor: '#ff9800',
        },
        {
            label: 'Реакции',
            data: topUnread.value.map((d) => d.unreadReactions),
            backgroundColor: '#ec6060',
        },
    ],
}));

const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            stacked: true,
            ticks: {
                color: '#e3e2e2',
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
        },
        y: {
            stacked: true,
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: 12,
                },
            },
            grid: {
                display: false,
            },
        },
    },
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#e3e2e2',
                padding: 15,
            },
        },
        tooltip: {
            callbacks: {
                footer: function (tooltipItems) {
                    const index = tooltipItems[0].dataIndex;
                    const dialog = topUnread.value[index];
                    return `Тип: ${getTypeLabel(dialog.type)}`;
                },
            },
        },
    },
};

function getTypeLabel(type) {
    const labels = {
        user: 'Личный',
        bot: 'Бот',
        group: 'Группа',
        supergroup: 'Супергруппа',
        channel: 'Канал',
    };
    return labels[type] || type;
}

const chartInfo = CHART_DESCRIPTIONS.topUnread;
</script>

<template>
    <div class="chart-container">
        <div class="chart-header">
            <h2 class="section-title">ТОП-10 непрочитанных</h2>
            <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
        </div>

        <div v-if="!hasData" class="empty-state">
            <p>Нет непрочитанных сообщений!</p>
            <p class="hint">Вы прочитали все диалоги</p>
        </div>

        <div v-else class="chart-wrapper">
            <div class="chart-canvas">
                <Bar :data="chartData" :options="chartOptions" />
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
    height: 500px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    background: rgba(46, 204, 113, 0.1);
    border-radius: 3px;
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

@media (max-width: 768px) {
    .chart-header {
        flex-wrap: wrap;
    }

    .chart-canvas {
        height: 400px;
    }
}
</style>
